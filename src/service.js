import config from "./config";
import command from "./cron/events.js";
import db from "./models/db";
import { IpcClient } from "./utils/ipc/client";

(async function () {
  const cbs = {};
  const ipc = new IpcClient(config.ipc.port);
  ipc.on("sendMessageResponse", (data) => {
    if (cbs[data.id]) {
      cbs[data.id](data);
    }
  });
  const bot = {
    sendMessage(type, roomId, text, html, cb) {
      if (roomId) {
        const id = `${roomId}-${Date.now()}`;
        cbs[id] = cb;
        ipc.send("sendMessage", {
          type,
          id: id,
          roomId,
          text,
          html,
        });
      } else if (cb) {
        cb({ error: "Not roomId" });
      }
    },
  };
  await db.sequelize.sync();
  await command(bot);
})();
