const chalk = require("chalk");
const moment = require("moment");
const cheerio = require("cheerio");
const fetch = require("node-fetch");
const SMSActivate = require("sms-activate");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const sms = new SMSActivate(process.env.SMS_ACTIVATE_TOKEN);

const generateRandomString = (length) =>
  new Promise((resolve, reject) => {
    const characters = "0123456789abcdef";
    let result = "";

    for (let i = 0; i < length; i++) {
      if (i === 8 || i === 13 || i === 18 || i === 23) {
        result += "-";
      } else {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
      }
    }

    resolve(result);
  });

const generateRandNumber = (length) =>
  new Promise((resolve, reject) => {
    let num = "";

    for (let i = 0; i < length; i++) {
      num += Math.floor(Math.random() * 10);
    }

    resolve(num);
  });

const generateUniqueId = (length) =>
  new Promise((resolve, reject) => {
    let text = "";
    let possible = "abcdefghijklmnopqrstuvwxyz1234567890";

    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    resolve(text);
  });

const generateIndoName = () =>
  new Promise((resolve, reject) => {
    fetch("https://www.random-name-generator.com/indonesia?search_terms=&n=1", {
      method: "GET",
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-encoding": "gzip, deflate, br",
      },
    })
      .then((res) => res.text())
      .then((text) => {
        const $ = cheerio.load(text);
        const result = $("div.col-sm-12").find("dd.h4").text();
        const res = result.replace(/\s*\([^)]*\)/g, "");
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });

const getVerifId = (uniqueId, transactionId, phoneNumber) =>
  new Promise((resolve, reject) => {
    fetch("https://accounts.goto-products.com/cvs/v1/methods", {
      method: "POST",
      headers: {
        "Transaction-Id": transactionId,
        Authorization: "",
        "X-Appversion": "4.78.3",
        "X-Deviceos": "Android,7.0",
        "X-Uniqueid": uniqueId,
        "X-Phonemake": "unknown",
        "X-Appid": "com.gojek.app",
        "X-User-Type": "customer",
        "X-Phonemodel": "Google,Pixel 3",
        "X-Cvsdk-Version": "1.3.3",
        "Accept-Language": "id-ID",
        "Content-Type": "application/json; charset=UTF-8",
        "Content-Length": "149",
        "Accept-Encoding": "gzip, deflate, br",
        "User-Agent": "okhttp/4.10.0",
        Connection: "close",
      },
      body: `{"client_id":"gojek:consumer:app","client_secret":"pGwQ7oi8bKqqwvid09UrjqpkMEHklb","country_code":"+62","flow":"signup","phone_number":"${phoneNumber}"}`,
    })
      .then((res) => res.json())
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });

const getOtpToken = (uniqueId, transactionId, verifId, phoneNumber) =>
  new Promise((resolve, reject) => {
    fetch("https://accounts.goto-products.com/cvs/v1/initiate", {
      method: "POST",
      headers: {
        "Transaction-Id": transactionId,
        Authorization: "",
        "X-Appversion": "4.78.3",
        "X-Deviceos": "Android,7.0",
        "X-Uniqueid": uniqueId,
        "X-Phonemake": "unknown",
        "X-Appid": "com.gojek.app",
        "X-User-Type": "customer",
        "X-Phonemodel": "Google,Pixel 3",
        "X-Cvsdk-Version": "1.3.3",
        "Accept-Language": "id-ID,",
        "User-Agent": "Gojek/4.78.3 (Android 7.0)",
        "Content-Type": "application/json; charset=UTF-8",
        "Content-Length": "238",
        "Accept-Encoding": "gzip, deflate, br",
      },
      body: `{"client_id":"gojek:consumer:app","client_secret":"pGwQ7oi8bKqqwvid09UrjqpkMEHklb","country_code":"+62","flow":"signup","phone_number":"${phoneNumber}","verification_id":"${verifId}","verification_method":"otp_sms"}`,
    })
      .then((res) => res.json())
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });

const verifOtp = (uniqueId, verification_id, transactionId, otp, otpToken) =>
  new Promise((resolve, reject) => {
    fetch("https://accounts.goto-products.com/cvs/v1/verify", {
      method: "POST",
      headers: {
        "Transaction-Id": transactionId,
        "X-Appversion": "4.78.3",
        "X-Deviceos": "Android,7.0",
        "X-Uniqueid": uniqueId,
        "X-Phonemake": "unknown",
        "X-Appid": "com.gojek.app",
        "X-User-Type": "customer",
        "X-Phonemodel": "Google,Pixel 3",
        "X-Cvsdk-Version": "1.3.3",
        "Accept-Language": "id-ID",
        "Content-Type": "application/json; charset=UTF-8",
        "Content-Length": "261",
        "Accept-Encoding": "gzip, deflate, br",
        "User-Agent": "okhttp/4.10.0",
      },
      body: `{"client_id":"gojek:consumer:app","client_secret":"pGwQ7oi8bKqqwvid09UrjqpkMEHklb","data":{"otp":"${otp}","otp_token":"${otpToken}"},"flow":"signup","verification_id":"${verification_id}","verification_method":"otp_sms"}`,
    })
      .then((res) => res.json())
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });

