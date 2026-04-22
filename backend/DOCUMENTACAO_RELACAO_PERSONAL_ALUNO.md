# 📚 Documentação: Relação 1:N Personal-Aluno

## 🏗️ Arquitetura da Solução

```
PERSONAL (1) ----< (N) ALUNO
```

- **Um Personal pode ter vários Alunos**
- **Um Aluno pode ter apenas um Personal (ou nenhum)**
- **Integridade referencial garantida pelo banco**

---

## 🗄️ Modelo de Dados

### Tabela `alunos`

```sql
ALTER TABLE alunos ADD COLUMN personal_id INT NULL 
ADD CONSTRAINT fk_aluno_personal 
FOREIGN KEY (personal_id) REFERENCES personais(id) 
ON DELETE SET NULL ON UPDATE CASCADE;
```

**Campos importantes:**
- `id` (PK) - ID do aluno
- `personal_id` (FK, nullable) - ID do personal vinculado (NULL = sem personal)
- `email` (UNIQUE) - Email do aluno
- `nome` - Nome do aluno
- Outros campos existentes...

---

## 🔌 Endpoints da API

### ✅ ENDPOINTS DE ALUNO

#### 1. Listar Alunos Disponíveis (sem personal)

```http
GET /api/alunos/disponiveis
```

**Resposta (200 OK):**
```json
[
  {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@email.com",
    "genero_id": 1,
    "objetivo_id": 2,
    "personal_id": null,
    "genero": { "id": 1, "nome": "Masculino" },
    "objetivo": { "id": 2, "nome": "Ganho de massa" }
  },
  {
    "id": 3,
    "nome": "Maria Santos",
    "email": "maria@email.com",
    "genero_id": 2,
    "objetivo_id": 1,
    "personal_id": null,
    "genero": { "id": 2, "nome": "Feminino" },
    "objetivo": { "id": 1, "nome": "Perda de peso" }
  }
]
```

---

#### 2. Vincular Aluno a Personal

```http
POST /api/alunos/:id/vincular-personal
Content-Type: application/json

{
  "personal_id": 5
}
```

**Parâmetros:**
- `:id` - ID do aluno

**Body:**
- `personal_id` (required) - ID do personal

**Resposta (200 OK):**
```json
{
  "mensagem": "Aluno vinculado ao personal com sucesso",
  "aluno": {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@email.com",
    "personal_id": 5,
    "personal": {
      "id": 5,
      "nome": "Carlos Trainer",
      "especialidade": "Musculação"
    }
  }
}
```

**Erros possíveis:**
- `400` - `personal_id` não fornecido
- `404` - Aluno não encontrado
- `400` - Aluno já está vinculado a outro personal

---

#### 3. Desvincular Aluno do Personal

```http
DELETE /api/alunos/:id/desvincular-personal
```

**Resposta (200 OK):**
```json
{
  "mensagem": "Aluno desvinculado do personal com sucesso"
}
```

**Erros possíveis:**
- `404` - Aluno não encontrado
- `400` - Aluno não possui personal vinculado

---

### 👨‍🏫 ENDPOINTS DE PERSONAL

#### 1. Listar Alunos do Personal

```http
GET /api/personais/:id/alunos
```

**Parâmetros:**
- `:id` - ID do personal

**Resposta (200 OK):**
```json
[
  {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@email.com",
    "personal_id": 5,
    "altura": 1.75,
    "massa": 85.5,
    "objetivo_id": 2,
    "genero": { "id": 1, "nome": "Masculino" },
    "objetivo": { "id": 2, "nome": "Ganho de massa" }
  },
  {
    "id": 2,
    "nome": "Pedro Costa",
    "email": "pedro@email.com",
    "personal_id": 5,
    "altura": 1.80,
    "massa": 92.0,
    "objetivo_id": 1,
    "genero": { "id": 1, "nome": "Masculino" },
    "objetivo": { "id": 1, "nome": "Perda de peso" }
  }
]
```

---

#### 2. Vincular Aluno ao Personal

