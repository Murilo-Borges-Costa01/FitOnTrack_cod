-- -- =========================
-- -- CRIAR BANCO
-- -- =========================
-- CREATE DATABASE IF NOT EXISTS db_fitontrack;
-- USE db_fitontrack;

-- -- =========================
-- -- TABELAS AUXILIARES
-- -- =========================

-- CREATE TABLE generos (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     nome VARCHAR(20) UNIQUE NOT NULL
-- );

-- CREATE TABLE objetivos (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     nome VARCHAR(50) UNIQUE NOT NULL
-- );

-- CREATE TABLE grupos_musculares (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     nome VARCHAR(50) UNIQUE NOT NULL
-- );

-- -- =========================
-- -- ALUNOS
-- -- =========================
-- CREATE TABLE alunos (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     nome VARCHAR(100) NOT NULL,
--     email VARCHAR(100) UNIQUE NOT NULL,
--     senha VARCHAR(255) NOT NULL,
--     genero_id INT NOT NULL,
--     objetivo_id INT NOT NULL,
--     problema_saude TEXT,
--     imagem VARCHAR(255),
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

--     FOREIGN KEY (genero_id) REFERENCES generos(id),
--     FOREIGN KEY (objetivo_id) REFERENCES objetivos(id)
-- );

-- -- =========================
-- -- PERSONAIS
-- -- =========================
-- CREATE TABLE personais (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     nome VARCHAR(100) NOT NULL,
--     email VARCHAR(100) UNIQUE NOT NULL,
--     senha VARCHAR(255) NOT NULL,
--     genero_id INT NOT NULL,
--     cref VARCHAR(20) UNIQUE NOT NULL,
--     certificados TEXT,
--     especialidade VARCHAR(255),
--     imagem VARCHAR(255),
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--
--     FOREIGN KEY (genero_id) REFERENCES generos(id)
-- );

-- -- =========================
-- -- EXERCICIOS
-- -- =========================
-- CREATE TABLE exercicios (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     nome VARCHAR(100) NOT NULL,
--     descricao TEXT,
--     grupo_muscular_id INT,
--     imagem VARCHAR(255),

--     FOREIGN KEY (grupo_muscular_id) REFERENCES grupos_musculares(id)
-- );

-- -- =========================
-- -- TREINOS
-- -- =========================
-- CREATE TABLE treinos (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     aluno_id INT NOT NULL,
--     personal_id INT NOT NULL,
--     nome VARCHAR(100),
--     imagem VARCHAR(255),
--     data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

--     FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
--     FOREIGN KEY (personal_id) REFERENCES personais(id) ON DELETE CASCADE
-- );

-- -- =========================
-- -- TREINO_EXERCICIOS
-- -- =========================
-- CREATE TABLE treino_exercicios (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     treino_id INT NOT NULL,
--     exercicio_id INT NOT NULL,

--     series INT NOT NULL,
--     repeticoes INT NOT NULL,
--     carga DECIMAL(6,2),
--     descanso INT,

--     UNIQUE (treino_id, exercicio_id),

--     FOREIGN KEY (treino_id) REFERENCES treinos(id) ON DELETE CASCADE,
--     FOREIGN KEY (exercicio_id) REFERENCES exercicios(id)
-- );

-- -- =========================
-- -- EXECUÇÃO DE TREINOS
-- -- =========================
-- CREATE TABLE execucoes_treino (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     treino_id INT NOT NULL,
--     data_execucao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

--     FOREIGN KEY (treino_id) REFERENCES treinos(id) ON DELETE CASCADE
-- );

-- CREATE TABLE execucoes_exercicios (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     execucao_id INT NOT NULL,
--     exercicio_id INT NOT NULL,

--     carga_usada DECIMAL(6,2),
--     repeticoes_feitas INT,

--     FOREIGN KEY (execucao_id) REFERENCES execucoes_treino(id) ON DELETE CASCADE,
--     FOREIGN KEY (exercicio_id) REFERENCES exercicios(id)
-- );

