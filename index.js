import _ from "lodash";
import Command from "./helpers/command/index.js";
import Database from "./helpers/database/index.js";
import DataCrawl from "./helpers/dataCrawl/index.js";
import ImgFilter from "./helpers/filter/index.js";
import download from "./helpers/download/index.js";

const Crawler = async () => {
  /* ****************************************************
   *                --- Setup Database ---              *
   **************************************************** */
  let dataDB = await Database.setup();

  /* ****************************************************
   *         --- CHECK LINE COMMAND OPTION ---          *
   * CRAWL: crawl only                                  *
   * DOWNLOAD: download to specific directory           *
   * STREAM: send each result vie socket configuration  *
   **************************************************** */
  let lineParams = await process.argv;
  lineParams = await _.slice(lineParams, 2, lineParams.length);
  if (await Command.isCommand(lineParams, [Command.CMDKey.CRAWL])) {
    let keyword = _.last(lineParams);
    /* ****************************************************
     *                    --- Crawl ---                   *
     **************************************************** */
    await console.log("\x1b[36m%s\x1b[0m", `Start crawl with...- ${keyword} -`);
    const dataUrls = await DataCrawl.getImageUrl(keyword, 1, dataDB);
    /* ****************************************************
     *                  --- End Crawl ---                 *
     **************************************************** */
  } else if (await Command.isCommand(lineParams, [Command.CMDKey.DOWNLOAD])) {
    await download.setup();
    await download.download(dataDB);
  } else if (await Command.isCommand(lineParams, [Command.CMDKey.MONITOR])) {
    Database.count(dataDB);
  } else if (
    await Command.isCommand(lineParams, [
      Command.CMDKey.FILTER,
      Command.CMDKey.DUPLICATE,
      Command.CMDKey.CONTENT,
    ])
  ) {
    ImgFilter.compareImageContent();
  } else if (
    await Command.isCommand(lineParams, [
      Command.CMDKey.FILTER,
      Command.CMDKey.URL,
    ])
  ) {
    ImgFilter.removeDuplicateURL();
  } else if (await Command.isCommand(lineParams, [Command.CMDKey.HELP])) {
    Command.logHelp();
  } else {
    Command.logHelp();
  }
  // await Database.close(dataDB);
  return null;
};

if (Crawler) {
  Crawler();
}
