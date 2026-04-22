# 🎯 Fluxo do Sistema de Avaliação

## 1️⃣ Fluxo de Avaliação (Aluno Avaliando Personal)

```
┌─────────────────────────────────────────────────────────────────┐
│ ALUNO ACESSA: meu-personal.html                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────┐                 │
│  │ Mostra info do Personal                    │                 │
│  │  • Foto (circular)                         │                 │
│  │  • Nome                                    │                 │
│  │  • CREF                                    │                 │
│  │                                            │                 │
│  │  [⭐ Avaliar Personal] btn (GREEN) ◄──────┼─── NOVO         │
│  │  [Desvincular] btn                         │                 │
│  └────────────────────────────────────────────┘                 │
│                        │                                         │
│                        │ CLIQUE                                  │
│                        ▼                                         │
│                   window.redirectTo()                            │
│                        │                                         │
│                        ▼                                         │
└─────────────────────────────────────────────────────────────────┘
                         │
                         │ GET /avaliar-personal.html
                         │
       ┌─────────────────────────────────────────────────────┐
       │                                                       │
       ▼                                                       │
┌──────────────────────────────────────────────────────────┐  │
│ PAGE: avaliar-personal.html (ALUNO)                      │  │
├──────────────────────────────────────────────────────────┤  │
│                                                            │  │
│  [← Voltar]                                              │  │
│                                                            │  │
│              Avaliar seu Personal                         │  │
│                                                            │  │
│  ┌────────────────────────────────────────────────────┐  │  │
│  │ [Foto]    Personal: João Silva, CREF: 12345      │  │  │
│  └────────────────────────────────────────────────────┘  │  │
│                                                            │  │
│  ┌────────────────────────────────────────────────────┐  │  │
│  │ 🔒 Avaliação Anônima                              │  │  │
│  │ Sua avaliação será totalmente anônima. O personal│  │  │
│  │ não saberá quem avaliou.                         │  │  │
│  └────────────────────────────────────────────────────┘  │  │
│                                                            │  │
│  Como você avalia seu personal?                          │  │
│                                                            │  │
│      Clique em uma estrela:                              │  │
│      ⭐  ⭐  ⭐  ⭐  ⭐    (interativo)                      │  │
│      1  2  3  4  5                                       │  │
│                                                            │  │
│      Seleção: 5 estrelas selecionadas ✓                  │  │
│                                                            │  │
│  Deixe um comentário (opcional)                          │  │
│  ┌────────────────────────────────────────────────────┐  │  │
│  │[textarea] Compartilhe sua experiência...          │  │  │
│  └────────────────────────────────────────────────────┘  │  │
│                                                            │  │
│         [Enviar Avaliação] [Cancelar]                    │  │
│                                                            │  │
│  Status: ⏳ Enviando avaliação...                        │  │
│                                        ▲                 │  │
│                                        │                 │  │
└────────────────────────────────────────┼─────────────────┘  │
                                         │                     │
                    POST /api/avaliacoes │ (com validações)  │
                                         │                   │
                               ┌─────────▼──────────┐       │
                               │                    │       │
                               │ Backend Express   │       │
                               │                    │       │
                               │ Validações:       │       │
                               │ ✓ Session        │       │
                               │ ✓ personal_id    │       │
                               │ ✓ 1-5 stars      │       │
                               │ ✓ Não duplica    │       │
                               │                    │       │
                               └─────────┬──────────┘       │
                                         │                   │
                                    INSERT                  │
                                         │                   │
                               ┌─────────▼──────────┐       │
                               │                    │       │
                               │ MySQL DB          │       │
                               │ avaliacoes table   │       │
                               │                    │       │
                               │ INSERT:           │       │
                               │ • aluno_id: 5     │       │
                               │ • personal_id: 2  │       │
                               │ • estrelas: 5     │       │
                               │ • comentario:...  │       │
                               │ • anonimo: true   │       │
                               │ • data_criacao:.. │       │
                               │                    │       │
                               └─────────┬──────────┘       │
                                         │                   │
                              JSON {mensagem: OK} ◄──────────┘
                                         │
                                         │ Response 201
                                         │
                        ┌────────────────▼─────────────┐
                        │                              │
                        │ Sucesso! ✅                  │
                        │ Avaliação enviada!          │
                        │                              │
                        │ setTimeout 2s → redirect     │
                        │                              │
                        └────────────────┬─────────────┘
                                         │
                                         ▼
                  window.redirectTo(/meu-personal.html)
                                         │
                                         ▼
                        ┌────────────────────────────┐
                        │ De volta ao Meu Personal.. │
                        └────────────────────────────┘
```

