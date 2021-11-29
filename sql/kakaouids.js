module.exports = {
  selectKakaouids: `/* SQL */
    SELECT 
      *
    FROM 
      kakaouids
    WHERE
      room = :room AND
      sender = :sender AND
      imageProfileBase64 = :imageProfileBase64
  `,
  selectKakaouidsOnlySender: `/* SQL */
    SELECT 
      *
    FROM 
      kakaouids
    WHERE
      room = :room AND
      sender = :sender
  `,
  insertKakaouids: `/* SQL */
    INSERT INTO kakaouids (
      room,
      sender, 
      imageProfileBase64,
      walletKey,
      point
    )
    VALUES(
      :room, 
      :sender, 
      :imageProfileBase64,
      :walletKey,
      :point
    )
  `,
  updateKakaouids: `/* SQL */
    UPDATE kakaouids 
    SET point = IFNULL(point, 0) + :point
    WHERE id = :kakaouid
  `,
  updateKakaouidsWallet: `/* SQL */
    UPDATE 
      kakaouids
    SET 
      walletKey = :walletKey
    WHERE
      room = :room AND
      sender = :sender AND
      imageProfileBase64 = :imageProfileBase64
  `,
  updateKakaouidsWalletOnlySender: `/* SQL */
    UPDATE 
      kakaouids
    SET 
      walletKey = :walletKey
    WHERE
      room = :room AND
      sender = :sender
  `,
};