```http
POST /api/personais/:id/alunos/vincular
Content-Type: application/json

{
  "aluno_id": 3
}
```

**Parâmetros:**
- `:id` - ID do personal

**Body:**
- `aluno_id` (required) - ID do aluno a vincular

**Resposta (200 OK):**
```json
{
  "mensagem": "Aluno vinculado com sucesso",
  "aluno": {
    "id": 3,
    "nome": "Maria Santos",
    "email": "maria@email.com",
    "personal_id": 5
  }
}
```

**Erros possíveis:**
- `400` - `aluno_id` não fornecido
- `404` - Personal ou Aluno não encontrado
- `400` - Aluno já está vinculado a outro personal

---

#### 3. Desvincular Aluno do Personal

```http
DELETE /api/personais/:id/alunos/:aluno_id/desvincular
```

**Parâmetros:**
- `:id` - ID do personal
- `:aluno_id` - ID do aluno

**Resposta (200 OK):**
```json
{
  "mensagem": "Aluno desvinculado com sucesso"
}
```

**Erros possíveis:**
- `404` - Aluno não encontrado
- `403` - Aluno não está vinculado a este personal

---

## 💻 Exemplos de Uso (cURL)

### Listar alunos disponíveis
```bash
curl -X GET http://localhost:3000/api/alunos/disponiveis
```

### Vincular aluno a personal (via personal)
```bash
curl -X POST http://localhost:3000/api/personais/5/alunos/vincular \
  -H "Content-Type: application/json" \
  -d '{"aluno_id": 3}'
```

### Listar alunos do personal
```bash
curl -X GET http://localhost:3000/api/personais/5/alunos
```

### Desvincular aluno
```bash
curl -X DELETE http://localhost:3000/api/personais/5/alunos/3/desvincular
```

---

## 🔒 Boas Práticas & Segurança

### 1. **Integridade Referencial**
- ✅ Foreign key com ON DELETE SET NULL
- ✅ Validação de existência antes de vincular
- ✅ Verificação de propriedade antes de desvincular

### 2. **Validações**
```javascript
// ✅ Validação 1: Aluno não pode ter 2 personals
if (aluno.personal_id !== null) {
  return error("Aluno já vinculado");
}

// ✅ Validação 2: Verificar se personal existe
if (!personal) {
  return error("Personal não encontrado");
}

// ✅ Validação 3: Autorização
if (aluno.personal_id !== personal_id_do_usuario) {
  return error("Não autorizado");
}
```

### 3. **Senhas Excluídas**
```javascript
attributes: { exclude: ["senha"] }
```

### 4. **Relações Carregadas**
```javascript
include: ["personal", "genero", "objetivo"]
```

---

## 📱 Sugestões de Frontend

### Página: Escolher Aluno (Personal)

```html
<h2>Vincular Aluno</h2>

<!-- Combobox de alunos disponíveis -->
<select id="aluno-disponivel">
  <option value="">-- Selecione um aluno --</option>
  <!-- Preenchido com GET /api/alunos/disponiveis -->
</select>

<button onclick="vincularAluno()">Vincular</button>

<script>
async function vincularAluno() {
  const alunoId = document.querySelector("#aluno-disponivel").value;
  const personalId = getSession().user.id;
  
  const response = await fetch(`/api/personais/${personalId}/alunos/vincular`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ aluno_id: alunoId })
  });
  
  if (response.ok) {
    alert("Aluno vinculado!");
    location.reload();
  }
}
</script>
```

### Página: Meus Alunos (Personal)