---

## 2️⃣ Fluxo de Visualização de Avaliações (Personal)

```
┌──────────────────────────────────────────────────────────────┐
│ PERSONAL ACESSA: PerfildoPersonal.html                       │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌───────────────────────────────────────────────────────┐   │
│  │ [Foto] Meu Perfil                                     │   │
│  │ Nome, Email, Certificados, Etc                        │   │
│  │                                                        │   │
│  │ [⭐ Minhas Avaliações] btn (BLUE) ◄──────────── NOVO  │   │
│  │ [Deletar Conta] btn (RED)                            │   │
│  │ [Sair] btn (BLUE)                                    │   │
│  └───────────────────────────────────────────────────────┘   │
│                       │                                       │
│                       │ CLIQUE                                │
│                       ▼                                       │
└──────────────────────────────────────────────────────────────┘
                        │
                        │ GET /avaliacoes-pessoal.html
                        │
        ┌───────────────────────────────────────────────────┐
        │                                                    │
        ▼                                                    │
┌─────────────────────────────────────────────────────────┐ │
│ PAGE: avaliacoes-pessoal.html (PERSONAL)                │ │
├─────────────────────────────────────────────────────────┤ │
│                                                          │ │
│  [← Voltar]                                            │ │
│                                                          │ │
│              Minhas Avaliações                          │ │
│          Veja como seus alunos o avaliam              │ │
│                                                          │ │
│  ┌──────────────────────────────────────────────────┐  │ │
│  │ RESUMO GERAL                                      │  │ │
│  │                                                   │  │ │
│  │      Média: 4.5                                 │  │ │
│  │      ⭐⭐⭐⭐☆                                       │  │ │
│  │      3 avaliações                               │  │ │
│  └──────────────────────────────────────────────────┘  │ │
│                                                          │ │
│  Ordenação: [ Mais Recentes ▼ ]                       │ │
│                                                          │ │
│  ┌──────────────────────────────────────────────────┐  │ │
│  │ AVALIAÇÃO 1                                       │  │ │
│  │                                                   │  │ │
│  │ ⭐⭐⭐⭐⭐ (5 estrelas)                              │  │ │
│  │ 🔒 Avaliação Anônima                            │  │ │
│  │ 30/03/2026 às 15:30                             │  │ │
│  │                                                   │  │ │
│  │ "Excelente profissional, muito dedicado!"       │  │ │
│  └──────────────────────────────────────────────────┘  │ │
│                                                          │ │
│  ┌──────────────────────────────────────────────────┐  │ │
│  │ AVALIAÇÃO 2                                       │  │ │
│  │                                                   │  │ │
│  │ ⭐⭐⭐⭐☆ (4 estrelas)                              │  │ │
│  │ 🔒 Avaliação Anônima                            │  │ │
│  │ 29/03/2026 às 10:15                             │  │ │
│  │                                                   │  │ │
│  │ "(sem comentário)"                              │  │ │
│  └──────────────────────────────────────────────────┘  │ │
│                                                          │ │
│  ┌──────────────────────────────────────────────────┐  │ │
│  │ AVALIAÇÃO 3                                       │  │ │
│  │                                                   │  │ │
│  │ ⭐⭐⭐☆☆ (3 estrelas)                              │  │ │
│  │ 🔒 Avaliação Anônima                            │  │ │
│  │ 28/03/2026 às 14:45                             │  │ │
│  │                                                   │  │ │
│  │ "Bom, mas poderia melhorar em XYZ"              │  │ │
│  └──────────────────────────────────────────────────┘  │ │
│                                                          │ │
└─────────────────────────────────────────────────────────┘ │
        ◄──────────────────────────────────────────────────┘
         │
         │ GET requests
         │
    ┌────▼────────────────────────────────────┐
    │                                          │
    ├─ GET /personais/{id}/media-estrelas    │
    │  Resposta: {media: 4.5, total: 3}      │
    │                                          │
    ├─ GET /personais/{id}/avaliacoes        │
    │  Resposta: [                            │
    │    {                                    │
    │      id: 1,                            │
    │      estrelas: 5,                      │
    │      comentario: "Excelente...",       │
    │      anonimo: true,                    │
    │      data_criacao: "2026-03-30T15:30"  │
    │    },                                  │
    │    /* ... mais avaliações ... */       │
    │  ]                                      │
    │                                          │
    └────┬────────────────────────────────────┘
         │
         ▼
    Backend MySQL
    SELECT * FROM avaliacoes 
    WHERE personal_id = 2
```

---

## 3️⃣ Acesso Rápido via Menu

