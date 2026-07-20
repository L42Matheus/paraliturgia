const path = require('node:path');
const express = require('express');
const {
  criarInscricao,
  listarInscricoes,
  totalInscricoes,
} = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'trocar-esta-senha';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/inscricao', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'inscricao.html'));
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, total: totalInscricoes() });
});

app.post('/api/inscricoes', (req, res) => {
  const body = req.body || {};
  const nome = (body.nome || '').trim();
  const telefone = (body.telefone || '').trim();
  const email = (body.email || '').trim().toLowerCase();
  const dataNascimento = (body.dataNascimento || '').trim();
  const motivo = (body.motivo || '').trim();
  const observacoes = (body.observacoes || '').trim();
  const domingos = Array.isArray(body.domingos)
    ? body.domingos.map(Number).filter((n) => Number.isInteger(n) && n >= 1 && n <= 4)
    : [];

  const erros = [];
  if (nome.length < 3) erros.push('Informe o nome completo.');
  if (telefone.replace(/\D/g, '').length < 10) erros.push('Informe um telefone válido.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) erros.push('Informe um e-mail válido.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dataNascimento)) erros.push('Informe a data de nascimento.');
  if (motivo.length < 20) erros.push('Conte-nos o motivo em pelo menos 20 caracteres.');
  const unicos = [...new Set(domingos)];
  if (unicos.length !== 2) erros.push('Escolha exatamente 2 domingos.');

  if (erros.length) {
    return res.status(400).json({ ok: false, erros });
  }

  const [domingo1, domingo2] = [...unicos].sort((a, b) => a - b);

  try {
    const id = criarInscricao({
      nome,
      telefone,
      email,
      dataNascimento,
      domingo1,
      domingo2,
      motivo,
      observacoes,
    });
    return res.status(201).json({ ok: true, id });
  } catch (err) {
    console.error('Falha ao salvar inscrição', err);
    return res.status(500).json({ ok: false, erros: ['Erro ao salvar. Tente novamente.'] });
  }
});

function basicAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, encoded] = header.split(' ');
  if (scheme === 'Basic' && encoded) {
    const decoded = Buffer.from(encoded, 'base64').toString('utf8');
    const idx = decoded.indexOf(':');
    const senha = idx >= 0 ? decoded.slice(idx + 1) : '';
    if (senha === ADMIN_PASSWORD) return next();
  }
  res.set('WWW-Authenticate', 'Basic realm="Admin Paraliturgia"');
  return res.status(401).send('Autenticação necessária');
}

app.get('/admin', basicAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/api/inscricoes', basicAuth, (req, res) => {
  res.json({ ok: true, inscricoes: listarInscricoes() });
});

app.get('/api/inscricoes.csv', basicAuth, (req, res) => {
  const inscricoes = listarInscricoes();
  const header = [
    'id',
    'nome',
    'telefone',
    'email',
    'data_nascimento',
    'domingo_1',
    'domingo_2',
    'motivo',
    'observacoes',
    'criado_em',
  ];
  const escape = (v) => {
    const s = v == null ? '' : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const linhas = [header.join(',')];
  for (const i of inscricoes) {
    linhas.push([
      i.id,
      i.nome,
      i.telefone,
      i.email,
      i.data_nascimento,
      i.domingo_1,
      i.domingo_2,
      i.motivo,
      i.observacoes,
      i.criado_em,
    ].map(escape).join(','));
  }
  const csv = '﻿' + linhas.join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="inscricoes.csv"');
  res.send(csv);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
