import fs from "fs";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import database from "../database/index.js";

const downloadPath = `./download`;

const setup = async () => {
  if (!fs.existsSync(downloadPath)) {
    fs.mkdirSync(downloadPath);
  }
};

const downloadWithUrl = async (dataDB, url, id, index) => {
  await axios({
    url,
    responseType: "stream",
  })
    .then(
      async (response) =>
        await new Promise(async (resolve, reject) => {
          await response.data
            .pipe(fs.createWriteStream(`${downloadPath}/${id}.jpg`))
            .on("finish", () => {
              database.updateDownloadStatus(dataDB, id, true);
              resolve();
            })
            .on("error", (e) => reject(e));
        })
    )
    .catch((e) => {
      console.log("\x1b[33m%s\x1b[0m", e.message);
      database.updateDownloadStatus(dataDB, id, false);
      console.log(
        "\x1b[33m%s\x1b[0m",
        `Download fail ${index}: ${url.substr(0, 64)}`
      );
    });
};

const download = async (dataDB) => {
  const listdata = await database.getTableContent(dataDB);
  listdata.forEach(async (element, i) => {
    if (element?.url) {
      await downloadWithUrl(
        dataDB,
        element.url,
        element.id,
        `${i}/${listdata.length}`
      );
      console.log(
        `Downloaded ${i}/${listdata.length}: ${element.url.substr(0, 64)}${
          element.url.length > 64 ? "..." : null
        } `
      );
    }
  });
};
export default { setup, download };
