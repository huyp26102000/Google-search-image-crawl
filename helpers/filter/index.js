import imageToBase64 from "image-to-base64";
import md5 from "md5";
import ora from "ora";
import database from "../database/index.js";

const encImageMd5 = async (url) => {
  const img = await imageToBase64(url);
  return md5(img);
};

const compareImageContent = async () => {
  const data = await database.getTableContent();
  console.log(data[0]);
};

const removeDuplicateURL = async () => {
  console.log("Loading process...");
  const spinner = await ora("Loading process");
  await spinner.start();
  await database.execute(`delete from CRAWL
  where id not in (
      with t as (
          select ROW_NUMBER() OVER (order by "url") as "check1",
                 RANK() OVER (order by "url")       as "check2",
                 id,
                 label,
                 url,
                 Timestamp
          from CRAWL
          where url is not null
      )
      select t.id
      from t
      where t.check1 = t.check2
  )
  or url is null`);
  await spinner.stop();
  await console.log(
    `\n  *************************** \n        Processing done \n  ***************************`
  );
};

export default { compareImageContent, removeDuplicateURL };