```
┌─────────────────────────────────────────────────────────────┐
│ ROTAS/BOTÕES DE ACESSO                                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ PARA ALUNO:                                                │
│                                                              │
│ 1. meu-personal.html                                       │
│    └─ [⭐ Avaliar Personal] btn                            │
│       └─ avaliar-personal.html                            │
│          └─ Avalia personal                               │
│                                                              │
│ 2. PerfildoAluno.html                                      │
│    └─ (sem botão de avaliação here)                       │
│                                                              │
│ ───────────────────────────────────────────────────────     │
│                                                              │
│ PARA PERSONAL:                                             │
│                                                              │
│ 1. PerfildoPersonal.html                                   │
│    └─ [⭐ Minhas Avaliações] btn                           │
│       └─ avaliacoes-pessoal.html                          │
│          └─ Vê avaliações recebidas                      │
│                                                              │
│ 2. meusAlunos.html                                         │
│    └─ [Avaliações] btn (novo no header)                   │
│       └─ avaliacoes-pessoal.html                          │
│          └─ Vê avaliações recebidas                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 4️⃣ Estrutura do Banco de Dados

```
mysql> DESCRIBE avaliacoes;

┌────────────────┬──────────────┬──────┬─────┬──────────────────────┬───────────────┐
│ Field          │ Type         │ Null │ Key │ Default              │ Extra         │
├────────────────┼──────────────┼──────┼─────┼──────────────────────┼───────────────┤
│ id             │ int(11)      │ NO   │ PRI │ NULL                 │ auto_increment│
│ aluno_id       │ int(11)      │ NO   │ FK  │ NULL                 │               │
│ personal_id    │ int(11)      │ NO   │ FK  │ NULL                 │               │
│ avaliador_tipo │ enum(...)    │ NO   │     │ NULL                 │               │
│ avaliador_id   │ int(11)      │ NO   │     │ NULL                 │               │
│ estrelas       │ int(11)      │ NO   │     │ 5                    │               │
│ comentario     │ text         │ YES  │     │ NULL                 │               │
│ anonimo        │ tinyint(1)   │ NO   │     │ 1                    │               │
│ data_criacao   │ datetime     │ NO   │     │ CURRENT_TIMESTAMP    │               │
└────────────────┴──────────────┴──────┴─────┴──────────────────────┴───────────────┘

Restrições:
• UNIQUE(aluno_id, personal_id) - Aluno avalia uma vez por personal
• CHECK(estrelas >= 1 AND estrelas <= 5) - Validação de range
• Foreign keys com CASCADE DELETE
```

---

## 5️⃣ Ciclo de Vida de Uma Avaliação

```
┌──────────────────────────────────────────────────────────────┐
│ CICLO DE VIDA DA AVALIAÇÃO                                   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. CRIAÇÃO                                                  │
│     ↓                                                         │
│  POST /avaliacoes                                           │
│     {                                                        │
│       personal_id: 2,                                       │
│       estrelas: 5,                                          │
│       comentario: "...",                                    │
│       anonimo: true                                         │
│     }                                                        │
│     ↓                                                         │
│  INSERT INTO avaliacoes (...) VALUES (...)                │
│     ↓                                                         │
│  Status: 201 Created ✅                                    │
│                                                              │
│  ────────────────────────────────────────────────────────   │
│                                                              │
│  2. LEITURA (Personal)                                      │
│     ↓                                                         │
│  GET /personais/2/avaliacoes                               │
│     ↓                                                         │
│  SELECT * FROM avaliacoes WHERE personal_id = 2            │
│     ↓                                                         │
│  Status: 200 OK [array de avaliações]                     │
│                                                              │
│  ────────────────────────────────────────────────────────   │
│                                                              │
│  3. CÁLCULO DE MÉDIA                                        │
│     ↓                                                         │
│  GET /personais/2/media-estrelas                           │
│     ↓                                                         │
│  SELECT AVG(estrelas) FROM avaliacoes WHERE personal_id=2  │
│     ↓                                                         │
│  Status: 200 OK {media: 4.5, total: 3}                    │
│                                                              │
│  ────────────────────────────────────────────────────────   │
│                                                              │
│  4. EDIÇÃO (Aluno reavalia)                                 │
│     ↓                                                         │
│  POST /avaliacoes (novamente)                              │
│     {                                                        │
│       personal_id: 2,                                       │
│       estrelas: 4,  ← ALTERADO                             │
│       comentario: "...", ← ALTERADO                        │
│       anonimo: true                                         │
│     }                                                        │
│     ↓                                                         │
│  Valida: aluno já tem avaliação? SIM                      │
│  SELECT * FROM avaliacoes WHERE aluno_id=5 AND personal=2 │
│     ↓                                                         │
│  Retorna erro 400: "Você já avaliou" (para info)          │
│  OU atualiza a existente (implementação atual)            │
│     ↓                                                         │
│  INSERT OR UPDATE conforme lógica                         │
│                                                              │
│  ────────────────────────────────────────────────────────   │
│                                                              │
│  5. DELEÇÃO (Aluno apaga sua avaliação)                    │
│     ↓                                                         │
│  DELETE /avaliacoes/1                                       │
│     ↓                                                         │
│  Valida: é dono? SIM (aluno_id = session.user.id)         │
│     ↓                                                         │
│  DELETE FROM avaliacoes WHERE id = 1                      │
│     ↓                                                         │
│  Status: 200 OK {mensagem: "Deletada"}                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 6️⃣ Fluxo de Autenticação/Autorização

