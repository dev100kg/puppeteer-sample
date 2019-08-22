'use strict';

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path')

const connect_url = 'https://code.visualstudio.com/Download';

const setup = async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
  });
  return { browser, page };
}

(async () => {
  const { browser, page } = await setup();
  const downloadPath = await path.resolve(__dirname, 'download');
  await page._client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: downloadPath
  });
  await page.goto(connect_url);
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0" }),
    page.click('#alt-downloads > div > div:nth-child(1) > button'),
  ]);
  let filename = await ((async () => {
    let filename;
    while (!filename || filename.endsWith('.crdownload')) {
      filename = fs.readdirSync(downloadPath)[0];
      await sleep(1000);
    }
    return filename
  })());
  browser.close();

})();

function sleep(milliSeconds) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, milliSeconds);
  });
}

