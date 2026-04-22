# 🔧 Teste - Sistema de Avaliação

## Passos para Testar:

### 1. Iniciar Servidor
```bash
cd backend
npm start
```

Deve aparecer: "Sincronizacao do banco concluida."

### 2. Abrir Console do Navegador
- F12 ou Ctrl+Shift+I
- Ir para aba "Console"

### 3. Login como Aluno
- Email: (aluno com personal vinculado)
- Senha: (sua senha)

### 4. Acesso a Avaliar
- Clique: "Meu Personal"
- Clique: "⭐ Avaliar Personal"
- Abra Console (F12)

### 5. Verificar Mensagens no Console

**Se vir:**
- ✅ "Carregando avaliações para: X"
- ✅ Foto carregando
- Significa que está funcionando!

**Se vir erro:**
- ❌ Copie a mensagem de erro
- Envie para diagnóstico

### 6. Testar Envio
- Selecione 5 ⭐
- Digite comentário: "Teste"
- Clique "Enviar Avaliação"
- Abra Console (F12)

**Se vir:**
- ✅ "Enviando payload: {...}"
- ✅ "Resposta: {...}"
- ✅ Mensagem "Avaliação enviada com sucesso!"
- Significa que foi criada!

### 7. Verificar Banco (Terminal)
```bash
mysql -u root -p
USE db_fitontrack;
SELECT * FROM avaliacoes;
```

Deve mostrar a avaliação que foi criada.

---

## Erros Comuns e Soluções

| Erro | Solução |
|------|---------|
| 401 Unauthorized | Fazer login novamente |
| 400 Você já avaliou | Normal! Edite e reenvie |
| Foto não carrega | Verificar `/frontend/assets/uploads/personais/` |
| Não envia avaliação | Verificar Console F12 para erros |
| Banco não mostra dados | Verificar se sincronização rodou |

---

## Comandos Úteis

### Ver erros do servidor
```bash
# Terminal onde rodou "npm start"
# Veja as mensagens vermelhas
```

### Limpar cache do navegador
```
Ctrl+Shift+Delete (Windows/Linux)
Cmd+Shift+Delete (Mac)
Selecione "Tudo"
Limpar dados de navegação
```

### Testar API diretamente
```bash
curl http://localhost:3000/api/personais/1/media-estrelas

# Esperado:
# {"media":0,"total":0}
```

---

## Resumo do Fluxo

1. **Aluno avalia** → `/api/avaliacoes` (POST)
2. **Banco salva** → avaliacoes table
3. **Personal vê** → `/api/personais/{id}/avaliacoes` (GET)
4. **Exibe media** → `/api/personais/{id}/media-estrelas` (GET)

Todos os passos estão implementados e prontos!