```html
<h2>Meus Alunos</h2>

<table id="alunos-table">
  <thead>
    <tr>
      <th>Nome</th>
      <th>Email</th>
      <th>Objetivo</th>
      <th>Ações</th>
    </tr>
  </thead>
  <tbody id="alunos-tbody"></tbody>
</table>

<script>
async function carregarAlunos() {
  const personalId = getSession().user.id;
  const response = await fetch(`/api/personais/${personalId}/alunos`);
  const alunos = await response.json();
  
  const tbody = document.querySelector("#alunos-tbody");
  tbody.innerHTML = alunos.map(aluno => `
    <tr>
      <td>${aluno.nome}</td>
      <td>${aluno.email}</td>
      <td>${aluno.objetivo.nome}</td>
      <td>
        <button onclick="desvincularAluno(${aluno.id})">Desvincular</button>
      </td>
    </tr>
  `).join("");
}

async function desvincularAluno(alunoId) {
  const personalId = getSession().user.id;
  const ok = confirm("Desvincular este aluno?");
  if (!ok) return;
  
  const response = await fetch(`/api/personais/${personalId}/alunos/${alunoId}/desvincular`, {
    method: "DELETE"
  });
  
  if (response.ok) {
    alert("Aluno desvinculado!");
    carregarAlunos();
  }
}

carregarAlunos();
</script>
```

### Página: Escolher Personal (Aluno)

```html
<h2>Vincular-se a um Personal</h2>

<!-- Listar personais disponíveis -->
<div id="personais-list"></div>

<script>
async function carregarPersonais() {
  const response = await fetch("/api/personais");
  const personais = await response.json();
  
  const container = document.querySelector("#personais-list");
  container.innerHTML = personais.map(p => `
    <div class="card">
      <h3>${p.nome}</h3>
      <p><strong>Especialidade:</strong> ${p.especialidade || "N/A"}</p>
      <p><strong>CREF:</strong> ${p.cref}</p>
      <button onclick="vincularAPersonal(${p.id})">
        Vincular-se a este Personal
      </button>
    </div>
  `).join("");
}

async function vincularAPersonal(personalId) {
  const alunoId = getSession().user.id;
  
  const response = await fetch(`/api/alunos/${alunoId}/vincular-personal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ personal_id: personalId })
  });
  
  if (response.ok) {
    alert("Vinculado com sucesso!");
    location.reload();
  }
}

carregarPersonais();
</script>
```

---

## 🧪 Testes da API (Postman/Insomnia)

### Cenário 1: Personal vincula aluno

```
1. GET /api/alunos/disponiveis
   └─ Retorna alunos sem personal

2. POST /api/personais/5/alunos/vincular
   └─ Vincula aluno ID 1

3. GET /api/personais/5/alunos
   └─ Aluno 1 agora aparece na lista
```

### Cenário 2: Aluno se desvincula

```
1. DELETE /api/personais/5/alunos/1/desvincular
   └─ Aluno 1 é desvinculado

2. GET /api/alunos/disponiveis
   └─ Aluno 1 agora aparece novamente
```

---

## ⚠️ Casos de Erro & Tratamento

| Erro | Código | Causa | Solução |
|------|--------|-------|----------|
| "Aluno já vinculado" | 400 | Aluno tenta se vincular 2x | Desvincular primeiro |
| "Personal não encontrado" | 404 | ID inexistente | Verificar ID |
| "Não autorizado" | 403 | Tentativa de desvincular aluno de outro | Verificar personalidade |
| "Aluno não encontrado" | 404 | ID do aluno inválido | Verificar ID |

---

## 📊 Queries SQL Úteis

### Visualizar todos os alunos com seus personals

```sql
SELECT 
  a.id,
  a.nome AS aluno,
  a.email,
  p.nome AS personal,
  p.especialidade
FROM alunos a
LEFT JOIN personais p ON a.personal_id = p.id
ORDER BY a.personal_id DESC, a.nome;
```

### Contar alunos por personal

```sql
SELECT 
  p.id,
  p.nome,
  COUNT(a.id) AS total_alunos
FROM personais p
LEFT JOIN alunos a ON a.personal_id = p.id
GROUP BY p.id, p.nome
ORDER BY total_alunos DESC;
```

### Alunos sem personal (disponíveis)

```sql
SELECT * FROM alunos WHERE personal_id IS NULL;
```

---

## 🚀 Próximos Passos

1. ✅ **Backend implementado**
2. ⏳ **Testar endpoints (Postman)**
3. ⏳ **Implementar no Frontend**
4. ⏳ **Criar UI para vinculação**
5. ⏳ **Testes end-to-end**

