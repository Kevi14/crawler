const crypto = require("crypto");
const fetch = require("node-fetch");

class Crawler {
  constructor(baseUrl, action) {
    this.baseUrl = new URL(baseUrl);
    this.action = action || this.defaultAction;
    this.visited = new Set();
  }

  defaultAction(url, html) {
    console.log(`Visited: ${url}`);
  }

  async crawl(url = this.baseUrl) {
    if (this.visited.has(url.toString())) return;

    this.visited.add(url.toString());

    const response = await fetch(url);
    const data = await response.text();

    this.action(url, data);

    const linkRegex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/g;
    let match;
    while ((match = linkRegex.exec(data))) {
      const newUrl = new URL(match[2], url);
      if (newUrl.hostname === this.baseUrl.hostname) {
        this.crawl(newUrl);
      }
    }
  }
}

const savePageToFile = (url, html) => {
  const fileName =
    crypto.createHash("md5").update(url.toString()).digest("hex") + ".html";

  require("fs").writeFile(fileName, html, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log(`Saved page: ${url} to file: ${fileName}`);
    }
  });
};

const url = process.argv[2] || "http://example.com";
const crawler = new Crawler(url, savePageToFile);

crawler.crawl();

// To run the program first run npm install to collect the needed packages
// Then call it like node crawler.js http://example.com
