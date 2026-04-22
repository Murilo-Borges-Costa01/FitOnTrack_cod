import { DataTypes } from "sequelize";
import { sequelize } from "../config/banco.js";

export const TreinoExercicio = sequelize.define('treino_exercicios', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    treino_id: { type: DataTypes.INTEGER },
    exercicio_id: { type: DataTypes.INTEGER },

    series: { type: DataTypes.INTEGER },
    repeticoes: { type: DataTypes.INTEGER },
    carga: { type: DataTypes.FLOAT },
    descanso: { type: DataTypes.INTEGER }

}, {
    tableName: 'treino_exercicios',
    timestamps: false,
});