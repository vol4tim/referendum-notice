import path from "path";
import Sequelize from "sequelize";

export const PATH_DB = path.join(__dirname, "/../../files/database.sqlite");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: PATH_DB,
  logging: false, //console.log
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.model = {};

export default db;
