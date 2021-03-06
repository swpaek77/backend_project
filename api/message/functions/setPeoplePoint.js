const numeral = require("numeral");
const { COMMAND_PREFIX } = require("../../../config");
const { selectKakaouidsOnlySender, selectKakaouids } = require("../../../sql/kakaouids");
const { selectBossCheck } = require("../../../sql/rooms");
const setPoint = require("./setPoint");

module.exports = async (trx, body) => {
  const commandSplit = body.message.substr(1, body.message.length).split(" ");
  const minusPoint = commandSplit[commandSplit.length - 1];
  let sender = "";
  commandSplit.filter((r, i) => {
    if (i !== 0 && i !== commandSplit.length - 1) sender += r + " ";
  });
  sender = sender.trim();

  if (!sender || !minusPoint) {
    throw Error(`ERROR|[μ°¨κ°μ€ν¨!π₯]\n${COMMAND_PREFIX}μ°¨κ° μ μ μ΄λ¦ μ°¨κ°ν¬μΈνΈ <- μ΄λ κ² μλ ₯ν΄μ£ΌμΈμ!!`);
  } else if (isNaN(minusPoint)) {
    throw Error(`ERROR|[μ°¨κ°μ€ν¨!π₯]\nμ°¨κ°ν¬μΈνΈλ μ€μνμΌλ‘ μ μ΄μ£ΌμΈμ!!`);
  } else if (minusPoint.split(".")[1] && minusPoint.split(".")[1].length > 3) {
    throw Error(`ERROR|[μ°¨κ°μ€ν¨!π₯]\nμ°¨κ°ν¬μΈνΈλ μ΅λ μμμ  3μλ¦¬κΉμ§λ§ κ°λ₯ν©λλ€!!`);
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
    throw Error(`ERROR|[μ°¨κ°μ€ν¨!π₯]\n${sender}λΌλ μ μ λ μ‘΄μ¬νμ§ μμ΅λλ€!!π`);
  } else if (getSender[0].length > 1) {
    throw Error(`ERROR|[μ°¨κ°μ€ν¨!π₯]\n${sender}λΌλ μ μ κ° ${getSender[0].length} λͺ μ‘΄μ¬ν©λλ€!!π μ΄λ¦μ λ°κΏμ£ΌμΈμ`);
  } else if (getSender[0][0].point < minusPoint) {
    throw Error(`ERROR|[μ°¨κ°μ€ν¨!π₯]\n${sender}λΌλ μ μ λ ${numeral(getSender[0][0].point).format("0,0.000")} ν¬μΈνΈ λ°μ μμ΅λλ€ π`);
  }

  await setPoint(trx, {
    kakaouid: getSender[0][0].id,
    room: body.room,
    sender: getSender[0][0].sender,
    message: "[ν¬μΈνΈμ°¨κ°]",
    point: -minusPoint,
    isPoint: true,
  });

  const getKakaouids = await trx.raw(selectKakaouids, {
    room: body.room,
    sender: getSender[0][0].sender,
    imageProfileBase64: getSender[0][0].imageProfileBase64,
  });

  return {
    result: "SUCCESS",
    message: `[${minusPoint} ν¬μΈνΈμ°¨κ°!!]
[${getKakaouids[0][0].sender}λμ ν¬μΈνΈ : ${numeral(getKakaouids[0][0].point).format("0,0.000")}]`.trim(),
  };
};
