# 🎯 FLUXO COMPLETO - VINCULAÇÃO PERSONAL-ALUNO

## 📱 PARA PERSONAL

### 1️⃣ Personal entra em "Meus Alunos" 
- **Página**: `inicioPersonal.html`
- **Modo**: `data-page-mode="listar"`
- **API chamada**: `GET /api/personais/{personal_id}/alunos`
- **Resultado**: Mostra apenas seus alunos vinculados

### 2️⃣ Personal clica em "Adicionar"
- **Vai para**: `escolherAluno.html`
- **Modo**: `data-page-mode="escolher"`
- Abre modal/página para escolher novo aluno

### 3️⃣ Sistema carrega alunos DISPONÍVEIS (sem personal)
- **API chamada**: `GET /api/alunos/disponiveis`
- **Resultado**: Lista de alunos com `personal_id = NULL`
- **Cards**: Clicáveis para selecionar (destaque visual)

### 4️⃣ Personal seleciona um aluno
- **Ação**: Clica no card do aluno
- **Efeito**: Card fica destacado (classe `card-selected`)
- **Feedback**: Mensagem "Aluno selecionado. Clique em Salvar para vincular."

### 5️⃣ Personal clica em "Salvar"
- **API chamada**: `POST /api/personais/{personal_id}/alunos/vincular`
- **Body**: `{ "aluno_id": 3 }`
- **Validação no backend**:
  - ✅ Verifica se aluno existe
  - ✅ Verifica se personal existe
  - ✅ Verifica se aluno já tem outro personal
  - ❌ Retorna erro se aluno já tem personal

### 6️⃣ Sucesso! Redireciona para "Meus Alunos"
- **Redirecionamento**: `/pages/personal/inicioPersonal.html`
- **Delay**: 1.5 segundos para ver mensagem de sucesso
- **Nova lista**: Agora mostra o novo aluno vinculado

### 7️⃣ Personal pode clicar no aluno para ver detalhes
- **Vai para**: `/pages/aluno/alunoDoPersonal.html?aluno={id}`
- **Mostra**: Dados do aluno (foto, objetivo, altura, peso, etc)

---

## 👨‍🎓 PARA ALUNO

### 1️⃣ Aluno entra em "Meu Perfil"
- **Página**: `PerfildoAluno.html`
- **API chamada**: `GET /api/alunos/{aluno_id}`
- **Mostra**: Dados pessoais (nome, email, altura, peso, objetivo, etc)

### 2️⃣ Aluno vê seu Personal (novo!)
- **Página**: `meu-personal.html` (NOVA PÁGINA)
- **Navegação**: Link na navbar inferior (novo ícone "Personal")
- **Modo**: Este é o personal que o vinculou

### 3️⃣ Sistema carrega dados do Personal
- **Fluxo**:
  1. `GET /api/alunos/{aluno_id}` → pega `personal_id`
  2. `GET /api/personais/{personal_id}` → busca dados do personal
  
- **API chamada**: 
  - `GET /api/alunos/{aluno_id}` 
  - `GET /api/personais/{personal_id}`

- **Resultado**: Mostra
  - ✅ Foto do personal
  - ✅ Nome
  - ✅ Email
  - ✅ CREF
  - ✅ Especialidade
  - ✅ Certificados

### 4️⃣ Aluno pode desvincular (opcional)
- **Botão**: "Desvincular do Personal"
- **Ação**: `DELETE /api/alunos/{aluno_id}/desvincular-personal`
- **Efeito**: Remove `personal_id` do aluno
- **Permissões**: Só o aluno pode fazer isso (segurança)

---

## 🔐 SEGURANÇA & VALIDAÇÕES

### Backend
```javascript
// ✅ Validação 1: Aluno não pode ter 2 personals
if (aluno.personal_id !== null) {
  return error("Aluno já vinculado a outro personal");
}

// ✅ Validação 2: Verificar dados existem
if (!personal || !aluno) {
  return error("Personal ou Aluno não encontrado");
}

// ✅ Validação 3: Autorização (só o dono pode desvincular)
if (aluno.personal_id !== personal_id_logado) {
  return error("Não autorizado");
}

// ✅ Limpeza de senhas
attributes: { exclude: ["senha"] }

// ✅ Include de relacionamentos
include: [ "personal", "genero", "objetivo" ]
```

