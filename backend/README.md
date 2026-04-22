# FitOnTrack - Backend API

## 📋 Descrição
API RESTful para sistema de gerenciamento de treinos e avaliações de fitness, desenvolvida com Node.js, Express e Sequelize.

## 🚀 Como executar

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar banco de dados
- Execute o script `data/banco.sql` no MySQL para criar as tabelas
- Verifique as configurações em `config/banco.js`

### 3. Popular banco com dados iniciais
```bash
node seed.js
```

### 4. Iniciar servidor
```bash
node app.js
```

O servidor estará rodando em `http://localhost:3000`

## 📊 Dados de Teste Criados pelo Seed

### Usuários para Login:
- **Aluno**: `murilo@email.com` / `senha123`
- **Personal**: `joao@email.com` / `senha123`

### Dados Criados:
- ✅ 2 gêneros (masculino, feminino)
- ✅ 3 objetivos (emagrecer, ganhar_massa, manter_saude)
- ✅ 6 grupos musculares (Peito, Perna, Bíceps, Tríceps, Costas, Ombros)
- ✅ 1 aluno (Murilo Borges)
- ✅ 1 personal (João Trainer - CREF: CREF12345)
- ✅ 6 exercícios com descrições
- ✅ 1 treino "Treino A - Peito e Pernas" com 3 exercícios
- ✅ 2 avaliações (aluno avaliando personal e vice-versa)

## 🔗 Endpoints da API

### Alunos
- `GET /alunos` - Listar todos
- `GET /alunos/:id` - Buscar por ID
- `POST /alunos` - Criar
- `PATCH /alunos/:id` - Atualizar
- `DELETE /alunos/:id` - Deletar
- `POST /auth/aluno` - Login

### Objetivos
- `GET /objetivos` - Listar todos
- `GET /objetivos/:id` - Buscar por ID
- `POST /objetivos` - Criar
- `PATCH /objetivos/:id` - Atualizar
- `DELETE /objetivos/:id` - Deletar

### Gêneros
- `GET /generos` - Listar todos
- `GET /generos/:id` - Buscar por ID
- `POST /generos` - Criar
- `PATCH /generos/:id` - Atualizar
- `DELETE /generos/:id` - Deletar

### Grupos Musculares
- `GET /grupos-musculares` - Listar todos
- `GET /grupos-musculares/:id` - Buscar por ID
- `POST /grupos-musculares` - Criar
- `PATCH /grupos-musculares/:id` - Atualizar
- `DELETE /grupos-musculares/:id` - Deletar

### Personais
- `GET /personais` - Listar todos
- `GET /personais/:id` - Buscar por ID
- `POST /personais` - Criar
- `PATCH /personais/:id` - Atualizar
- `DELETE /personais/:id` - Deletar
- `POST /auth/personal` - Login

### Exercícios
- `GET /exercicios` - Listar todos
- `POST /exercicios` - Criar
- `DELETE /exercicios/:id` - Deletar

### Treinos
- `GET /treinos` - Listar todos
- `POST /treinos` - Criar
- `DELETE /treinos/:id` - Deletar

### Treino-Exercícios
- `POST /treino-exercicios` - Adicionar exercício ao treino

### Avaliações
- `GET /avaliacoes` - Listar todas
- `POST /avaliacoes` - Criar avaliação

### Execução de Treinos
- `POST /execucao` - Iniciar execução
- `POST /execucao-exercicio` - Registrar exercício executado

## 🧪 Testando a API

Use Postman, Insomnia ou curl. Todos os endpoints POST/PATCH precisam de `Content-Type: application/json`.

### Exemplo de criação de aluno:
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "senha123",
  "genero_id": 1,
  "objetivo_id": 2
}
```

### Exemplo de login:
```json
{
  "email": "murilo@email.com",
  "senha": "senha123"
}
```

## 🏗️ Arquitetura

- **MVC Pattern**: Models, Controllers, Routes
- **ORM**: Sequelize para MySQL
- **Autenticação**: bcrypt para hash de senhas
- **Validações**: Sequelize validations
- **Relacionamentos**: Foreign keys e associações

## 📁 Estrutura do Projeto

```
FitOnTrack_cod/
├── app.js                 # Servidor principal
├── seed.js                # Script de seed
├── config/banco.js        # Conexão banco
├── models/                # Modelos Sequelize
├── controllers/           # Lógica de negócio
├── routes/               # Definição de rotas
├── data/banco.sql        # Schema do banco
└── package.json          # Dependências
```
