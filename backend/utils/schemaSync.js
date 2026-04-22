import { DataTypes } from "sequelize";
import { sequelize } from "../config/banco.js";

async function ensureColumn(tableName, columnName, definition) {
    const queryInterface = sequelize.getQueryInterface();
    const tableDefinition = await queryInterface.describeTable(tableName);

    if (!tableDefinition[columnName]) {
        await queryInterface.addColumn(tableName, columnName, definition);
    }
}

export async function ensureSchemaCompatibility() {
    await ensureColumn("alunos", "imagem", {
        type: DataTypes.STRING(255),
        allowNull: true
    });

    await ensureColumn("alunos", "altura", {
        type: DataTypes.FLOAT,
        allowNull: true
    });

    await ensureColumn("alunos", "massa", {
        type: DataTypes.FLOAT,
        allowNull: true
    });

    await ensureColumn("alunos", "personal_id", {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "personais",
            key: "id"
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
    });

    await ensureColumn("personais", "imagem", {
        type: DataTypes.STRING(255),
        allowNull: true
    });

    await ensureColumn("personais", "certificados", {
        type: DataTypes.TEXT,
        allowNull: true
    });

    await ensureColumn("personais", "especialidade", {
        type: DataTypes.STRING(255),
        allowNull: true
    });

    await ensureColumn("treinos", "imagem", {
        type: DataTypes.STRING(255),
        allowNull: true
    });

    // Colunas para sistema de avaliação
    await ensureColumn("avaliacoes", "estrelas", {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5
    });

    await ensureColumn("avaliacoes", "anonimo", {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    });

    await ensureColumn("avaliacoes", "data_criacao", {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    });
}