-- -- =========================
-- -- AVALIAÇÕES
-- -- =========================
-- CREATE TABLE avaliacoes (
--     id INT AUTO_INCREMENT PRIMARY KEY,

--     aluno_id INT NOT NULL,
--     personal_id INT NOT NULL,

--     avaliador_tipo ENUM('aluno', 'personal') NOT NULL,
--     avaliador_id INT NOT NULL,

--     nota INT NOT NULL,
--     comentario TEXT,
--     data_avaliacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

--     CHECK (nota >= 1 AND nota <= 5),

--     -- evita duplicidade de avaliação
--     UNIQUE (aluno_id, personal_id, avaliador_tipo),

--     FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
--     FOREIGN KEY (personal_id) REFERENCES personais(id) ON DELETE CASCADE
-- );

-- -- =========================
-- -- ÍNDICES (PERFORMANCE)
-- -- =========================
-- CREATE INDEX idx_treino_aluno ON treinos(aluno_id);
-- CREATE INDEX idx_treino_personal ON treinos(personal_id);

-- -- =========================
-- -- MIGRACAO COMPATIVEL
-- -- =========================
-- ALTER TABLE alunos ADD COLUMN altura FLOAT NULL;
-- ALTER TABLE alunos ADD COLUMN massa FLOAT NULL;
-- ALTER TABLE treinos ADD COLUMN imagem VARCHAR(255) NULL;

-- -- =========================
-- -- DADOS INICIAIS
-- -- =========================

-- -- GÊNEROS
-- INSERT INTO generos (nome) VALUES
-- ('masculino'),
-- ('feminino');

-- -- OBJETIVOS
-- INSERT INTO objetivos (nome) VALUES
-- ('emagrecer'),
-- ('ganhar_massa'),
-- ('manter_saude');

-- -- GRUPOS MUSCULARES
-- INSERT INTO grupos_musculares (nome) VALUES
-- ('Peito'),
-- ('Perna'),
-- ('Bíceps'),
-- ('Tríceps'),
-- ('Costas'),
-- ('Ombros');

-- -- -- ALUNO
-- -- INSERT INTO alunos (nome, email, senha, genero_id, objetivo_id)
-- -- VALUES ('Murilo Borges', 'murilo@email.com', 'HASH_AQUI', 1, 2);

-- -- -- PERSONAL
-- -- INSERT INTO personais (nome, email, senha, genero_id, cref)
-- -- VALUES ('João Trainer', 'joao@email.com', 'HASH_AQUI', 1, 'CREF12345');

-- -- -- EXERCÍCIOS
-- -- INSERT INTO exercicios (nome, grupo_muscular_id) VALUES
-- -- ('Supino', 1),
-- -- ('Agachamento', 2),
-- -- ('Rosca Bíceps', 3);

-- -- -- TREINO
-- -- INSERT INTO treinos (aluno_id, personal_id, nome)
-- -- VALUES (1, 1, 'Treino A');

-- -- -- TREINO EXERCÍCIOS
-- -- INSERT INTO treino_exercicios 
-- -- (treino_id, exercicio_id, series, repeticoes, carga, descanso)
-- -- VALUES
-- -- (1, 1, 3, 10, 40, 60),
-- -- (1, 2, 4, 12, 60, 90),
-- -- (1, 3, 3, 15, 20, 45);

-- -- -- EXECUÇÃO
-- -- INSERT INTO execucoes_treino (treino_id) VALUES (1);

-- -- INSERT INTO execucoes_exercicios 
-- -- (execucao_id, exercicio_id, carga_usada, repeticoes_feitas)
-- -- VALUES
-- -- (1, 1, 42, 10),
-- -- (1, 2, 65, 12),
-- -- (1, 3, 22, 15);

-- -- -- AVALIAÇÕES

-- -- -- aluno avaliando personal
-- -- INSERT INTO avaliacoes 
-- -- (aluno_id, personal_id, avaliador_tipo, avaliador_id, nota, comentario)
-- -- VALUES (1, 1, 'aluno', 1, 5, 'Ótimo personal');

-- -- -- personal avaliando aluno
-- -- INSERT INTO avaliacoes 
-- -- (aluno_id, personal_id, avaliador_tipo, avaliador_id, nota, comentario)
-- -- VALUES (1, 1, 'personal', 1, 4, 'Aluno dedicado');
