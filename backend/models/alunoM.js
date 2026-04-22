import { DataTypes } from "sequelize";
import { sequelize } from "../config/banco.js";

export const Aluno = sequelize.define('alunos', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    nome: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING(191), allowNull: false, unique: true },
    senha: { type: DataTypes.STRING, allowNull: false },

    genero_id: { type: DataTypes.INTEGER, allowNull: false },
    objetivo_id: { type: DataTypes.INTEGER, allowNull: false },

    personal_id: { type: DataTypes.INTEGER, allowNull: true }, // FK para personal

    problema_saude: { type: DataTypes.TEXT },
    imagem: { type: DataTypes.STRING },
    altura: { type: DataTypes.FLOAT, allowNull: true },
    massa: { type: DataTypes.FLOAT, allowNull: true },

    created_at: { type: DataTypes.DATE }

}, {
    tableName: 'alunos',
    timestamps: false,
});


// import { DataTypes } from "sequelize";
// import { sequelize } from "./banco.js";

// export const Aluno = sequelize.define('alunos', {
//     id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//     },

//     nome: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },

//     email: {
//         type: DataTypes.STRING,
//         allowNull: false,
//         unique: true,
//     },

//     senha: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },

//     genero_id: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//     },

//     objetivo_id: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//     },

//     imagem: {
//         type: DataTypes.STRING,
//     },

//     created_at: {
//         type: DataTypes.DATE,
//         defaultValue: DataTypes.NOW,
//     }

// }, {
//     tableName: 'alunos',
//     timestamps: false,
// });

// ❌ NÃO usar sync aqui (você já criou o banco via SQL)
