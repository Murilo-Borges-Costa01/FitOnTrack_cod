import { DataTypes } from "sequelize";
import { sequelize } from "../config/banco.js";

export const Avaliacao = sequelize.define('avaliacoes', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    aluno_id: { type: DataTypes.INTEGER },
    personal_id: { type: DataTypes.INTEGER },

    avaliador_tipo: { type: DataTypes.ENUM('aluno', 'personal') },
    avaliador_id: { type: DataTypes.INTEGER },

    estrelas: { type: DataTypes.INTEGER, allowNull: false }, // 1-5
    comentario: { type: DataTypes.TEXT },
    anonimo: { type: DataTypes.BOOLEAN, defaultValue: true },
    data_criacao: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }

}, {
    tableName: 'avaliacoes',
    timestamps: false,
});