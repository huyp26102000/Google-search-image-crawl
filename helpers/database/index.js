import sqlite3 from "sqlite3";
import uuid4 from "uuid4";

const location = "./helpers/database";

const setup = async () => {
  let dataDB = new sqlite3.Database(
    `${location}/database.db`,
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE
  );
  await dataDB.run(
    "CREATE TABLE IF NOT EXISTS CRAWL(id TEXT PRIMARY KEY, label INTEGER, url TEXT, Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)"
  );
  return dataDB;
};

const updateDownloadStatus = async (dataDB, id, success) => {
  dataDB.run(
    "UPDATE CRAWL SET downloaded=?, downloadFail=? WHERE id=?",
    [success, !success, id],
    (err) => {
      if (err) {
        return console.log(err.message);
      }
      console.log("\x1b[36m%s\x1b[0m", `Updated download status`);
    }
  );
};
const getTableContent = async (dataDB) => {
  return await new Promise(async (resolve, reject) => {
    await dataDB.all(`SELECT * FROM 'CRAWL';`, [], (err, row) => {
      resolve(row);
    });
  });
};

const insert = async (dataDB, label, url) => {
  dataDB.run(
    "INSERT INTO CRAWL(id, label, url) VALUES(?, ?, ?)",
    [uuid4(), label, url],
    (err) => {
      if (err) {
        return console.log(err.message);
      }
      console.log("\x1b[36m%s\x1b[0m", `Row was added to the table with url`);
    }
  );
};

const execute = async (statement) => {
  let dataDB = new sqlite3.Database(`${location}/database.db`);
  await dataDB.run(statement);
  dataDB.close();
};

const clear = async () => {
  let dataDB = new sqlite3.Database(`${location}/database.db`);
  await dataDB.run("DROP TABLE CRAWL");
  dataDB.close();
};

const countLabel = async (statement) => {
  return await new Promise(async (resolve, reject) => {
    let dataDB = await setup();
    await dataDB.get(statement, [], (err, row) => {
      resolve(row["COUNT(*)"]);
    });
    await close(dataDB);
  });
};

const getLabelList = async () => {
  return await new Promise(async (resolve, reject) => {
    let dataDB = await setup();
    await dataDB.all(`SELECT distinct label FROM 'CRAWL';`, [], (err, row) => {
      resolve(row);
    });
    await close(dataDB);
  });
};
const count = async () => {
  // 'label', 'chicken breast raw'  WHERE url not like 'data:%'
  let labelList = [];
  console.log("Total: ", await countLabel(`SELECT COUNT(*) FROM 'CRAWL';`));
  console.log(
    "Valid: ",
    await countLabel(
      `SELECT COUNT(*) FROM 'CRAWL' WHERE url not like 'data:%';`
    )
  );
  console.log("\x1b[34m%s\x1b[0m", "\nLabel count:");
  labelList = await getLabelList();
  for (let i = 0; i < labelList.length; i++) {
    console.log(
      `${labelList[i].label}`,
      await countLabel(
        `SELECT COUNT(*) FROM 'CRAWL' WHERE url not like 'data:%' and label="${labelList[i].label}";`
      )
    );
  }
};
const close = async (dataDB) => {
  dataDB.close();
};
export default {
  setup,
  execute,
  insert,
  clear,
  close,
  count,
  getTableContent,
  updateDownloadStatus,
};