const registerUser = (
  name,
  email,
  sessionId,
  phoneNumber,
  uniqueId,
  verification_token
) =>
  new Promise((resolve, reject) => {
    fetch("https://api.gojekapi.com/v7/customers/signup", {
      method: "POST",
      headers: {
        Host: "api.gojekapi.com",
        "X-Devicechecktoken": "LITMUS_DISABLED",
        "X-Signature": "2001",
        "X-Signature-Time": moment().unix().toString(),
        "Verification-Token": `Bearer ${verification_token}`,
        Authorization: `Basic ZjM4OTcxMDktOGJjZi00NjU4LWE2M2QtMTAwNjI1NjJiNTgx`,
        D1: "8D:0C:D3:21:40:73:88:51:C5:05:29:D4:98:64:B6:8D:8F:D1:73:ED:A8:10:29:4D:45:39:93:D8:E9:48:E9:2C",
        "X-Platform": "Android",
        "X-Uniqueid": uniqueId,
        Accept: "application/json",
        "X-Appversion": "4.78.3",
        "X-Appid": "com.gojek.app",
        "X-Session-Id": sessionId,
        "X-Deviceos": "Android,7.0",
        "X-User-Type": "customer",
        "X-Phonemake": "unknown",
        "X-Devicetoken": "",
        "X-Pushtokentype": "FCM",
        "X-Phonemodel": "Google,Pixel 3",
        "User-Uuid": "",
        "Accept-Language": "id-ID",
        "X-User-Locale": "id_ID",
        "X-Location": "",
        "X-Location-Accuracy": "",
        "Gojek-Country-Code": "ID",
        "X-M1":
          '1:UNKNOWN,2:UNKNOWN,3:1699772693817-7922406335021327819,4:12756,5:|UNKNOWN|4,6:UNKNOWN,7:"WiredSSID",8:1080x2028,9:,10:1,11:UNKNOWN,12:VGUARD_NOT_INITIALISED,13:2001,14:1699773891,16:0,17:1',
        "Content-Type": "application/json; charset=UTF-8",
        "Content-Length": "243",
        "Accept-Encoding": "gzip, deflate, br",
        "User-Agent": "okhttp/4.10.0",
      },
      body: `{"client_name":"gojek:consumer:app","client_secret":"pGwQ7oi8bKqqwvid09UrjqpkMEHklb","data":{"consent_given":true,"email":"${email}","name":"${name}","onboarding_partner":"android","phone":"+${phoneNumber}","signed_up_country":"ID"}}`,
    })
      .then((res) => res.json())
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });

(async () => {
  const balance = await sms.getBalance();

  if (balance > 1) {
    const { id, number } = await sms.getNumber("ni", 6);
    await sms.setStatus(id, 1);
    const phoneNumber = number;
    console.log("");
    const transactionId = await generateRandomString(36);
    console.log(
      `[${moment().format("HH:mm:ss")}]`,
      chalk.green(`Mencoba register dengan no hp ${phoneNumber}`)
    );

    const uniqueId = await generateUniqueId(16);

    const getVerifIdResult = await getVerifId(
      uniqueId,
      transactionId,
      phoneNumber.toString().replace("62", "")
    );

    const verifId = getVerifIdResult.data.verification_id;
    const getOtpTokenResult = await getOtpToken(
      uniqueId,
      transactionId,
      verifId,
      phoneNumber.toString().replace("62", "")
    );

    if (getOtpTokenResult.success) {
      let otpCode1;
      const otpToken = getOtpTokenResult.data.otp_token;
      console.log(
        `[${moment().format("HH:mm:ss")}]`,
        chalk.green(`Mencoba mengambil otp dari nomor ${phoneNumber}`)
      );
      do {
        otpCode1 = await sms.getCode(id);
        if (otpCode1) {
          await sms.setStatus(id, 3);
        }
      } while (!otpCode1);

      console.log(
        `[${moment().format("HH:mm:ss")}]`,
        chalk.green(`Berhasil mendapatkan otp ${otpCode1}`)
      );

      const verifOtpResult = await verifOtp(
        uniqueId,
        verifId,
        transactionId,
        otpCode1,
        otpToken
      );

      if (verifOtpResult.success) {
        const randNum = await generateRandNumber(4);
        const indoName = await generateIndoName();
        const email = `${indoName
          .split(" ")
          .join("")
          .toLowerCase()}${randNum}@gmail.com`;

        console.log(
          `[${moment().format("HH:mm:ss")}]`,
          chalk.green(
            `Mencoba mendaftar dengan nama: ${indoName} email: ${email}`
          )
        );

        const sessionId = uuidv4();
        const verifToken = verifOtpResult.data.verification_token;

        const registerUserResult = await registerUser(
          indoName,
          email,
          sessionId,
          phoneNumber,
          uniqueId,
          verifToken
        );

        if (registerUserResult.success) {
          console.log(registerUserResult.data.customer);
        }
      }
    } else {
      console.log(
        `[${moment().format("HH:mm:ss")}]`,
        chalk.red(`Gagal ${getOtpTokenResult.errors[0].message}`)
      );
    }
  } else {
    console.log("You don't have enough money");
  }
})();
