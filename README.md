# Paraliturgia — Inscrições do Retiro

Página web para inscrições do **Retiro Anual da Paraliturgia** (tema: *Que Seja Você*).

- **Página pública** (`/`) com o tema, lema, música, reflexão e formulário de inscrição.
- **API** que salva as inscrições em um banco SQLite.
- **Painel administrativo** (`/admin`) protegido por senha, com listagem por domingo e exportação em CSV.

## Rodando localmente

Você precisa de **Node.js 18+**.

```bash
cd paraliturgia-inscricoes
npm install
ADMIN_PASSWORD=escolha-uma-senha npm start
```

Depois abra:

- Formulário: <http://localhost:3000/>
- Admin: <http://localhost:3000/admin> (usuário fica em branco, senha é a que você definiu em `ADMIN_PASSWORD`)

## Variáveis de ambiente

| Variável         | Padrão                       | Para que serve                                                |
| ---------------- | ---------------------------- | ------------------------------------------------------------- |
| `PORT`           | `3000`                       | Porta HTTP. A Railway define automaticamente.                 |
| `ADMIN_PASSWORD` | `trocar-esta-senha`          | Senha do painel `/admin`. **Sempre defina em produção.**      |
| `DB_PATH`        | `./data/inscricoes.db`       | Arquivo SQLite. Em produção aponte para um **Volume**.        |

## Deploy no Railway

1. **Crie um repositório no GitHub** com o conteúdo da pasta `paraliturgia-inscricoes/`.
2. Entre em <https://railway.app>, clique em **New Project → Deploy from GitHub repo** e escolha o repositório.
3. Aguarde o primeiro build (Railway detecta o `package.json` e roda `npm install` + `npm start`).
4. Em **Variables**, adicione:
   - `ADMIN_PASSWORD` = a senha do painel
   - `DB_PATH` = `/data/inscricoes.db`
5. Em **Settings → Volumes**, clique em **New Volume** e monte em `/data`. Isso garante que as inscrições **não se percam** quando o serviço reiniciar.
6. Em **Settings → Networking**, clique em **Generate Domain** para receber uma URL pública (`https://seu-app.up.railway.app`).

Pronto. Compartilhe a URL com a paróquia e acesse `/admin` para acompanhar as inscrições.

> ⚠️ Se você **não configurar o volume**, o SQLite fica no disco efêmero — cada deploy zera as inscrições. Não pule esse passo.

## Estrutura de arquivos

```
paraliturgia-inscricoes/
├── server.js            # servidor Express + rotas
├── database.js          # setup do SQLite (better-sqlite3)
├── public/
│   ├── index.html       # página pública com tema e formulário
│   ├── admin.html       # painel administrativo
│   ├── styles.css       # estilos comuns
│   └── script.js        # validação + submit do formulário
├── data/                # banco SQLite (criado em runtime)
├── package.json
├── railway.json         # config do deploy no Railway
├── .env.example         # exemplo de variáveis
└── .gitignore
```

## Coleta de dados

O formulário guarda para cada inscrição:

- Nome completo
- Telefone / WhatsApp
- E-mail
- Data de nascimento
- Motivo para entrar / continuar na Pastoral (obrigatório, mínimo 20 caracteres)
- 2 domingos escolhidos (dos 4 disponíveis)
- Observações (opcional)
- Data/hora da inscrição

No admin você vê tudo em tabela, agrupado por domingo, e pode baixar em CSV para abrir no Excel.

> Sobre o 5º domingo: quando ele acontece, todos os grupos se reúnem para servir juntos — isso já está avisado no formulário.
