const numeral = require("numeral");
const { COMMAND_PREFIX } = require("../../../config");
const { selectKakaouidsOnlySender, selectKakaouids, updateKakaouidsWallet, updateKakaouidsWalletOnlySender } = require("../../../sql/kakaouids");
const { selectBossCheck } = require("../../../sql/rooms");
const setPoint = require("./setPoint");

module.exports = async (trx, body) => {
  const commandSplit = body.message.substr(1, body.message.length).split(" ");
  let sender = "";
  commandSplit.filter((r, i) => {
    if (i !== 0 && i !== commandSplit.length) sender += r + " ";
  });
  sender = sender.trim();

  if (!sender) {
    throw Error(`ERROR|[ν΄μ μ€ν¨!π₯]\n${COMMAND_PREFIX}κ°μ μ§κ°ν΄μ  μ μ μ΄λ¦ <- μ΄λ κ² μλ ₯ν΄μ£ΌμΈμ!!`);
  }

  const getBossCheck = await trx.raw(selectBossCheck, {
    room: body.room,
    sender: body.sender,
    imageProfileBase64: body.imageProfileBase64,
  });

  if (getBossCheck[0].length === 0) {
    throw Error("ERROR|λΉμ μ λ°©μ₯μ΄ μλλλ€π λ°©μ₯λ§ μ¬μ©κ°λ₯ν©λλ€!");
  }

  const getSender = await trx.raw(selectKakaouidsOnlySender, {
    room: body.room,
    sender,
  });

  if (getSender[0].length === 0) {
    throw Error(`ERROR|[ν΄μ μ€ν¨!π₯]\n${sender}λΌλ μ μ λ μ‘΄μ¬νμ§ μμ΅λλ€!!π`);
  } else if (getSender[0].length > 1) {
    throw Error(`ERROR|[ν΄μ μ€ν¨!π₯]\n${sender}λΌλ μ μ κ° ${getSender[0].length} λͺ μ‘΄μ¬ν©λλ€!!π μ΄λ¦μ λ°κΏμ£ΌμΈμ`);
  }

  await trx.raw(updateKakaouidsWalletOnlySender, {
    room: getSender[0][0].room,
    sender: getSender[0][0].sender,
    walletKey: null,
  });

  return { result: "SUCCESS", message: `[${getSender[0][0].sender}λ μ§κ°ν΄μ μλ£!π]` };
};
