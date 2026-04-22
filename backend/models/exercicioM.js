import { DataTypes } from "sequelize";
import { sequelize } from "../config/banco.js";

export const Exercicio = sequelize.define('exercicios', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    nome: { type: DataTypes.STRING, allowNull: false },
    descricao: { type: DataTypes.TEXT },
    grupo_muscular_id: { type: DataTypes.INTEGER },
    imagem: { type: DataTypes.STRING }

}, {
    tableName: 'exercicios',
    timestamps: false,
});