const path = require('path')
const fs = require('fs')
const Koa = require('koa')
const Router = require('koa-router')
const { Axios } = require('axios')
const viewCacheTimeout = 1000 * 60 * 60
const fileCacheTimeout = 24 * 60 * 60
const domain_bus = 'https://www.javbus.com'
const domain_db = 'https://javdb.com'
const viewDomain = 'https://www4.javhdporn.net'
const CLASHYAMLPATH = '/etc/clash/config.yaml'
const PROXIESPATH = '/etc/clash/proxies'
const ef_sub = 'https://efshop.cc/api/v1/client/subscribe?token=df03297a313071d85bc15eda2da19af4'
const auth_ = 'cm9vdDozMjI2MDQ0MjE3'
const BUSBOOKMARKPATH = path.resolve(__dirname, './static/bus-bookmark.json')
const DBBOOKMARKPATH = path.resolve(__dirname, './static/db-bookmark.json')
const RECYLEPATH = path.resolve(__dirname, './static/.recyle')
const ROUTERDIR = path.resolve(__dirname, './router/')
const STATICDIR = path.resolve(__dirname, './static/')
const regx = {
    emtpy: /[\s\n]+/g,
    query: /\?.*$/g,
    number: /\d+/g,
    magnet: /gid\s*=\s*(\d+)/i,
    unc: /uncen|\u65E0\u7801\u7834\u89E3/ig,
    rev: /\u65E0\u7801\u6D41\u51FA/ig,
}
const recvtemp = { df:'', d: '', f: '', p: '', g: [], s: [], i: [], b: [], m: [], c: [], v: [-1] }
const ws = fs.createWriteStream('./index_full.html');
const sslOption = {
     key: fs.readFileSync(path.resolve(__dirname, './SSL/knockdoor.top.key'), { encoding: 'utf-8' }),
     cert: fs.readFileSync(path.resolve(__dirname, './SSL/knockdoor.top.pem'), { encoding: 'utf-8' })
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
        "Connection": "keep-alive",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "sec-ch-ua": "\"Chromium\";v=\"112\", \"Google Chrome\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Andriod\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "Referrer-Policy": "strict-origin-when-cross-origin",
    }
});
class BookMarker {
    #path = ''
    #timer = 0
    #timeout = 0
    #bookmark = []
    constructor(name, path, timeout) {
        this.name = name
        this.#path = path
        this.#timeout = timeout || 500
    }
    async init() {
        this.#bookmark = JSON.parse(await fs.promises.readFile(this.#path))
    }
    dump() {
        clearTimeout(this.#timer)
        this.#timer = setTimeout(() => {
            fs.createWriteStream(this.#path).write(JSON.stringify(this.#bookmark))
        }, this.#timeout);
    }
    remove(v) {
        let idx = this.#bookmark.findIndex(i => i.n == v.n)
        if (idx != -1) {
            fs.promises.writeFile(RECYLEPATH, `${this.#bookmark[idx]['n']}\n`, { flag: 'a+' })
            this.#bookmark.splice(idx, 1)
            this.dump()
        }
    }
    insert(v) {
        if (!this.#bookmark.some(i => i.n == v.n)) {
            this.#bookmark.push(v)
            this.dump()
        }
    }

}
function temp() {
    console.log(aa);
}
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
    BUSBOOKMARKPATH,
    DBBOOKMARKPATH,
    RECYLEPATH,
    STATICDIR,
    STATE,
    ax,
    app,
    router,
    denyGenre,
    viewCacheTimeout,
    fileCacheTimeout,
    noCahce,
    proxy,
    sslOption,
    sleep,
    BookMarker,
    ws,
    regx,
    recvtemp
}
