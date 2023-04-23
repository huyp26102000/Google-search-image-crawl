import puppeteer from "puppeteer";
import uuid4 from "uuid4";
import fs from "fs";
import Action from "./action.js";

const outputLocation = "./helpers/dataCrawl/output";

const createUrl = async (key) => {
  const listKey = await key.split(" ");
  let keyWord = await "";
  await listKey.forEach((word, i) => {
    keyWord += i < listKey.length - 1 ? `${word}+` : `${word}`;
  });
  return `https://www.google.com.vn/search?q=${keyWord}&source=lnms&tbm=isch&sa=X`;
};

const screenshot = async (url) => {
  if (!fs.existsSync(outputLocation)) {
    fs.mkdirSync(outputLocation);
  }
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000);
  await page.goto(url);
  await page.screenshot({ path: `${outputLocation}/${uuid4()}.png` });

  await browser.close();
};

const getImageUrl = async (key, level, dataDB) => {
  const searchUrl = await createUrl(key);
  const browser = await puppeteer.launch({ headless: true }); //
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000);
  await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 0 });
  await Action.scrollToBottom(page);
  await page.waitForTimeout(1000);

  const level1ImagesRef = await Action.getLevel1RefAddress(page);
  await console.log(
    "\x1b[36m%s\x1b[0m",
    `Found ${level1ImagesRef.length} result at level 1 !`
  );
  const listLv2Url = await Action.goToRefLocation(page, level1ImagesRef.slice(0, 100));
  if (listLv2Url?.length > 0) {
    const crawlResult = await Action.getLevel2RefAddress(
      page,
      listLv2Url,
      key,
      dataDB
    );
    await console.log(
      "\x1b[36m%s\x1b[0m",
      `Found ${crawlResult.length} result at level 2 !`
    );
    await console.log("\x1b[33m%s\x1b[0m", `Complete.`);
    await page.close();
    return await crawlResult;
  }
};

export default { screenshot, getImageUrl };
