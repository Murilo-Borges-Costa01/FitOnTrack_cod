import { DataTypes } from "sequelize";
import { sequelize } from "../config/banco.js";

export const Personal = sequelize.define('personais', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    cref: { type: DataTypes.STRING(191), allowNull: false, unique: true },

    nome: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING(191), allowNull: false, unique: true },
    senha: { type: DataTypes.STRING, allowNull: false },

    genero_id: { type: DataTypes.INTEGER, allowNull: false },

    certificados: { type: DataTypes.TEXT, allowNull: true },
    especialidade: { type: DataTypes.STRING, allowNull: true },

    imagem: { type: DataTypes.STRING }

}, {
    tableName: 'personais',
    timestamps: false,
});