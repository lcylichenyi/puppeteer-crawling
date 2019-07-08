const mh1234 = require('./comic/mh1234/index')
const moshiweiwang = new mh1234('https://www.mh1234.com/wap/comic/15250.html', 'moshiweiwang')
const yaoshenji = new mh1234('https://www.mh1234.com/wap/comic/9329.html', 'yaoshenji')

;(async () => {
  // 末世为王
  await moshiweiwang.init()

  // 妖神记
  // await yaoshenji.init()
})()
