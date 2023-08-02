import db from "./db";

const UserTelegram = db.sequelize.define("user-telegram", {
  userId: {
    type: db.Sequelize.STRING,
  },
  username: {
    type: db.Sequelize.STRING,
    unique: true,
  },
});

export default UserTelegram;
