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
    domingo_1 INTEGER NOT NULL,
    domingo_2 INTEGER NOT NULL,
    motivo TEXT NOT NULL DEFAULT '',
    observacoes TEXT,
    criado_em TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Migração para instalações antigas (silenciosa se a coluna já existir)
try {
  db.exec(`ALTER TABLE inscricoes ADD COLUMN motivo TEXT NOT NULL DEFAULT ''`);
} catch (_) {}

const insertStmt = db.prepare(`
  INSERT INTO inscricoes
    (nome, telefone, email, data_nascimento, domingo_1, domingo_2, motivo, observacoes)
  VALUES
    (@nome, @telefone, @email, @dataNascimento, @domingo1, @domingo2, @motivo, @observacoes)
`);

const listStmt = db.prepare(`
  SELECT id, nome, telefone, email, data_nascimento, domingo_1, domingo_2, motivo, observacoes, criado_em
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
