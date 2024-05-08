import fs from "fs";
import csv from "csv-parser";

import { Index } from "@upstash/vector";

const index = new Index({
  url: "https://assured-burro-15694-us1-vector.upstash.io",
  token: "ABcFMGFzc3VyZWQtYnVycm8tMTU2OTQtdXMxYWRtaW5ZVE01TVRNNFl6QXRNVEEwTkMwMFpETmhMV0V4WkdFdFpUTTBNRGt6WmpjNFlXRmk=",
})

interface Row {
  text: string
}

async function parseCSV(filePath: string): Promise<Row[]>{
  return new Promise((resolve, reject) => {
    const rows : Row[] = []
    
    fs.createReadStream(filePath)
      .pipe(csv({
        separator: ","
      }))
      .on("data", (row) => {
        rows.push(row);
      })
      .on("error", (err) => {
        reject(err)
      })
      .on("end", () => {
        resolve(rows)
      });
  });
};

const STEP = 30;
const seed = async () => {
  const data = await parseCSV("training_dataset.csv");
  for (let i = 0; i < data.length; i += STEP) {
    const chunk = data.slice(i, i + STEP);

    const formatted = chunk.map((row, batchIndex) => ({
      data: row.text,
      id: i + batchIndex,
      metadata: {text: row.text}
    }));

    await index.upsert(formatted);
  }
}

seed();