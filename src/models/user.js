import db from "./db";

const User = db.sequelize.define("user", {
  roomId: {
    type: db.Sequelize.STRING,
  },
  userId: {
    type: db.Sequelize.STRING,
    unique: true,
  },
});

export async function getUsers() {
  const result = await User.findAll({
    raw: true,
  });
  return result;
}

export default User;
