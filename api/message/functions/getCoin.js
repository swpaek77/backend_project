const axios = require("axios");
const numeral = require("numeral");
const { COMMAND_PREFIX } = require("../../../config");
const { selectCoinmarketcap } = require("../../../sql/coinmarketcap");
const { selectKakaouids } = require("../../../sql/kakaouids");
const { selectOptions } = require("../../../sql/options");
const setPoint = require("./setPoint");

module.exports = async (trx, body) => {
  const commandSplit = body.message.substr(1, body.message.length).split(" ");
  if (!commandSplit[1]) {
    throw Error(`ERROR|[μ‘°νμ€ν¨!π₯]\n${COMMAND_PREFIX}μ½μΈ μ½μΈμ΄λ¦ <- μ΄λ κ² μλ ₯ν΄μ£ΌμΈμ!!`);
  }

  const getCoinmarketcap = await trx.raw(selectCoinmarketcap);
  const searchCoin = getCoinmarketcap[0].find((r) => r.name === commandSplit[1]);
  if (!searchCoin || getCoinmarketcap[0].length === 0) {
    throw Error("ERROR|[μ‘°νμ€ν¨!π₯]\nλ±λ‘λ λ°μ΄ν°κ° μμ΅λλ€.");
  }

  const getKakaouids = await trx.raw(selectKakaouids, {
    room: body.room,
    sender: body.sender,
    imageProfileBase64: body.imageProfileBase64,
  });

  if (getKakaouids[0].length === 0) {
    throw Error("NO_REPLY|μμ§ λ±λ‘λμ§ μμμ΅λλ€π");
  }

  // Option κ°μ Έμ€κΈ°
  const getOptions = await trx.raw(selectOptions);
  const option = getOptions[0][0];
  const kakaouids = getKakaouids[0][0];
  const isPoint = option.selectCoinmarketcapCost <= kakaouids.point;

  await setPoint(trx, {
    kakaouid: kakaouids.id,
    room: body.room,
    sender: body.sender,
    message: "[κ°κ²©λ΄μ‘°ν]",
    point: -option.selectCoinmarketcapCost,
    isPoint,
  });

  if (!isPoint) {
    throw Error("ERROR|[μ‘°νμ€ν¨!π₯]\nν¬μΈνΈκ° λΆμ‘±ν©λλ€π");
  }

  const { data: vKRW } = await axios.get(option.coinmarketcapUrl + option.coinmarketcapKrwId);
  const { data: vCOIN } = await axios.get(option.coinmarketcapUrl + searchCoin.coinId);

  const priceKRW = vKRW.data[option.coinmarketcapKrwId].quote.USD.price;
  const priceCOIN = vCOIN.data[searchCoin.coinId].quote.USD.price;

  const changeCOIN = vCOIN.data[searchCoin.coinId].quote.USD.percent_change_24h;
  const changeCOINStatus = changeCOIN >= 0 ? "πΊ" : "π½";

  const priceCOIN_USD = vCOIN.data[searchCoin.coinId].quote.USD.price;
  const priceCOIN_KRW = priceCOIN / priceKRW;

  //prettier-ignore
  return {
    result: "SUCCESS",
    message: '[π CoinMarketCap μμΈ π³]\n\
    μ΄λ¦: [ ' + searchCoin.name + ' ]\n\
    κ°κ²©: [ ' + numeral(priceCOIN_KRW).format('0,0') + ' μ ]\n\
    λ¬λ¬: [ $ ' + numeral(priceCOIN_USD).format('0,0.00') + ' ]\n\
    λ³λ: [ ' + numeral(changeCOIN).format('0,0.00') + ' % ' + changeCOINStatus + ' ]'.trim(),
  };
};
