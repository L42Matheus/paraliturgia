const path = require('node:path');
const fs = require('node:fs');
const Database = require('better-sqlite3');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'data', 'inscricoes.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS inscricoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    telefone TEXT NOT NULL,
    email TEXT NOT NULL,
    data_nascimento TEXT NOT NULL,
    bairro TEXT NOT NULL DEFAULT '',
    estado_civil TEXT NOT NULL DEFAULT '',
    batizado INTEGER NOT NULL DEFAULT 0,
    fez_primeira_comunhao INTEGER NOT NULL DEFAULT 0,
    primeira_comunhao TEXT NOT NULL DEFAULT '',
    fez_ejc INTEGER NOT NULL DEFAULT 0,
    ejc_local TEXT NOT NULL DEFAULT '',
    fez_crisma INTEGER NOT NULL DEFAULT 0,
    crisma_local TEXT NOT NULL DEFAULT '',
    outra_pastoral INTEGER NOT NULL DEFAULT 0,
    outra_pastoral_qual TEXT NOT NULL DEFAULT '',
    domingo_1 INTEGER NOT NULL,
    domingo_2 INTEGER NOT NULL,
    ciente_compromisso INTEGER NOT NULL DEFAULT 0,
    motivo TEXT NOT NULL DEFAULT '',
    observacoes TEXT,
    criado_em TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const novasColunas = [
  ['motivo', "TEXT NOT NULL DEFAULT ''"],
  ['bairro', "TEXT NOT NULL DEFAULT ''"],
  ['estado_civil', "TEXT NOT NULL DEFAULT ''"],
  ['batizado', 'INTEGER NOT NULL DEFAULT 0'],
  ['fez_primeira_comunhao', 'INTEGER NOT NULL DEFAULT 0'],
  ['primeira_comunhao', "TEXT NOT NULL DEFAULT ''"],
  ['fez_ejc', 'INTEGER NOT NULL DEFAULT 0'],
  ['ejc_local', "TEXT NOT NULL DEFAULT ''"],
  ['fez_crisma', 'INTEGER NOT NULL DEFAULT 0'],
  ['crisma_local', "TEXT NOT NULL DEFAULT ''"],
  ['outra_pastoral', 'INTEGER NOT NULL DEFAULT 0'],
  ['outra_pastoral_qual', "TEXT NOT NULL DEFAULT ''"],
  ['ciente_compromisso', 'INTEGER NOT NULL DEFAULT 0'],
];
for (const [col, spec] of novasColunas) {
  try { db.exec(`ALTER TABLE inscricoes ADD COLUMN ${col} ${spec}`); } catch (_) {}
}

const insertStmt = db.prepare(`
  INSERT INTO inscricoes (
    nome, telefone, email, data_nascimento,
    bairro, estado_civil, batizado,
    fez_primeira_comunhao, primeira_comunhao,
    fez_ejc, ejc_local, fez_crisma, crisma_local,
    outra_pastoral, outra_pastoral_qual,
    domingo_1, domingo_2, ciente_compromisso,
    motivo, observacoes
  ) VALUES (
    @nome, @telefone, @email, @dataNascimento,
    @bairro, @estadoCivil, @batizado,
    @fezPrimeiraComunhao, @primeiraComunhao,
    @fezEjc, @ejcLocal, @fezCrisma, @crismaLocal,
    @outraPastoral, @outraPastoralQual,
    @domingo1, @domingo2, @cienteCompromisso,
    @motivo, @observacoes
  )
`);

const listStmt = db.prepare(`
  SELECT id, nome, telefone, email, data_nascimento,
         bairro, estado_civil, batizado,
         fez_primeira_comunhao, primeira_comunhao,
         fez_ejc, ejc_local, fez_crisma, crisma_local,
         outra_pastoral, outra_pastoral_qual,
         domingo_1, domingo_2, ciente_compromisso,
         motivo, observacoes, criado_em
  FROM inscricoes
  ORDER BY criado_em DESC
`);

const countStmt = db.prepare(`SELECT COUNT(*) as total FROM inscricoes`);

function criarInscricao(dados) {
  const result = insertStmt.run(dados);
  return result.lastInsertRowid;
}

function listarInscricoes() {
  return listStmt.all();
}

function totalInscricoes() {
  return countStmt.get().total;
}

module.exports = { criarInscricao, listarInscricoes, totalInscricoes };