### Frontend
```javascript
// ✅ Verificar autenticação
if (!session || session.role !== "personal") {
  redirect("/");
}

// ✅ Verificar seleção antes de vincular
if (!selectedAlunoId) {
  error("Selecione um aluno primeiro");
}

// ✅ Confirmação para desvincular
if (confirm("Deseja realmente desvincular?")) {
  // proceder
}
```

---

## 📂 ARQUIVOS MODIFICADOS/CRIADOS

### Modificados ✏️
- [x] `backend/models/alunoM.js` - Adicionado `personal_id`
- [x] `backend/models/associations.js` - Relacionamentos 1:N
- [x] `backend/utils/schemaSync.js` - Sincronização automática
- [x] `backend/controllers/alunoController.js` - Endpoints de vinculação
- [x] `backend/controllers/personalController.js` - Endpoints de gestão
- [x] `backend/routes/aluno.js` - Novas rotas
- [x] `backend/routes/personal.js` - Novas rotas
- [x] `frontend/js/pages/personal-alunos.js` - Lógica de vinculação

### Criados ✨
- [x] `frontend/js/pages/perfil-personal-aluno.js` - Script para ver personal
- [x] `frontend/pages/aluno/meu-personal.html` - Página para ver personal
- [x] `backend/DOCUMENTACAO_RELACAO_PERSONAL_ALUNO.md` - Documentação
- [x] `backend/queries_relacao_personal_aluno.sql` - Queries SQL

---

## 🧪 TESTE RÁPIDO (Passo a Passo)

### Cenário 1: Personal vincula aluno
```
1. Login como Personal (ID: 1)
2. Ir para "Meus Alunos" (inicioPersonal.html)
3. Clicar "Adicionar"
4. Selecionar aluno (ID: 5)
5. Clicar "Salvar"
6. ✅ Mensagem: "Aluno vinculado com sucesso!"
7. ✅ Volta para inicioPersonal.html com novo aluno na lista
```

### Cenário 2: Aluno vê seu personal
```
1. Login como Aluno (ID: 5)
2. Ir para "Meu Perfil"
3. Clicar no novo link "Personal" ou "Meu Personal"
4. ✅ Vê foto, nome, email, CREF, especialidade do Personal (ID: 1)
5. ✅ Pode clicar "Desvincular" se quiser
```

### Cenário 3: Erro - Aluno não pode ser vinculado 2x
```
1. Personal B tenta vincular mesmo Aluno (ID: 5)
2. Sistema retorna erro:
   ❌ "Este aluno já está vinculado a outro personal"
3. Personal B não consegue vincular
```

---

## 🚀 STATUS IMPLEMENTAÇÃO

| Item | Status | Arquivo |
|------|--------|----------|
| Backend - Models | ✅ | `personalM.js`, `alunoM.js`, `associations.js` |
| Backend - Controllers | ✅ | `personalController.js`, `alunoController.js` |
| Backend - Routes | ✅ | `personal.js`, `aluno.js` |
| Backend - Validações | ✅ | Controllers com validações |
| Frontend - Personal vincula | ✅ | `personal-alunos.js` |
| Frontend - Aluno vê personal | ✅ | `perfil-personal-aluno.js`, `meu-personal.html` |
| Documentação | ✅ | `.md` e `.sql` files |

---

## 🎓 PRÓXIMOS PASSOS (Opcional)

1. **Autorização mais robusta**: Implementar middleware de JWT
2. **Notificações**: Aluno notificado quando vinculado
3. **Requisição**: Aluno solicita personal, personal aprova
4. **Histórico**: Registrar quando aluno foi vinculado
5. **Limite**: Limitar alunos por personal
6. **Treinos exclusivos**: Aluno vê só treinos do seu personal

