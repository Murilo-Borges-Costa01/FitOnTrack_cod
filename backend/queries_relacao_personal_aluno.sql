-- -- ============================================
-- -- QUERIES SQL - Relação Personal-Aluno
-- -- ============================================

-- -- 1. CRIAR ESTRUTURA

-- -- Adicionar coluna de foreign key na tabela alunos
-- ALTER TABLE alunos ADD COLUMN personal_id INT NULL;

-- -- Adicionar constraint de foreign key
-- ALTER TABLE alunos ADD CONSTRAINT fk_aluno_personal 
-- FOREIGN KEY (personal_id) REFERENCES personais(id) 
-- ON DELETE SET NULL 
-- ON UPDATE CASCADE;

-- -- Verificar estrutura
-- DESC alunos;

-- -- ============================================
-- -- 2. INSERIR & ATUALIZAR DADOS
-- -- ============================================

-- -- Vincular aluno a personal
-- UPDATE alunos SET personal_id = 5 WHERE id = 1;

-- -- Desvincular aluno
-- UPDATE alunos SET personal_id = NULL WHERE id = 1;

-- -- ============================================
-- -- 3. LEITURA & CONSULTAS
-- -- ============================================

-- -- Listar TODOS os alunos com seus personals
-- SELECT 
--   a.id AS aluno_id,
--   a.nome AS aluno_nome,
--   a.email AS aluno_email,
--   p.id AS personal_id,
--   p.nome AS personal_nome,
--   p.especialidade AS personal_especialidade
-- FROM alunos a
-- LEFT JOIN personais p ON a.personal_id = p.id
-- ORDER BY a.personal_id DESC, a.nome;

-- -- Listar alunos DISPONÍVEIS (sem personal)
-- SELECT 
--   a.id,
--   a.nome,
--   a.email,
--   a.objetivo_id,
--   obj.nome AS objetivo
-- FROM alunos a
-- LEFT JOIN objetivos obj ON a.objetivo_id = obj.id
-- WHERE a.personal_id IS NULL
-- ORDER BY a.nome;

-- -- Listar alunos de um PERSONAL ESPECÍFICO
-- SELECT 
--   a.id,
--   a.nome,
--   a.email,
--   a.altura,
--   a.massa,
--   gen.nome AS genero,
--   obj.nome AS objetivo,
--   a.problema_saude
-- FROM alunos a
-- LEFT JOIN generos gen ON a.genero_id = gen.id
-- LEFT JOIN objetivos obj ON a.objetivo_id = obj.id
-- WHERE a.personal_id = 5  -- ID do personal
-- ORDER BY a.nome;

-- -- ============================================
-- -- 4. ANÁLISES & RELATÓRIOS
-- -- ============================================

-- -- Contar alunos por personal
-- SELECT 
--   p.id,
--   p.nome,
--   COUNT(a.id) AS total_alunos
-- FROM personais p
-- LEFT JOIN alunos a ON a.personal_id = p.id
-- GROUP BY p.id
-- ORDER BY total_alunos DESC;

-- -- Personals SEM alunos vinculados
-- SELECT 
--   p.id,
--   p.nome,
--   p.especialidade,
--   COUNT(a.id) AS total_alunos
-- FROM personais p
-- LEFT JOIN alunos a ON a.personal_id = p.id
-- GROUP BY p.id
-- HAVING COUNT(a.id) = 0
-- ORDER BY p.nome;

-- -- Personals COM alunos
-- SELECT 
--   p.id,
--   p.nome,
--   p.especialidade,
--   COUNT(a.id) AS total_alunos
-- FROM personais p
-- LEFT JOIN alunos a ON a.personal_id = p.id
-- GROUP BY p.id
-- HAVING COUNT(a.id) > 0
-- ORDER BY total_alunos DESC;

-- -- ============================================
-- -- 5. VERIFICAÇÕES & VALIDAÇÕES
-- -- ============================================

-- -- Verificar integridade: Nenhum aluno vinculado a personal inexistente
-- SELECT a.id, a.nome, a.personal_id
-- FROM alunos a
-- WHERE a.personal_id IS NOT NULL 
-- AND NOT EXISTS (
--   SELECT 1 FROM personais p WHERE p.id = a.personal_id
-- );

-- -- Verificar se há personal_id duplicados (não deve haver, pois N:1)
-- SELECT personal_id, COUNT(*) AS total
-- FROM alunos
-- WHERE personal_id IS NOT NULL
-- GROUP BY personal_id;

-- -- Contar total de alunos vinculados
-- SELECT COUNT(*) AS alunos_vinculados
-- FROM alunos
-- WHERE personal_id IS NOT NULL;

-- -- Contar total de alunos disponíveis
-- SELECT COUNT(*) AS alunos_disponiveis
-- FROM alunos
-- WHERE personal_id IS NULL;

-- -- ============================================
-- -- 6. LIMPEZA & MANUTENÇÃO
-- -- ============================================

-- -- Desvincular TODOS os alunos (cuidado!)
-- UPDATE alunos SET personal_id = NULL;

-- -- Desvincular alunos de um personal específico
-- UPDATE alunos SET personal_id = NULL WHERE personal_id = 5;

-- -- Deletar personal e seus alunos ficam sem personal (ON DELETE SET NULL)
-- DELETE FROM personais WHERE id = 5;

-- -- ============================================
-- -- 7. EXEMPLO COMPLETO DE WORKFLOW
-- -- ============================================

-- -- 1. Ver alunos disponíveis
-- SELECT id, nome FROM alunos WHERE personal_id IS NULL;

-- -- 2. Ver personals
-- SELECT id, nome, especialidade FROM personais;

-- -- 3. Vincular aluno 1 ao personal 5
-- UPDATE alunos SET personal_id = 5 WHERE id = 1;

-- -- 4. Confirmar vinculação
-- SELECT a.nome, p.nome FROM alunos a
-- LEFT JOIN personais p ON a.personal_id = p.id
-- WHERE a.id = 1;

-- -- 5. Ver todos os alunos do personal 5
-- SELECT id, nome, email FROM alunos WHERE personal_id = 5;

-- -- 6. Desvincular aluno 1
-- UPDATE alunos SET personal_id = NULL WHERE id = 1;

-- -- 7. Confirmar desvinculação
-- SELECT id, nome, personal_id FROM alunos WHERE id = 1;
