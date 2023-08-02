import User from "../../models/userTelegram";
import bot from "./bot";

export async function chat() {
  bot.start(async (ctx) => {
    let user = await User.findOne({ where: { userId: ctx.from.id } });
    if (user === null) {
      user = await User.create({
        userId: ctx.from.id,
        username: ctx.from.username,
      });
    }

    return ctx.replyWithHTML(`Hello ${user.username}.`);
  });
}
