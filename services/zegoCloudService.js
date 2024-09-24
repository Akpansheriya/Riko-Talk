"use strict";

const crypto = require("crypto");

const ErrorCode = {
  success: 0,
  appIDInvalid: 1,
  userIDInvalid: 3,
  secretInvalid: 5,
  effectiveTimeInSecondsInvalid: 6,
  payloadInvalid: 7,
};

function RndNum(a, b) {
  return Math.ceil((a + (b - a)) * Math.random());
}

function makeRandomIv() {
  return crypto.randomBytes(16);
}

function getAlgorithm(key) {
  switch (key.length) {
    case 16:
      return "aes-128-cbc";
    case 24:
      return "aes-192-cbc";
    case 32:
      return "aes-256-cbc";
    default:
      throw new Error("Invalid key length: " + key.length);
  }
}

function aesEncrypt(plainText, key, iv) {
  const keyBuffer = Buffer.from(key, "utf8");
  const cipher = crypto.createCipheriv(getAlgorithm(keyBuffer), keyBuffer, iv);
  cipher.setAutoPadding(true);
  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);
  return encrypted;
}

function validateAndPreparePayload(payload) {
  if (payload && typeof payload !== "object" && typeof payload !== "string") {
    throw {
      errorCode: ErrorCode.payloadInvalid,
      errorMessage: "Payload must be an object or string",
    };
  }

  if (typeof payload === "object") {
    return JSON.stringify(payload);
  }

  return payload || "";
}

function generateToken04(
  appId,
  userId,
  secret,
  effectiveTimeInSeconds,
  payload
) {
  if (!appId || typeof appId !== "number") {
    throw { errorCode: ErrorCode.appIDInvalid, errorMessage: "appID invalid" };
  }
  if (!userId || typeof userId !== "string") {
    throw {
      errorCode: ErrorCode.userIDInvalid,
      errorMessage: "userId invalid",
    };
  }
  if (!secret || typeof secret !== "string" || secret.length !== 32) {
    throw {
      errorCode: ErrorCode.secretInvalid,
      errorMessage: "secret must be a 32-byte string",
    };
  }
  if (!effectiveTimeInSeconds || typeof effectiveTimeInSeconds !== "number") {
    throw {
      errorCode: ErrorCode.effectiveTimeInSecondsInvalid,
      errorMessage: "effectiveTimeInSeconds invalid",
    };
  }

  const preparedPayload = validateAndPreparePayload(payload);
  const createTime = Math.floor(Date.now() / 1000);
  const tokenInfo = {
    app_id: appId,
    user_id: userId,
    nonce: RndNum(-2147483648, 2147483647),
    ctime: createTime,
    expire: createTime + effectiveTimeInSeconds,
    payload: preparedPayload,
  };

  const plainText = JSON.stringify(tokenInfo);
  const iv = makeRandomIv();
  const encryptBuf = aesEncrypt(plainText, secret, iv);

  const [b1, b2, b3] = [
    new Uint8Array(8),
    new Uint8Array(2),
    new Uint8Array(2),
  ];
  new DataView(b1.buffer).setBigInt64(0, BigInt(tokenInfo.expire), false);
  new DataView(b2.buffer).setUint16(0, iv.length, false);
  new DataView(b3.buffer).setUint16(0, encryptBuf.byteLength, false);

  const buf = Buffer.concat([
    Buffer.from(b1),
    Buffer.from(b2),
    iv,
    Buffer.from(b3),
    encryptBuf,
  ]);

  return "04" + buf.toString("base64");
}

module.exports = { generateToken04 };
