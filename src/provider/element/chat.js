import db from "../../models/db";
import User from "../../models/user";
import { client, sendMessage } from "../../provider/element/bot";
import logger from "../../utils/logger";
import { commands } from "./commands";

async function handleMessage(roomId, event) {
  if (event.content?.msgtype !== "m.text") return;
  if (event.sender === (await client.getUserId())) return;

  const body = event.content.body.trim();

  let user = await User.findOne({ where: { userId: event.sender } });
  if (user === null) {
    const username = event.sender.split(";")[0];
    let isUsername = await User.findOne({
      where: {
        [db.Sequelize.Op.and]: [
          { userId: { [db.Sequelize.Op.like]: `${username}:%` } },
          { userId: { [db.Sequelize.Op.not]: event.sender } },
        ],
      },
    });
    if (isUsername) {
      await sendMessage(
        roomId,
        `You are already using an account ${isUsername.userId}`
      );
      return;
    }
    user = await User.create({
      userId: event.sender,
      roomId: roomId,
    });
  } else if (user.roomId !== roomId) {
    logger.warn(
      `update ${event.sender}: old roomId ${user.roomId}, new roomId ${roomId}`
    );
    await user.update({ roomId: roomId });
  }

  if (body.substring(0, 1) === "!") {
    const command = body.substring(1, body.length);
    if (commands[command]) {
      return commands[command](roomId, user);
    }
    return sendMessage(roomId, "Not found command");
  }
}

export async function chat() {
  client.on("room.message", handleMessage);

  client.on("room.join", (roomId) => {
    logger.info(`room.join ${roomId}`);
    commands.start(roomId);
  });
}
