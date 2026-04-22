# 🌟 Sistema de Avaliação - Guia de Teste

## 📋 Checklist de Funcionalidades

### Backend - API Endpoints
- [ ] POST `/api/avaliacoes` - Criar avaliação
  ```bash
  curl -X POST http://localhost:3000/api/avaliacoes \
    -H "Content-Type: application/json" \
    -d '{
      "personal_id": 1,
      "estrelas": 5,
      "comentario": "Excelente profissional!",
      "anonimo": true
    }'
  ```

- [ ] GET `/api/personais/{id}/avaliacoes` - Listar avaliações
  ```bash
  curl http://localhost:3000/api/personais/1/avaliacoes
  ```

- [ ] GET `/api/personais/{id}/media-estrelas` - Média de estrelas
  ```bash
  curl http://localhost:3000/api/personais/1/media-estrelas
  ```

- [ ] GET `/api/personais/{id}/minha-avaliacao` - Minha avaliação
  ```bash
  curl http://localhost:3000/api/personais/1/minha-avaliacao
  ```

### Frontend - Fluxo Aluno

#### 1. Acessar página de avaliação
- [ ] Aluno acessar `/frontend/pages/aluno/meu-personal.html`
- [ ] Clicar em botão "⭐ Avaliar Personal"
- [ ] Página carrega:
  - Foto do personal
  - Nome do personal
  - CREF (certificado)
  - Aviso em verde: "🔒 Avaliação Anônima"

#### 2. Fazer avaliação
- [ ] Clicar em diferentes estrelas (preview de cores)
- [ ] Sistema mostra "X estrelas selecionadas"
- [ ] Digitar comentário opcional
- [ ] Clicar em "Enviar Avaliação"
- [ ] Mensagem de sucesso: "✅ Avaliação enviada com sucesso!"
- [ ] Redirecionar para `meu-personal.html`

#### 3. Tentar avaliar novamente
- [ ] Aluno tenta avaliar o mesmo personal novamente
- [ ] Sistema mostra erro: "Você já avaliou este personal"
- [ ] Form carrega com dados anteriores (permite edição)
- [ ] Aluno pode alterar estrelas/comentário e enviar novamente

### Frontend - Fluxo Personal

#### 1. Acessar minhas avaliações (via Perfil)
- [ ] Personal acessa `/frontend/pages/personal/PerfildoPersonal.html`
- [ ] Clicar em botão "⭐ Minhas Avaliações"
- [ ] Página carrega:
  - Média geral de estrelas (ex: "4.5")
  - Display visual de estrelas (ex: ⭐⭐⭐⭐☆)
  - Total de avaliações

#### 2. Visualizar avaliações
- [ ] Lista mostra cada avaliação com:
  - Estrelas (visual em ouro)
  - "🔒 Avaliação Anônima" (se for anônima)
  - Data e hora da avaliação
  - Comentário (em caixa destacada)
- [ ] Se sem comentário: "(sem comentário)" em cinza

#### 3. Filtrar/Ordenar
- [ ] Select dropdown funciona:
  - "Mais Recentes" (padrão)
  - "Mais Antigas"
  - "Maior Classificação"
  - "Menor Classificação"
- [ ] Lista reordena corretamente

#### 4. Acessar via Meus Alunos
- [ ] Personal acessa `/frontend/pages/personal/meusAlunos.html`
- [ ] Novo botão "Avaliações" aparece no cabeçalho
- [ ] Clicando leva para `avaliacoes-pessoal.html`

## 🧪 Testes de Edge Cases

### Caso 1: Sem avaliações
- [ ] Personal com 0 avaliações vê:
  - Média: "0"
  - Mensagem: "Nenhuma avaliação ainda"

### Caso 2: Uma avaliação
- [ ] Personal com 1 avaliação de 5 estrelas:
  - Média: "5.0"
  - Total: "1 avaliação"

### Caso 3: Múltiplas avaliações
- [ ] Personal com 3 avaliações (5, 4, 3 estrelas):
  - Média: "4.0" (média simples: 12/3 = 4)
  - Total: "3 avaliações"
  - Cada uma listada

### Caso 4: Aluno sem personal
- [ ] Aluno tenta avaliar sem personal vinculado
- [ ] Mensagem: "Você não tem um personal vinculado"
- [ ] Redireciona após 2 segundos

## 🔐 Testes de Segurança

- [ ] Aluno não consegue ver ID de quem avaliou (anônimo)
- [ ] Aluno não consegue deletar avaliação de outro
- [ ] Aluno não consegue editar avaliação de outro
- [ ] Personal não consegue criar avaliação via API
- [ ] Session validation em todos os endpoints

## 💾 Testes de Persistência

### Ser Reiniciado (após)
- [ ] Servidor reiniciado
- [ ] Browser limpo (F5)
- [ ] Avaliações ainda aparecem
- [ ] Média se mantém correta

### Dados Persistidos
- [ ] Avaliação criada 1 hora atrás aparece com hora correta
- [ ] Comentário com caracteres especiais funciona
- [ ] Reavaliação (edição) atualiza corretamente

## 📊 Testes de Performance

- [ ] Página carrega rápido (< 2s)
- [ ] Filtro/ordenação é instant (< 500ms)
- [ ] Com 100+ avaliações, continua rápido
- [ ] Sem lag ao selecionar estrelas

## 📱 Testes de Responsividade

- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Tudo legível e funcional

## 🎨 Testes de UI/UX

- [ ] Botões têm visual claro (cores distintas)
- [ ] Hover effects funcionam
- [ ] Status messages (loading, success, error) aparecem
- [ ] Mensagens são claras e em português
- [ ] Navegação volta corretamente

## 🆘 Solução de Problemas

### Erro 401 - Não autenticado
- Certifique-se de fazer login antes
- Verifique session.js está funcionando

### Erro 400 - Dados inválidos
- Verifique se estrelas está entre 1-5
- Verifique se personal_id é válido

### Erro 500 - Erro do servidor
- Verifique console do backend (npm)
- Verifique sincronização de banco (schemaSync)

### Avaliação não aparece
- Atualize página (F5)
- Verifique se está vendo as avaliações do personal certo
- Verifique banco de dados diretamente

## ✅ Testes Completos

Após passar em todos os testes acima, o sistema está pronto para produção!

Qualidade esperada:
- ✅ Funcionalidade 100%
- ✅ UI/UX agradável
- ✅ Performance adequada
- ✅ Segurança validada
- ✅ Data persistence ok
