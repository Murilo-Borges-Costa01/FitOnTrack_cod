import { DataTypes } from "sequelize";
import { sequelize } from "../config/banco.js";

export const Objetivo = sequelize.define('objetivos', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nome: { type: DataTypes.STRING(191), allowNull: false, unique: true }
}, {
    tableName: 'objetivos',
    timestamps: false,
});