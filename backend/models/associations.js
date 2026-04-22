import { Aluno } from "./alunoM.js";
import { Personal } from "./personalM.js";
import { Treino } from "./treinoM.js";
import { TreinoExercicio } from "./treinoExercicioM.js";
import { Exercicio } from "./exercicioM.js";
import { Avaliacao } from "./avaliacaoM.js";
import { Genero } from "./generoM.js";
import { Objetivo } from "./objetivoM.js";
import { GrupoMuscular } from "./grupoMuscularM.js";

// Aluno → Gênero e Objetivo
Aluno.belongsTo(Genero, { foreignKey: "genero_id" });
Aluno.belongsTo(Objetivo, { foreignKey: "objetivo_id" });

// Aluno → Personal (N:1) - Um aluno pode ter um personal
Aluno.belongsTo(Personal, { foreignKey: "personal_id", as: "personal" });
// Personal → Alunos (1:N) - Um personal pode ter vários alunos
Personal.hasMany(Aluno, { foreignKey: "personal_id", as: "alunos" });

// Personal → Gênero
Personal.belongsTo(Genero, { foreignKey: "genero_id" });

// Exercício → Grupo Muscular
Exercicio.belongsTo(GrupoMuscular, { foreignKey: "grupo_muscular_id" });

// Aluno → Treinos
Aluno.hasMany(Treino, { foreignKey: "aluno_id" });
Treino.belongsTo(Aluno, { foreignKey: "aluno_id" });

// Personal → Treinos
Personal.hasMany(Treino, { foreignKey: "personal_id" });
Treino.belongsTo(Personal, { foreignKey: "personal_id" });

// Treino ↔ Exercícios
Treino.belongsToMany(Exercicio, {
    through: TreinoExercicio,
    foreignKey: "treino_id"
});

Exercicio.belongsToMany(Treino, {
    through: TreinoExercicio,
    foreignKey: "exercicio_id"
});

// Avaliações
Aluno.hasMany(Avaliacao, { foreignKey: "aluno_id" });
Personal.hasMany(Avaliacao, { foreignKey: "personal_id" });

Avaliacao.belongsTo(Aluno, { foreignKey: "aluno_id" });
Avaliacao.belongsTo(Personal, { foreignKey: "personal_id" });