```
┌────────────────────────────────────────────────────────────┐
│ VALIDAÇÕES DE SEGURANÇA                                    │
├────────────────────────────────────────────────────────────┤
│                                                             │
│ CRIAR AVALIAÇÃO:                                          │
│ POST /avaliacoes                                          │
│   ✓ Session exists?            → 401 Unauthorized       │
│   ✓ Personal_id válido?        → 400 Bad Request        │
│   ✓ Estrelas 1-5?              → 400 Bad Request        │
│   ✓ Aluno já avaliou?          → 400 Duplicate         │
│   ↓ TUDO OK                                             │
│   ✅ INSERT → 201 Created                               │
│                                                             │
│  ───────────────────────────────────────────────────────   │
│                                                             │
│ LISTAR AVALIAÇÕES:                                        │
│ GET /personais/{id}/avaliacoes                           │
│   ✓ Sem autenticação obrigatória (anônimo funciona)     │
│   ✓ Se anonimo=true, remove aluno_id da resposta       │
│   ✓ Se anonimo=true, remove avaliador_id da resposta   │
│   ↓ TUDO OK                                             │
│   ✅ RETURN → 200 OK [array]                            │
│                                                             │
│  ───────────────────────────────────────────────────────   │
│                                                             │
│ DELETAR AVALIAÇÃO:                                        │
│ DELETE /avaliacoes/{id}                                  │
│   ✓ Session exists?            → 401 Unauthorized       │
│   ✓ Avaliação existe?          → 404 Not Found         │
│   ✓ É dono?                    → 403 Forbidden         │
│   ↓ TUDO OK                                             │
│   ✅ DELETE → 200 OK                                    │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

## 7️⃣ Exemplo JSON de Resposta

### POST /avaliacoes (Criar)
```json
{
  "mensagem": "Avaliação criada com sucesso",
  "avaliacao": {
    "id": 15,
    "aluno_id": 5,
    "personal_id": 2,
    "avaliador_tipo": "aluno",
    "avaliador_id": 5,
    "estrelas": 5,
    "comentario": "Excelente profissional!",
    "anonimo": true,
    "data_criacao": "2026-03-30T15:30:00.000Z"
  }
}
```

### GET /personais/2/avaliacoes (Listar - Anônimos)
```json
[
  {
    "id": 15,
    "personal_id": 2,
    "avaliador_tipo": "aluno",
    "estrelas": 5,
    "comentario": "Excelente profissional!",
    "anonimo": true,
    "data_criacao": "2026-03-30T15:30:00.000Z"
    // Note: aluno_id e avaliador_id removidos!
  },
  {
    "id": 14,
    "personal_id": 2,
    "avaliador_tipo": "aluno",
    "estrelas": 4,
    "comentario": "Bom trabalho",
    "anonimo": true,
    "data_criacao": "2026-03-29T10:15:00.000Z"
  }
]
```

### GET /personais/2/media-estrelas (Média)
```json
{
  "media": 4.5,
  "total": 2
}
```

---

## 🎯 Resumo Executivo

| Aspecto | Descrição |
|--------|-----------|
| **Tipo** | Sistema de Avaliação Anônima |
| **Usuários** | Alunos (avaliam) + Personals (recebem) |
| **Escala** | 1-5 estrelas |
| **Comentários** | Opcionais |
| **Anonimato** | ✅ Garantido com aviso visual |
| **Edição** | ✅ Simples (reavalia) |
| **Média** | ✅ Simples de todas as avaliações |
| **Visualização** | ✅ Personal + Aluno |
| **Banco** | MySQL com auto-sync |
| **Status** | ✅ COMPLETO |
