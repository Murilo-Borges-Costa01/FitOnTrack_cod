import { Sequelize } from "sequelize";
export const sequelize = new Sequelize('db_fitontrack', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
})

sequelize
.authenticate()
.then(function(){
    console.log("Banco de dados conectado com sucesso");
})
.catch(function (error) {
    console.log("Erro ao conectar o banco" + error);
})
