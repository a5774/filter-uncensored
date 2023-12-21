const path = require('path')
const fs = require('fs')
const Koa = require('koa')
const Router = require('koa-router')
const { Axios } = require('axios')
const viewCacheTimeout = 1000 * 60 * 60
const fileCacheTimeout = 24 * 60 * 60
const domain_bus = 'https://www.javbus.com'
const domain_db = 'https://www.javdb.com'
const viewDomain = 'https://www4.javhdporn.net'
const CLASHYAMLPATH = '/etc/clash/config.yaml'
const PROXIESPATH = '/etc/clash/proxies'
const ef_sub = 'https://v1.eflink.xyz/api/v1/client/subscribe?token=df03297a313071d85bc15eda2da19af4'
const auth_ = 'cm9vdDozMjI2MDQ0MjE3'
const BOOKMARKPATH = path.resolve(__dirname, './static/bookmark.json')
const RECYLEPATH = path.resolve(__dirname, './static/.recyle')
const ROUTERDIR = path.resolve(__dirname, './router/')
const STATICDIR = path.resolve(__dirname, './static/')
const sslOption = {
    // key: fs.readFileSync(path.resolve(__dirname,'./SSL/knockdoor.top.key'), { encoding: 'utf-8' }),
    // cert: fs.readFileSync(path.resolve(__dirname,'./SSL/knockdoor.top.pem'), { encoding: 'utf-8' })
}
const STATE = {
    BLOCKED: '你个傻逼被屏蔽了,重复请求将刷新屏蔽时间',
    DUEBLOCK: '请求太快了,(至少我这么觉得^_^)',
    UNLOCKED: '好小子，你还真等啊',
}
const proxy = {
    host: '127.0.0.1',
    port: '7890',
    protocol: 'http'
}
const wsOption = { noServer: true, perMessageDeflate: true, clientTracking: true }
const denyGenre = ['3x', '59', 'hk', '40', '2r', '61', '4l', '2f', '55', '56', '4p', '4k', 'k', '15', '4t', '47', '1r', '36', '1a', '5z', '2c', 'es', '81', '7x']
const noCahce = ['index', 'bookmark', 'debugger', 'constant', 'instruction']
const app = new Koa()
const router = new Router()
const ax = new Axios({
    proxy,
    headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "zh-CN,zh;q=0.9,sq;q=0.8,zh-TW;q=0.7",
        "Connection":"keep-alive",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "sec-ch-ua": "\"Chromium\";v=\"112\", \"Google Chrome\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Andriod\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "Referrer-Policy": "strict-origin-when-cross-origin"
    }
});
const bookmarker = {
    timer: 0,
    __timeout: 500,
    __bookmark: [],
    __dump() {
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
            fs.createWriteStream(BOOKMARKPATH).write(JSON.stringify(this.__bookmark))
        }, this.__timeout);
    },
    insert(v) {
        if (!this.__bookmark.some(i => i.n == v.n)) {
            this.__bookmark.push(v)
            this.__dump()
        }
    },
    remove(v) {
        let idx = this.__bookmark.findIndex(i => i.n == v.n)
        if (idx != -1) {
            fs.promises.writeFile(RECYLEPATH, `${this.__bookmark[idx]['n']}\n`, { flag: 'a+' })
            this.__bookmark.splice(idx, 1)
            this.__dump()
        }
    },
    async init() {
        this.__bookmark = JSON.parse((await fs.promises.readFile(BOOKMARKPATH)))
    }
};
const sleep = async (t) => new Promise(r => setTimeout(() => r(t), t))

module.exports = {
    domain_bus,
    domain_db,
    viewDomain,
    ef_sub,
    auth_,
    wsOption,
    PROXIESPATH,
    CLASHYAMLPATH,
    ROUTERDIR,
    BOOKMARKPATH,
    RECYLEPATH,
    STATICDIR,
    STATE,
    ax,
    bookmarker,
    app,
    router,
    denyGenre,
    viewCacheTimeout,
    fileCacheTimeout,
    noCahce,
    proxy,
    sslOption,
    sleep
}