import { sendMessage } from "../bot";

export async function start(roomId) {
  await sendMessage(roomId, "Hello.");
}
