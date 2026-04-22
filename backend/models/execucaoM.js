import { DataTypes } from "sequelize";
import { sequelize } from "../config/banco.js";

export const ExecucaoTreino = sequelize.define('execucoes_treino', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    treino_id: { type: DataTypes.INTEGER }
}, {
    tableName: 'execucoes_treino',
    timestamps: false,
});

export const ExecucaoExercicio = sequelize.define('execucoes_exercicios', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    execucao_id: { type: DataTypes.INTEGER },
    exercicio_id: { type: DataTypes.INTEGER },

    carga_usada: { type: DataTypes.FLOAT },
    repeticoes_feitas: { type: DataTypes.INTEGER }

}, {
    tableName: 'execucoes_exercicios',
    timestamps: false,
});