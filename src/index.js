import db from "./models/db";
// import * as element from "./provider/element/bot";
import config from "./config";
import * as telegram from "./provider/telegram/bot";
import { IpcServer } from "./utils/ipc/server";

const ipc = new IpcServer(config.ipc.port);
ipc.on("sendMessage", async (message, reply) => {
  if (message.roomId && message.text && message.type) {
    try {
      if (message.type === "element") {
        // await element.sendMessage(message.roomId, message.text, message.html);
      } else if (message.type === "telegram") {
        await telegram.sendMessage(message.roomId, message.text, message.html);
      }
      reply(
        {
          id: message.id,
          result: true,
        },
        "sendMessageResponse"
      );
    } catch (e) {
      reply(
        {
          id: message.id,
          error: e.message,
        },
        "sendMessageResponse"
      );
    }
  } else {
    reply(
      {
        id: message.id,
        error: "Not Found message",
      },
      "sendMessageResponse"
    );
  }
});

(async function () {
  await db.sequelize.sync();
  // await element.run();
  await telegram.run();
})();
