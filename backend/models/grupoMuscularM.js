import { DataTypes } from "sequelize";
import { sequelize } from "../config/banco.js";

export const GrupoMuscular = sequelize.define('grupos_musculares', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nome: { type: DataTypes.STRING(191), allowNull: false, unique: true }
}, {
    tableName: 'grupos_musculares',
    timestamps: false,
});