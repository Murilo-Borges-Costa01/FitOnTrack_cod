import { DataTypes } from "sequelize";
import { sequelize } from "../config/banco.js";

export const Treino = sequelize.define('treinos', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    aluno_id: { type: DataTypes.INTEGER },
    personal_id: { type: DataTypes.INTEGER },

    nome: { type: DataTypes.STRING },
    imagem: { type: DataTypes.STRING },
    data_criacao: { type: DataTypes.DATE }

}, {
    tableName: 'treinos',
    timestamps: false,
});
