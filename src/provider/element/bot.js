import {
  AutojoinRoomsMixin,
  MatrixClient,
  RustSdkCryptoStorageProvider,
  SimpleFsStorageProvider,
} from "matrix-bot-sdk";
import config from "../../config";
import logger from "../../utils/logger";
import { chat } from "./chat";

const storage = new SimpleFsStorageProvider(config.bot.storage);
const cryptoProvider = config.bot.crypto
  ? new RustSdkCryptoStorageProvider(config.bot.crypto)
  : undefined;

export const client = new MatrixClient(
  config.bot.serverUrl,
  config.bot.accessToken,
  storage,
  cryptoProvider
);
AutojoinRoomsMixin.setupOnClient(client);

export async function run() {
  await chat();
  try {
    await client.start();
    logger.info("Element bot started!");
  } catch (e) {
    logger.error("Start", e);
  }
}

export function sendMessage(roomId, text, html) {
  if (html) {
    return client.sendMessage(roomId, {
      msgtype: "m.text",
      body: text,
      format: "org.matrix.custom.html",
      formatted_body: html,
    });
  }
  return client.sendMessage(roomId, {
    msgtype: "m.text",
    body: text,
  });
}
