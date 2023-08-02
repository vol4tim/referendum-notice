import { Telegraf } from "telegraf";
import config from "../../config";
import logger from "../../utils/logger";
import { chat } from "./chat";

const options = {};
const bot = new Telegraf(config.telegram.token_bot, options);

export default bot;

export async function run() {
  await chat();
  bot.launch();
  logger.info("Telegram bot started!");
}

export function sendMessage(roomId, text, html) {
  if (html) {
    return bot.telegram.sendMessage(roomId, html, { parse_mode: "HTML" });
  }
  return bot.telegram.sendMessage(roomId, text);
}
