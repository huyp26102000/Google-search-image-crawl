import Database from "../database/index.js";
const scrollToBottom = async (page) => {
  await console.log("\x1b[33m%s\x1b[0m", `Loaded page, scrolling page`);
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 100;
      var count = 0;
      var curImages = 0;

      // get element
      const button = document.querySelector("input[class=mye4qd][type=button]");

      // start to scroll
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        var foundImages = document.querySelectorAll("#islrg img");
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          if (curImages != foundImages.length) {
            curImages = foundImages.length;
            count = 0;
          } else {
            count++;
            if (count > 50) {
              clearInterval(timer);
              resolve();
            }
          }
          button.click();
        }
      }, 100);
    });
  });
};

const clickAllImage = async (page) => {
  return page.evaluate(() => {
    let elements = document.querySelectorAll("#islrg img");

    function rightClick(element) {
      return new Promise((resolve) => {
        let event = new MouseEvent("mousedown", {
          bubbles: true,
          cancelable: false,
          view: window,
          button: 2,
          buttons: 2,
          clientX: element.getBoundingClientRect().x,
          clientY: element.getBoundingClientRect().y,
        });
        element.dispatchEvent(event);
        resolve();
      });
    }

    async function rightClickAll(elements) {
      for (const element of elements) {
        await rightClick(element);
      }
    }
    rightClickAll(elements);
  });
};

const getLevel1RefAddress = async (page) => {
  await clickAllImage(page);
  try {
    return page.evaluate(async () => {
      const selector = "a.wXeWr.islib.nfEiy[jsname=sTFXNd]";
      var foundImagesContainer = await document.querySelectorAll(selector);
      let imageDetail = [];
      foundImagesContainer.forEach((image) => {
        try {
          imageDetail.push(image.getAttribute("href"));
        } catch (error) {}
      });
      return imageDetail;
    });
  } catch (error) {}
};

const getLoadmoreButton = async (links) => {
  return new Promise(async (resolve) => {
    let count = 0;
    for (let i = 0; i < links.length; i++) {
      try {
        const textContent = await links[i].evaluate((link) =>
          link.textContent.trim()
        );
        if (textContent === "See more") {
          const href = await links[i].getProperty("href");
          const hrefValue = await href.jsonValue();
          resolve(hrefValue);
        }
      } catch (error) {
        console.log(error);
      }
      count++;
    }
    if (count == links.length) resolve();
  });
};

const goToRefLocation = async (page, address) => {
  let listUrlLv2 = [];
  let finish = 1;
  await new Promise(async (resolve) => {
    for (let index = 0; index < address?.length; index++) {
      try {
        await console.log(
          "\x1b[36m%s\x1b[0m",
          `Getting loadmore url...${index}/${address.length}`
        );
        if (address[index]) {
          try {
            page.setDefaultNavigationTimeout(60000);
            await page.goto(`https://www.google.com${address[index]}`, {
              waitUntil: "networkidle2",
              timeout: 0,
            });
            // await waitTillHTMLRendered(page);
            console.log('getting tag..');
            const links = await page.$$("a");
            console.log("getting view more button");
            const viewMoreUrl = await getLoadmoreButton(links);
            if (viewMoreUrl) {
              listUrlLv2.push(viewMoreUrl);
              console.log("\x1b[32m%s\x1b[0m", `Added 1 ref url`);
            }
          } catch (error) {
            console.log(error);
          }
        }
      } catch (error) {
        finish++;
        console.log(error);
        continue;
      }
      if (finish < address?.length - 1) {
        finish++;
      } else resolve();
    }
  });
  return listUrlLv2;
};
const waitTillHTMLRendered = async (page, timeout = 30000) => {
  const checkDurationMsecs = 800;
  const maxChecks = timeout / checkDurationMsecs;
  let lastHTMLSize = 0;
  let checkCounts = 1;
  let countStableSizeIterations = 0;
  const minStableSizeIterations = 2;
  while (checkCounts++ <= maxChecks) {
    let html = await page.content();
    let currentHTMLSize = html.length;
    let bodyHTMLSize = await page.evaluate(
      () => document.body.innerHTML.length
    );
    // console.log(
    //   "last: ",
    //   lastHTMLSize,
    //   " <> curr: ",
    //   currentHTMLSize,
    //   " body html size: ",
    //   bodyHTMLSize
    // );
    if (lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize)
      countStableSizeIterations++;
    else countStableSizeIterations = 0; //reset the counter

    if (countStableSizeIterations >= minStableSizeIterations) {
      console.log("Page rendered..");
      break;
    }
    lastHTMLSize = currentHTMLSize;
    await page.waitForTimeout(checkDurationMsecs);
  }
};
const getUrl = async () => {
  return await new Promise(async (resolve, reject) => {
    const url = await page.evaluate(async () => {
      const rlImg = await document.querySelector(
        "#imp > div > div.A8mJGd > div.dFMRD > div.pxAole > div.tvh9oe.BIB1wf > c-wiz.Y6heUd > div.nIWXKc div.OUZ5W > div.zjoqD > div.qdnLaf.isv-id > div > a > img"
      );
      if (rlImg) {
        return await rlImg.getAttribute("src");
      }
    });
    await console.log("\x1b[33m%s\x1b[0m", url);
    await resolve(url);
  });
};
const getLevel2RefAddressDetail = async (page, refUrls, key, dataDB) => {
  let realUrls = [];
  const getUrl = async () => {
    return await new Promise(async (resolve, reject) => {
      try {
        const imgElement = await page.$("div.n4hgof img.r48jcc");
        const src = await imgElement?.getProperty("src");
        const imageUrl = await src.jsonValue();
        console.log(imageUrl);
        resolve(imageUrl);
      } catch (error) {
        resolve();
      }
    });
  };

  for (let i = 0; i < refUrls.length; i++) {
    try {
      await page.goto(`https://www.google.com.vn${refUrls[i]}`, {
        waitUntil: "domcontentloaded",
        timeout: 10000,
      });
      await waitTillHTMLRendered(page);
      const imageUrl = await getUrl();
      if (imageUrl) {
        realUrls.push(imageUrl);
        Database.insert(dataDB, key, imageUrl);
      }
    } catch (error) {
      console.log(error);
    }
  }
  return realUrls;
};
const getLevel2RefAddress = async (page, urlList, key, dataDB) => {
  let Level2RefAddress = [];
  let finish = 1;
  return await new Promise(async (resolve) => {
    for (let index = 0; index < urlList.length; index++) {
      const url = urlList[index];
      try {
        await page.goto(url, { waitUntil: "networkidle2", timeout: 0 });
        await scrollToBottom(page);
        await page.waitForTimeout(100);
        const refUrls = await getLevel1RefAddress(page);
        const urls = await getLevel2RefAddressDetail(
          page,
          refUrls,
          key,
          dataDB
        );
        Level2RefAddress = [...Level2RefAddress, ...urls];
        await console.log(
          "\x1b[36m%s\x1b[0m",
          `Found ${Level2RefAddress.length} result at level 2`
        );
        if (finish < urlList?.length - 1) {
          finish++;
        } else resolve(Level2RefAddress);
      } catch (error) {
        console.log(error);
        continue;
      }
    }
  });
};

export default {
  scrollToBottom,
  clickAllImage,
  getLevel1RefAddress,
  goToRefLocation,
  getLevel2RefAddress,
  getUrl,
};
