# FitOnTrack - Backend API

API REST do FitOnTrack, desenvolvida com Node.js, Express, Sequelize e MySQL.

## Como executar

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar o ambiente
Crie o arquivo `.env` com base em `.env.example`.

Campos principais:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_DIALECT`
- `SESSION_SECRET`
- `PORT`
- `CORS_ALLOWED_ORIGINS`

### 3. Criar o banco de dados
Execute o script `data/banco.sql` no MySQL para criar a estrutura inicial.

### 4. Iniciar o servidor
```bash
npm start
```

O backend sobe em `http://localhost:3000` por padrão.

## Seed automático

Ao iniciar o servidor, o backend executa a sincronização das tabelas e popula automaticamente os dados padrão:

- gêneros
- objetivos
- grupos musculares
- exercícios com imagens externas preservadas
- dados de teste de alunos e personais
- treinos e vínculos iniciais

O seed também é idempotente, então não duplica registros já existentes.

### Logins de teste
- Aluno: `murilo@email.com` / `senha123`
- Aluna: `ana@email.com` / `senha123`
- Personal: `joao@email.com` / `senha123`
- Personal: `carla@email.com` / `senha123`

## Recursos principais

- Autenticação separada para aluno e personal
- Sessão com logout via `/api/auth/logout`
- Upload de imagem para perfis e exercícios
- CRUD de alunos, personais, exercícios, treinos, avaliações, gêneros, objetivos e grupos musculares
- Frontend servido pelo próprio Express

## Endpoints principais

### Autenticação
- `POST /auth/aluno`
- `POST /auth/personal`
- `GET /auth/session`
- `POST /auth/logout`

### Alunos
- `GET /alunos`
- `GET /alunos/:id`
- `POST /alunos`
- `PATCH /alunos/:id`
- `DELETE /alunos/:id`

### Personais
- `GET /personais`
- `GET /personais/:id`
- `POST /personais`
- `PATCH /personais/:id`
- `DELETE /personais/:id`

### Exercícios
- `GET /exercicios`
- `POST /exercicios`
- `DELETE /exercicios/:id`

### Treinos
- `GET /treinos`
- `POST /treinos`
- `DELETE /treinos/:id`

### Outros recursos
- `GET /objetivos`
- `GET /generos`
- `GET /grupos-musculares`
- `GET /avaliacoes`
- `POST /avaliacoes`
- `POST /execucao`
- `POST /execucao-exercicio`
- `POST /treino-exercicios`

## Testes rápidos

Exemplo de criação de aluno:
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "senha123",
  "genero_id": 1,
  "objetivo_id": 2
}
```

Exemplo de login:
```json
{
  "email": "murilo@email.com",
  "senha": "senha123"
}
```

## Estrutura do projeto

```text
backend/
├── app.js
├── seed.js
├── .env.example
├── config/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── utils/
└── data/
```

## Observações

- O arquivo `.env` não deve ser versionado.
- Em produção, configure um `SESSION_SECRET` forte e URLs de CORS compatíveis com o domínio publicado.
