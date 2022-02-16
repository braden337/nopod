#!/usr/bin/env node

const { Podcast } = require("podcast");
const express = require("express");
const qrcode = require("qrcode-terminal");
const path = require("path");
const os = require("os");
const fs = require("fs");
const port = 80;
const ip = os
  .networkInterfaces()
  ["en0"].filter((x) => x.family == "IPv4")[0].address;

const url = `http://${process.argv[2] || ip}`;

const app = express();
app.set("view engine", "pug");
app.set("views", `${__dirname}/views`);
app.use(express.static("."));
app.use(express.static(`${__dirname}/assets`));

let files = fs.readdirSync(".");

files.sort((a, b) => {
  a = a.match(/\s(\d+)\s/);
  b = b.match(/\s(\d+)\s/);
  if (a == null || b == null) return 0;
  else return Math.sign(a[1] - b[1]);
});

// const url = `http://${ip}:${port}`;
// const url = `http://${ip}`;
// const url = "http://pod.railingcorners.com";

const feed = new Podcast({
  title: path.basename(process.cwd()),
  description: "",
  feed_url: `${url}/feed`,
  site_url: `${url}`,
  image_url: `${url}/cover.jpg`,
  author: "Alan Turing",
  managingEditor: "Alan Turing",
  webMaster: "Alan Turing",
  copyright: "&copy; 1937",
  language: "en",
  categories: [""],
  pubDate: new Date("November 12, 1937"),
  ttl: "60",
  itunesAuthor: "Alan Turing",
  itunesSubtitle: "",
  itunesSummary: "",
  itunesOwner: { name: "Alan Turing" },
  itunesExplicit: false,
  itunesCategory: [
    {
      text: "Technology",
    },
  ],
  itunesImage: `${url}/cover.jpg`,
});

let aug = new Date("November 12, 1937");

for ([i, file] of files.filter((x) => /mp3/.test(x)).entries()) {
  feed.addItem({
    title: file,
    description: file,
    url: `${url}/${file}`, // link to the item
    date: new Date(aug.valueOf() + 864e5 * i), // any format that js Date can parse.
    enclosure: { url: `${url}/${file}` }, // optional enclosure
    itunesAuthor: "Alan Turing",
    itunesExplicit: false,
    itunesSubtitle: "",
    itunesSummary: "",
  });
}

feedXml = feed.buildXml();

// const feedXml = console.log(files.includes("feed.yml"));

app.get("/", (req, res) => {
  res.render("index", { title: "nopod", message: "Hello there!", files });
});

app.get("/feed", (req, res) => {
  res.type("application/xml");
  res.send(feedXml);
});

app.listen(port, () => {
  qrcode.generate(`${url}`, { small: true });
  console.log(`Podcast being served at => ${url}`);
});
