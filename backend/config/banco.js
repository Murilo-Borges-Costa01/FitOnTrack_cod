import "dotenv/config";
import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(
    process.env.DB_NAME || "db_fitontrack",
    process.env.DB_USER || "root",
    process.env.DB_PASSWORD || "",
    {
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT || 3306),
        dialect: process.env.DB_DIALECT || "mysql"
    }
);

sequelize
.authenticate()
.then(function(){
    console.log("Banco de dados conectado com sucesso");
})
.catch(function (error) {
    console.log("Erro ao conectar o banco" + error);
});
