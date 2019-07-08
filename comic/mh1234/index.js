const puppeteer = require('puppeteer')
const axios = require('axios')
const fs = require('fs')
const path = require('path')

class manhua {
  constructor(url, output) {
    this.url = url
    this.count = 0
    this.output = output
  }
  async init() {
    console.log()
    fs.exists(path.join(path.resolve('.'), '/comic/mh1234/', this.output), (exist) => {
      if (!exist) {
        fs.mkdir(path.join(path.resolve('.'), '/comic/mh1234/', this.output), (err) => {
          console.log(`错误：${err}`)
        })
      }
    })
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.goto(this.url)
    
    const list = await page.waitForSelector('#list')
    page.waitFor(2000)
    const arr = await list.$$eval('a', items => items.map(i => i.href))
    arr.reverse()
    for (let i = 0, len = arr.length; i < len; i++) {
      const childPage = await browser.newPage()
      console.log(`正在爬第${i + 1}集`)
      await this.getEachChapter(browser, childPage, arr[i])
      await childPage.close()
    }
    await browser.close()
  }
  async getEachChapter (browser, page, link) {
    try {
      await page.goto(link)
      await page.waitFor(500)
      const totalPage = await page.$eval('#k_total', i => Number.parseInt(i.textContent))
      for (let j = 1; j <= totalPage; j++) {
        console.log(`总共${totalPage}页，正在爬取第${j}页的图片`)
        const childUrl = `${link}?p=${j}` 
        await this.getEachImg(browser, childUrl)
      }
    } catch (e) {
      console.log(e)
    }
  }

  async getEachImg (browser, link) {
    const page = await browser.newPage()
    try {
      await page.goto(link)
      const myImg = await page.waitForSelector('#qTcms_Pic_middle')
      const imgUrl = await myImg.$eval('img', i => i.src)
      let res
      try {
        res = await axios({
          method: 'get',
          url: imgUrl,
          responseType: 'stream'
        })
        res = res.data
        res.pipe(fs.createWriteStream( path.join(path.resolve('.'), '/comic/mh1234/', this.output) + path.sep  + this.count + '.jpg'))
        this.count++
      } catch (e) {
        console.log(e)
      }
    } catch(e) {
      console.log(e)
    }
    await page.close()
  }
}

const instance = new manhua('https://www.mh1234.com/wap/comic/15250.html')
// instance.init()

module.exports = manhua