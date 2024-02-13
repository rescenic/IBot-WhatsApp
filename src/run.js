import { menu } from "./lib/menu.js";
import { SelectedMenu } from "./lib/message.js";
import { filtersMessage } from "./lib/system/filterMessage.js";
import qrcode from "qrcode-terminal";
import { Client } from "whatsapp-web.js";

const client = new Client({
  puppeteer: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log("Silahkan scan kode QR diatas!");
});

client.on("ready", () => {
  console.log("\nBerhasil terhubung WhatsApp!\n\n");
  console.log("History :\n");
});

client.on("message", async (message) => {
  const filterMessage =
    filtersMessage(message.body, menu) !== undefined
      ? filtersMessage(message.body, menu)
      : false;

  const phoneNumber =
    typeof message._data.id.participant === "string"
      ? message._data.id.participant.replace("@c.us", "")
      : message._data.from.replace("@c.us", "");

  console.log(
    `\x1b[36m[ ${message._data.notifyName} ] \x1b[35m${phoneNumber} => \x1b[33m${message.body} \x1b[37m`
  );

  if (
    SelectedMenu.hasOwnProperty(filterMessage.keyMessage) &&
    SelectedMenu[filterMessage.keyMessage](filterMessage.message) !== undefined
  ) {
    await message.react("⏳");

    try {
      const outputMessage = await SelectedMenu[filterMessage.keyMessage](
        filterMessage.message
      );

      await message.reply(outputMessage);
      await message.react("✅");
    } catch (error) {
      console.log(
        `\x1b[36m[ ${message._data.notifyName} ] \x1b[35m${phoneNumber} => \x1b[33mPesan Telah Di Hapus! \x1b[37m`
      );
    }
  }
});

client.initialize();