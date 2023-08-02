import User from "../models/user";
import UserTelegram from "../models/userTelegram";
import logger from "../utils/logger";
import { chain } from "../utils/parachain";

async function getProposal(api, proposal_index) {
  const publicProps = await api.query.democracy.publicProps();
  for (const item of publicProps) {
    if (item[0].toNumber() === proposal_index) {
      const proposal_hash = item[1].toString();
      const preImages = await api.query.democracy.preimages(proposal_hash);
      const action = await getAction(api, proposal_hash);
      return { proposal_index, proposal_hash, ...preImages.toHuman(), action };
    }
  }
  return false;
}
async function getReferendum(api, ref_index) {
  const data = await api.query.democracy.referendumInfoOf(ref_index);
  if (data.isEmpty) {
    return false;
  }
  const action = await getAction(api, data.toJSON().ongoing.proposalHash);
  return { ref_index, ...data.toJSON(), action };
}
async function getAction(api, proposal_hash) {
  const data = await api.derive.democracy.preimage(proposal_hash);
  return data.proposal.toHuman();
}

async function send(bot, message, html) {
  const users = await User.findAll();
  for (const user of users) {
    await bot.sendMessage("element", user.roomId, message, html);
  }
  const usersTelegram = await UserTelegram.findAll();
  for (const user of usersTelegram) {
    await bot.sendMessage("telegram", user.userId, message, html);
  }
}

export default async function (bot) {
  const { api } = await chain();

  api.query.system.events(async (events) => {
    for (const record of events) {
      const { event, phase } = record;
      // if (phase.isNone) {
      //   return;
      // }
      const indexEvent = Number(phase.value.toString());
      const signedBlock = await api.rpc.chain.getBlock();
      const block = signedBlock.block.header.number.toNumber();

      const types = event.typeDef;

      if (event.section === "democracy" && event.method === "PreimageNoted") {
        logger.info("PreimageNoted");
        event.data.forEach((data, index) => {
          logger.info(`\t${types[index].type}: ${data.toString()}`);
        });
        // send(bot, `PreimageNoted`);
      }
      if (event.section === "democracy" && event.method === "Proposed") {
        logger.info("Propose");

        const proposal_index = event.data[0].toNumber();
        const proposal = await getProposal(api, proposal_index);
        if (proposal) {
          logger.info("=== NEW PROPOSAL ===");
          logger.info(JSON.stringify(proposal));
          send(
            bot,
            `NEW PROPOSAL \n\n ${JSON.stringify(
              proposal.action,
              undefined,
              2
            )}`,
            `NEW PROPOSAL \n\n <pre>${JSON.stringify(
              proposal.action,
              undefined,
              2
            )}</pre>\n
            <a href="https://robonomics.subscan.io/extrinsic/${block}-${indexEvent}">View</a>
            `
          );
        }
      }
      if (event.section === "democracy" && event.method === "Started") {
        logger.info("Started");
        const ref_index = event.data[0].toNumber();
        const ref = await getReferendum(api, ref_index);
        if (ref) {
          logger.info("Started referendum");
          logger.info(JSON.stringify(ref));
          send(bot, `Started referendum`);
        }
      }
      if (event.section === "democracy" && event.method === "NotPassed") {
        logger.info(`\t\t${event.meta}`);
        logger.info("NotPassed");
        event.data.forEach((data, index) => {
          logger.info(`\t\t\t${types[index].type}: ${data.toString()}`);
        });
      }
    }
  });
}
