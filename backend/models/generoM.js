import { DataTypes } from "sequelize";
import { sequelize } from "../config/banco.js";

export const Genero = sequelize.define('generos', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nome: { type: DataTypes.STRING(191), allowNull: false, unique: true }
}, {
    tableName: 'generos',
    timestamps: false,
});