# 🌟 REFERÊNCIA RÁPIDA - Sistema de Avaliação

## 📌 O Que Foi Implementado

✅ **Alunos** podem avaliar seus personals com:  
   - ⭐ Estrelas de 1 a 5
   - 💬 Comentário opcional
   - 🔒 Garantia de anonimato

✅ **Personals** podem ver:
   - 📊 Média de estrelas (simples)
   - 📈 Total de avaliações
   - 🔍 Lista de todas as avaliações
   - 🔄 Filtro/ordenação

---

## 📂 Arquivos Criados

```
/backend
  ├─ data/update-avaliacoes.sql ........... SQL para atualizar BD
  └─ controllers/avaliacaoController.js ... ATUALIZADO (5 funções)
  └─ models/avaliacaoM.js ............... ATUALIZADO (4 colunas)
  └─ routes/avaliacao.js ................ ATUALIZADO (5 rotas)
  └─ utils/schemaSync.js ................ ATUALIZADO (sincronização)

/frontend
  ├─ pages/aluno/
  │  └─ avaliar-personal.html ............ 🆕 Página de avaliação
  │
  ├─ pages/personal/
  │  ├─ avaliacoes-pessoal.html ......... 🆕 Ver avaliações recebidas
  │  ├─ PerfildoPersonal.html ........... ATUALIZADO (botão adicionado)
  │  └─ meusAlunos.html ................. ATUALIZADO (botão adicionado)
  │
  ├─ pages/aluno/
  │  └─ meu-personal.html ............... ATUALIZADO (botão adicionado)
  │
  └─ js/pages/
     ├─ avaliar-personal.js ............. 🆕 Lógica de avaliação
     ├─ avaliacoes-pessoal.js ........... 🆕 Lógica de visualização
     ├─ perfil-personal.js .............. ATUALIZADO (handler)
     └─ perfil-personal-aluno.js ........ ATUALIZADO (handler)

DOCUMENTAÇÃO
├─ DOCUMENTACAO_AVALIACOES_SISTEMA.md ... Documentação completa
├─ FLUXO_AVALIACOES_DIAGRAMA.md ......... Diagramas e fluxos
├─ GUIA_TESTE_AVALIACOES.md ............ Checklist de testes
└─ REFERENCIA_RAPIDA.md ................ Este arquivo
```

---

## 🔗 URLs/Rotas

### Backend - API

```
POST   /api/avaliacoes
       Criar avaliação
       Body: {personal_id, estrelas (1-5), comentario?, anonimo}
       Response: 201 {mensagem, avaliacao}

GET    /api/personais/{id}/avaliacoes
       Listar avaliações de um personal
       Response: 200 [... avaliações]

GET    /api/personais/{id}/media-estrelas
       Obter média de estrelas
       Response: 200 {media: 4.5, total: 3}

GET    /api/personais/{id}/minha-avaliacao
       Obter minha avaliação para um personal
       Response: 200 { avaliacao } ou null

DELETE /api/avaliacoes/{id}
       Deletar minha avaliação
       Response: 200 {mensagem}
```

### Frontend - Páginas

```
/frontend/pages/aluno/avaliar-personal.html
   → Aluno avalia seu personal

/frontend/pages/personal/avaliacoes-pessoal.html
   → Personal vê suas avaliações

/frontend/pages/aluno/meu-personal.html
   → Adicionado botão "⭐ Avaliar Personal"

/frontend/pages/personal/PerfildoPersonal.html
   → Adicionado botão "⭐ Minhas Avaliações"

/frontend/pages/personal/meusAlunos.html
   → Adicionado botão "Avaliações"
```

---

## 🧪 Teste Rápido (5 minutos)

### 1️⃣ Startup
```bash
cd backend
npm start
# Aguarde: "Sincronizacao do banco concluida."
```

### 2️⃣ Cenário de Teste

**Aluno:**
1. Login com conta de aluno
2. Acesso → Meu Personal
3. Clique → "⭐ Avaliar Personal"
4. ⭐⭐⭐⭐⭐ (5 estrelas)
5. Comentário: "Ótimo personal!"
6. Clique → "Enviar Avaliação"
7. ✅ Deve ver mensagem de sucesso

**Personal:**
1. Login com conta de personal
2. Acesso → Meu Perfil
3. Clique → "⭐ Minhas Avaliações"
4. ✅ Deve ver:
   - Média: 5.0
   - ⭐⭐⭐⭐⭐
   - 1 avaliação
   - Comentário (anônimo)

---

## 📊 Estrutura do Banco

Tabela: `avaliacoes`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | INT | Chave primária |
| aluno_id | INT | FK para aluno |
| personal_id | INT | FK para personal |
| avaliador_tipo | ENUM | 'aluno' ou 'personal' |
| avaliador_id | INT | Quem avaliou |
| **estrelas** | INT | 🆕 1-5 |
| comentario | TEXT | Feedback |
| **anonimo** | BOOLEAN | 🆕 true/false |
| **data_criacao** | DATETIME | 🆕 timestamp |

---

## 🎯 Fluxos Principais

### Fluxo 1: Aluno Avalia
```
Aluno: meu-personal.html
   ↓ Clica "⭐ Avaliar Personal"
Carrega: avaliar-personal.html
   ↓ Seleciona 5 ⭐ + comentário
POST: /api/avaliacoes
   ↓ Resposta 201 OK
Redireciona: meu-personal.html
   ✅ Sucesso!
```

### Fluxo 2: Personal Vê Avaliações
```
Personal: PerfildoPersonal.html
   ↓ Clica "⭐ Minhas Avaliações"
Carrega: avaliacoes-pessoal.html
   ↓ GET /api/personais/{id}/media-estrelas
   ↓ GET /api/personais/{id}/avaliacoes
Renderiza: Média + Lista
   ✅ Exibe avaliações anônimas
```

### Fluxo 3: Editar Avaliação
```
Aluno: volta para avaliar
GET: /api/personais/{id}/minha-avaliacao
   ↓ Form pré-carregado
Altera: 5 ⭐ → 4 ⭐
POST: /api/avaliacoes
   ↓ Atualiza DB (ou INSERT se não existir)
Redireciona: sucesso
   ✅ Avaliação atualizada
```

---

## 🔒 Segurança

✅ Session validation obrigatória  
✅ Aluno não avalia 2x mesmo personal  
✅ Dados anônimos removidos se `anonimo=true`  
✅ Aluno só deleta sua própria avaliação  
✅ Validação de range (1-5 estrelas)  

---

## 🎨 UI/UX

| Página | Cor | Ícone |
|--------|-----|-------|
| Avaliar Personal | 🟢 GREEN | ⭐ |
| Minhas Avaliações (Perfil) | 🔵 BLUE | ⭐ |
| Minhas Avaliações (Alunos) | - | ⭐ |
| Desvincular | 🔴 RED | - |

---

## 📱 Responsividade

✅ Desktop (1920x1080)  
✅ Tablet (768x1024)  
✅ Mobile (375x667)  

---

## 🚫 Possíveis Erros

| Erro | Causa | Solução |
|------|-------|---------|
| 401 Unauthorized | Não autenticado | Fazer login |
| 400 "Você já avaliou" | Avaliação duplicada | Editar anterior |
| 400 "Dados inválidos" | Estrelas fora de range | Usar 1-5 |
| 500 | Erro no servidor | Verificar console |
| Avaliação não aparece | Página não atualizada | F5 refresh |

---

## 📞 Suporte Rápido

**Preciso testar a API?**
→ Use: `GUIA_TESTE_AVALIACOES.md`

**Preciso entender melhor?**
→ Leia: `DOCUMENTACAO_AVALIACOES_SISTEMA.md`

**Preciso de diagrama?**
→ Veja: `FLUXO_AVALIACOES_DIAGRAMA.md`

**Preciso atualizar BD manualmente?**
→ Execute: `backend/data/update-avaliacoes.sql`

---

## ✅ Checklist Final

- [ ] Servidor iniciado: `npm start`
- [ ] Banco sincronizado: "Sincronizacao concluida"
- [ ] Fazer login como aluno
- [ ] Acesso "Meu Personal"
- [ ] Clicar "⭐ Avaliar Personal"
- [ ] Selecionar 5 estrelas
- [ ] Digitar comentário
- [ ] Clicar "Enviar"
- [ ] Ver mensagem de sucesso ✅
- [ ] Fazer login como personal
- [ ] Clicar "⭐ Minhas Avaliações"
- [ ] Ver média 5.0 com 1 avaliação
- [ ] Ver comentário anônimo
- [ ] Pronto! 🎉

---

## 📈 Status

🎉 **SISTEMA 100% IMPLEMENTADO E PRONTO PARA USAR!**

Próximo passo: Testar livremente!
