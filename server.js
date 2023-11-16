const path = require('path')
const fs = require('fs')
const https = require('https')
const { URL } = require('url');
const { Buffer } = require('buffer');
const cp = require('child_process');
const http = require('http')
const Koa = require('koa')
const Router = require('koa-router')
const static = require('koa-static')
const bodyparser = require('koa-bodyparser')
const serializeYML = require('js-yaml');
const cheerio = require('cheerio')
const { Axios, default: axios } = require('axios')
const { v4 } = require('uuid')
const bookMark = path.resolve(__dirname, './static/bookmark.json')
const Domain = 'https://www.javbus.com'
const viewDomain = 'https://www4.javhdporn.net'
const CLASHYAMLPATH = '/etc/clash/config.yaml'
const PROXIES = '/etc/clash/proxies'
const ef_sub = 'https://v1.eflink.xyz/api/v1/client/subscribe?token=df03297a313071d85bc15eda2da19af4'
let app = new Koa()
let router = new Router()
let { Server, WebSocket, WebSocketServer } = require('ws')
let proxy = {
    host: '127.0.0.1',
    port: '7890',
    protocol: 'http'
}
let ax = new Axios({
    proxy,
    headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "zh-CN,zh;q=0.9,sq;q=0.8,zh-TW;q=0.7",
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
    },
    // cancelToken:axios.CancelToken.source().token
});


function r() {
    return JSON.parse(fs.readFileSync(bookMark, { encoding: 'utf-8', flag: 'r+' }) || '[]')
}
function w(data) {
    fs.writeFileSync(bookMark, JSON.stringify(data), { encoding: 'utf-8', flag: 'w+' })
}
function insert(_data) {
    let data = r();
    if (!data.some(i => i.n == _data.n)) {
        data.push(_data)
        w(data)
    }
}
function remove(_data) {
    let data = r();
    let idx = data.findIndex((i, idx) => (i.n == _data) && idx)
    if (idx) {
        data.splice(idx, 1)
        w(data)
    }
}
async function 休眠主进程(t) {
    return new Promise(r => {
        setTimeout(() => {
            r(t)
        }, t);
    })
}

async function get_trojan_axios() {
    try {
        cp.execSync(`nc -zv  ${proxy.host} ${proxy.port}`,{encoding:'utf8'})
        let resp = await ax.get(ef_sub)
        return resp.data
    } catch (e) { 
        return e || null
    }
}
async function get_trojan() {
    return new Promise((reslove, rej) => {
        let base64_str_full = ''
        let base64_str = ''
        https.get(ef_sub, resp => {
            resp.setEncoding('utf-8')
            resp.addListener('readable', () => {
                if ((base64_str = resp.read()) != null) base64_str_full += base64_str
            })
            resp.addListener('end', () => {
                reslove(base64_str_full)
            })
            resp.addListener('error', err => {
                rej('订阅更新失败')
            })
        })
    })
}
function toggle_proxy_node(index, json, proxies_desc) {
    json = json || serializeYML.load(fs.readFileSync(CLASHYAMLPATH, { encoding: 'utf-8' }))
    proxies_desc = proxies_desc || JSON.parse(fs.readFileSync(PROXIES, { encoding: 'utf-8' }));
    let selected_proxy = proxies_desc.find(proxy => proxy.selected && proxy)
    let select = proxies_desc[index];
    [select.selected, selected_proxy.selected] = [selected_proxy.selected, select.selected];
    json['proxy-groups'].forEach(group => {
        group.proxies = [select['name']]
    })
    let update_yaml = serializeYML.dump(json)
    fs.writeFileSync(PROXIES, JSON.stringify(proxies_desc), { encoding: 'utf-8' })
    fs.writeFileSync(CLASHYAMLPATH, update_yaml, { encoding: 'utf-8' })
    return select.name
}
async function set_proxies_js_yml() {
    let proxies_desc = []
    let b64_full = await get_trojan_axios() || await get_trojan()
    if (!b64_full) return
    let utf8_str = Buffer.from(b64_full, 'base64').toString('utf-8')
    let proxies = utf8_str.split('\r\n').slice(0, -1).map((proxyURL, idx) => {
        // WHATWG standard
        const parsedUrl = new URL(proxyURL)
        const query = parsedUrl.searchParams
        let name = decodeURIComponent(parsedUrl.hash.slice(1))
        proxies_desc.push({ name, type: parsedUrl.protocol, selected: idx === 0 })
        return {
            name,
            type: parsedUrl.protocol.slice(0,-1),
            server: parsedUrl.hostname,
            port: parseInt(parsedUrl.port),
            password: parsedUrl.username,
            udp: true,
            sni: query.get('sni'),
            'skip-cert-verify': query.get('allowInsecure') === '1',
        }
    })
    fs.writeFileSync(PROXIES, JSON.stringify(proxies_desc), { encoding: 'utf-8' })
    let json = serializeYML.load(fs.readFileSync(CLASHYAMLPATH, { encoding: 'utf-8' }))
    json.proxies = proxies
    return toggle_proxy_node(18, json, proxies_desc)
}
function rollback() {
    return cp.execSync(`cp -f ${CLASHYAMLPATH}.bak ${CLASHYAMLPATH}`)
}
function backup() {
    return cp.execSync(`cp -f ${CLASHYAMLPATH} ${CLASHYAMLPATH}.bak`)
}
async function sysctl(action, service) {
        cp.execSync(`systemctl ${action} ${service}`)
        await 休眠主进程(1000);
        return cp.execSync(`nc -zv  ${proxy.host} ${proxy.port}`,{encoding:'utf8',stdio:'ignore'}) 
} 
// yt-dlp
router.get('/start/:likeCountLess', async (ctx, next) => {
    let like = ctx.params.likeCountLess
    if (/^[0-9]*$/.test(like)) {
        // cp.execSync(`pm2 start /node/ytdlp/Ytdlp.js --name yt -- -m ${like}`)
        try {
            let stdo = cp.execSync(`pm2 restart /node/kwai_merger/Yt-dlp.js --name yt -- -m ${like}`)
            ctx.body = stdo
        } catch (e) {
            ctx.body = 'FORMAT_NOT_STAND'
        }
        return null
    }
    ctx.body = 'IS_NOT_NUM'
})
router.get('/stop', async (ctx, next) => {
    let stdo = cp.execSync('pm2 stop yt')
    ctx.body = stdo
})
router.post('/specifies', bodyparser(), async (ctx, next) => {
    let { data } = ctx.request.body
    if (data) {
        try {
            cp.execSync(`node /node/kwai_merger/Yt-dlp.js -s ${data}`, {
                windowsHide: true,
                stdio: 'inherit'
            })
            ctx.body = "STEP_IS_DONE"
            return null
        } catch (e) {
            ctx.body = 'FORMAT_NOT_STAND'
            return null
        }
    }
    ctx.body = "PARAMS_IS_NULL"
    return null
});



// unti 
router.get('/:pics/:kind/:rhex', async (ctx, next) => {
    let u = `${Domain}/${ctx.params.pics}/${ctx.params.kind}/${ctx.params.rhex}`
    let pics = (await ax.get(u, { responseEncoding: 'binary' }))
    ctx.response.set(pics.headers)
    ctx.response.set('connection', 'keep-alive')
    ctx.type = 'image/jpeg';
    ctx.status = 200
    ctx.res.write(pics.data, 'binary')
    ctx.res.end()
})
router.get('/test', async (ctx, next) => {
    console.log(ctx.req.socket.address())
    // console.log(ctx.res.socket.address())
    // console.log(ctx.req.socket.localAddress);
    // console.log(ctx.req.socket.remoteAddress);
    ctx.body = `<h1 style=font-size:100px >牛马你好!${ctx.req.socket.remoteAddress}</h1>`
})
router.get('/views/:sequence', async (ctx, next) => {
    let { sequence } = ctx.params
    let referPage = `https://www4.javhdporn.net/video/${sequence}`
    let $ = cheerio.load((await ax.get(referPage)).data)
    // fs.writeFileSync('./temp.html',(await ax.get(referPage)).data)
    let vid = $('#video-player-area').attr('data-video-id');
    let data = (await ax.post(`${viewDomain}/wp-content/themes/kingtube/ajax-view.php`, `action=post-views&nonce=19f832024a&post_id=${vid}`, {
        headers: {
            "Referer": `${viewDomain}/video/${sequence}/`
        }
    })).data;
    if (/\bviews\b/ig.test(data)) {
        ctx.response.set('Cache-Control', `max-age=${1000 * 60 * 60 * 24}`);
        ctx.body = JSON.parse(data).views
        return null
    }
    ctx.body = -1
})

router.get('/proxies', async (ctx, next) => {
    ctx.status = 200
    ctx.body = JSON.parse(fs.readFileSync(PROXIES, { encoding: 'utf-8' }))
})

router.get('/updateProxy', async (ctx, next) => {
    try {   
        backup()
        await set_proxies_js_yml();
        await sysctl('restart', 'clash')
        ctx.body = `updated` 
    } catch (e) {
        rollback()
        await sysctl('restart', 'clash')
        ctx.body = 'rollback'
    }
})
router.get('/toggleProxy/:idx', async(ctx, next) => {
    try {
        backup()
        let selected =  toggle_proxy_node(ctx.params.idx)
        await sysctl('restart', 'clash')
        ctx.body = `Toggle ${selected}`
    } catch (e) {
        rollback()
        await sysctl('restart', 'clash')
        ctx.body = 'rollback'
    }
})

let nocahce = ['index', 'bookmark', 'debugger', 'constant', 'instruction']
app.use(static(path.resolve(__dirname, './static'), { setHeaders: (res, path, stats) => !nocahce.some(n => path.includes(n)) ? res.setHeader('Cache-Control', 'max-age=2678400') : null, extensions: ['js', 'json', 'html'] }))
// app.use(static(path.resolve(__dirname, './static'),{ extensions: ['js', 'json', 'html'] }))
app.use(async (ctx, next) => {
    ctx.set({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "*"
    })
    await next()
})
app.use(router.routes())
app.use(router.allowedMethods())
let deny = ['3x', '59', 'hk', '40', '2r', '61', '4l', '2f', '55', '56', '4p', '4k', 'k', '15', '4t', '47', '1r', '36', '1a', '5z', '2c', 'es', '81', '7x']
const ssl_option = {
    key: fs.readFileSync(`./SSL/knockdoor.top.key`, { encoding: 'utf-8' }),
    cert: fs.readFileSync(`./SSL/knockdoor.top.pem`, { encoding: 'utf-8' })
}
let ws_option = { noServer: true, perMessageDeflate: true, clientTracking: true }
let httpServer = https.createServer(ssl_option, app.callback())
// let httpServer = http.createServer(app.callback())
// let server = new ws.Server({ server: httpServer})
let ws_main = new WebSocketServer(ws_option)
let ws_chat = new WebSocketServer(ws_option)

ws_main.addListener('connection', (socket, req) => {
    let abort = false
    socket.isAlive = false
    console.log(`connections:${ws_main.clients.size}`);
    socket.addListener('close', () => {
        socket.close()
        console.log('client closed...');
        console.log(`connections:${ws_main.clients.size}`);
    })
    // html5 api 
    socket.send(JSON.stringify(
        {
            type: 'ping',
            data: Date.now()
        }
    ))
    socket.addEventListener('message', ({ data }) => {
        let message = JSON.parse(data)
        switch (message.type) {
            case 'pong':
                // console.log(message.data)
                socket.isAlive = true
                break;
            case 'search':
                let { keyWord, range, stars, genre, director, studio, label, onsunc } = message
                console.log(message);
                (async function (关键词, 区间, 演员, 类别, 导演, 制作商, 发行商, onsunc) {
                    abort = false
                    let 搜索 = '';
                    let 任务队列 = [];
                    let 页面计数 = 1;
                    let 是否循环 = true;
                    if (区间.some(p => Number.isNaN(parseInt(p)))) {
                        socket.send(JSON.stringify(
                            {
                                type: 'ERROR',
                                data: {
                                    err: `KEYWORD_OR_RANGE_ERR`,
                                }
                            }
                        ))
                        return null
                    }
                    socket.send(JSON.stringify(
                        {
                            type: 'START',
                            data: {
                                m: `STARTING:[${区间[0]}${区间[1] ? `,${区间[1]}` : ''}]!`
                            }
                        }
                    ))
                    页面计数 = 区间[0]
                    for (页面计数; 是否循环; 页面计数++) {
                        (!区间[1] || 区间[1] == 页面计数) ? 是否循环 = false : null;
                        搜索 =
                            !关键词 && `${Domain}/page/${页面计数}` ||
                            演员 && `${Domain}/star/${关键词}/${页面计数}` ||
                            类别 && `${Domain}/genre/${关键词}/${页面计数}` ||
                            导演 && `${Domain}/director/${关键词}/${页面计数}` ||
                            制作商 && `${Domain}/studio/${关键词}/${页面计数}` ||
                            发行商 && `${Domain}/label/${关键词}/${页面计数}` ||
                            关键词 && `${Domain}${onsunc ? '/uncensored' : ''}/search/${关键词}/${页面计数}`;
                        let $ = cheerio.load((await ax.get(搜索)).data);
                        let 牛马们 = $('.photo-info span date:first-of-type').map((idx, el) => {
                            return $(el).text()
                        }).get()
                        // console.log(牛马们);
                        let 牛马们的日期 = $('.photo-info span date:last-of-type').map((idx, el) => {
                            return $(el).text()
                        }).get()
                        // console.log(牛马们的日期);
                        let 略缩图集 = $('.movie-box .photo-frame img').map((idx, el) => {
                            return $(el).attr('src')
                        }).get()
                        // console.log(略缩图集);
                        if (牛马们.length == 0) break;
                        for (let 计数 = 0; 计数 <= 牛马们.length - 1; 计数++) {
                            // 控制push堆栈间隔
                            // await 休眠主进程(计数 * 200)
                            任务队列.push(
                                (async (牛马, 计数) => {
                                    let c = (页面计数 - 1) * 牛马们.length + 计数
                                    await 休眠主进程(计数 * 150)
                                    socket.send(JSON.stringify(
                                        {
                                            type: 'LOG',
                                            data: {
                                                n: 牛马,
                                                c: c
                                            }
                                        }
                                    ))
                                    let 牛马的日期 = 牛马们的日期[计数]
                                    let 单个搜索 = `${Domain}/${牛马}`
                                    let 牛马的略缩图 = 略缩图集[计数]
                                    // if (!(牛马的日期.slice(0, 4) >= 时间)) return { n: 牛马, s: 0x04, t: 'expire', extra: { d: 牛马的日期, p: 牛马的略缩图 } }
                                    try {
                                        // throw  new Error('cust')
                                        let _$_ = cheerio.load((await ax.get(单个搜索)).data)
                                        let 类别标签 = _$_('.genre label a').map((idx, el) => {
                                            return _$_(el).attr('href')
                                        }).get()
                                        if (类别标签.find(g => deny.includes(g))) { return { n: 牛马, s: 0x05, t: 'deny', extra: { d: 牛马的日期, p: 牛马的略缩图, g: 类别标签 } } }
                                        let 磁力参数 = _$_('script:not([src]):nth-of-type(3)').text().match(/gid\s*=\s*(\d+)/)?.[1]
                                        let 预览图集 = _$_('#sample-waterfall .sample-box').map((idx, el) => {
                                            return _$_(el).attr('href')
                                        }).get()
                                        let 演员列表 = _$_('.movie .info p:last-of-type a').map((idx, el) => {
                                            return _$_(el).attr('href')
                                        }).get()
                                        let 归属信息 = _$_('.movie .info p:nth-of-type(n+3):nth-of-type(-n+6) a').map((idx, el) => {
                                            return { text: _$_(el).text(), href: _$_(el).attr('href') }
                                        }).get()
                                        if (磁力参数 == null) return { n: 牛马, s: 0x02, t: 'empty', extra: { d: 牛马的日期, p: 牛马的略缩图, i: 预览图集, s: 演员列表, g: 类别标签 } };
                                        let 磁力 = (await ax.get(`${Domain}/ajax/uncledatoolsbyajax.php?gid=${磁力参数}&lang=zh&uc=${onsunc ? 1 : 0}`, {
                                            headers: {
                                                'Referer': `${Domain}/${牛马}`
                                            }
                                        }))?.data;
                                        let $$ = cheerio.load(`<table>${磁力}</table>`)
                                        let 磁力列表 = $$('tr').map((idx, el) => {
                                            return { text: $$('a[rel]', el).map((ix, e) => $$(e).text().trim()).get(), href: $$('a[rel]:nth-child(1)', el).attr('href') }
                                        }).get()
                                        socket.send(JSON.stringify(
                                            {
                                                type: 'CENSORED',
                                                data: {
                                                    n: 牛马,
                                                    d: 牛马的日期,
                                                    p: 牛马的略缩图,
                                                    s: 演员列表,
                                                    i: 预览图集,
                                                    g: 类别标签,
                                                    m: 磁力列表,
                                                    b: 归属信息,
                                                    r: /uncen/ig.test(磁力)
                                                }
                                            }
                                        ))
                                        return { n: 牛马, s: 0x01, t: 'regular' };
                                    } catch (err) {
                                        console.log(err);
                                        console.log(牛马);
                                        socket.send(JSON.stringify(
                                            {
                                                type: 'ERROR',
                                                data: {
                                                    err: err.message,
                                                    n: 牛马
                                                }
                                            }
                                        ))
                                        return { n: 牛马, s: 0x03, t: 'error', extra: { d: 牛马的日期, p: 牛马的略缩图 } }
                                    }
                                })(牛马们[计数], 计数)
                            )
                        }
                    }
                    Promise.allSettled(任务队列).then((ps) => {
                        // console.log(ps);
                        // let errs = ps.reduce((acc, curr) => acc + ( curr.value.v != 1) ? 1 : 0, 0);
                        let errs = ps.filter(({ value }) => value.s != 1 ? value.n : null)
                        socket.send(JSON.stringify(
                            {
                                type: 'DONE',
                                data: {
                                    m: `r:[t:${ps.length}][e:${errs.length}]`,
                                    reflow: errs
                                }
                            }
                        ))
                    })
                })(keyWord, range, stars, genre, director, studio, label, onsunc)
                break;
            case 'ABORT':
                abort = true
                break;
            case 'INSERT':
                insert(message.data)
                break;
            case 'REMOVE':
                remove(message.data)
                fs.writeFile('./static/.recyle', `${message.data}\n`, { flag: 'a+' }, r => r)
                break;
        }

    })
})
ws_main.interval = setInterval(() => {
    ws_main.clients.forEach(ws => {
        if (!ws.isAlive) return ws.close()
        ws.isAlive = false
        ws.send(JSON.stringify(
            {
                type: 'ping',
                data: Date.now()
            }
        ))
    })
}, 1000 * 15);

ws_main.addListener('close', () => {
    clearInterval(ws_main.interval)
    console.log("server is close");
})



let clientMap = new Map()
ws_chat.addListener('connection', (socket, req) => {
    let UUID = v4();
    clientMap.set(socket, UUID)
    console.log(clientMap.size);
    socket.send(JSON.stringify({
        type: 'AUTH',
        UUID
    }));

    Array.from(clientMap.keys()).forEach(client => {
        if (client.readyState == WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'ONLINE',
                group: Array.from(clientMap.values())
            }))
        }

    })
    socket.addListener('close', (code, reason) => {
        console.log(`code:${code}, reason${reason}`);
        console.log(`${clientMap.get(socket)} to close`);
        Array.from(clientMap.keys()).forEach(client => {
            if (client.readyState == WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: 'ONLINE',
                    group: Array.from(clientMap.values())
                }))
            }
        })
        clientMap.delete(socket)
    })
    socket.addListener('error', err => {
        console.log('error');
        if (err) console.log(err);
        socket.close()
    })

    socket.addEventListener('message', ({ data }) => {
        if (Buffer.isBuffer(data)) {
            // fs.writeFileSync('./temp.txt',data,{encoding:'utf-8'})
            Array.from(clientMap.keys()).forEach(client => {
                if (client != socket && client.readyState == WebSocket.OPEN) {
                    client.send(data, { binary: true })
                }
            })
            return null
        }
        let message = JSON.parse(data)
        switch (message.type) {
            case 'CODES':
                fs.writeFileSync(`./static/${Date.now()}.json`, data, { flag: 'w+' })
                break;
            case 'TEXT':
                break;
        }
    })
})


httpServer.addListener('upgrade', (request, socket, head) => {
    if (request.url == '/main') {
        ws_main.handleUpgrade(request, socket, head, websocket => {
            ws_main.emit('connection', websocket, request)
        })
    }
    if (request.url == '/chat') {
        ws_chat.handleUpgrade(request, socket, head, websocket => {
            ws_chat.emit('connection', websocket, request)
        })
    }
})


httpServer.listen(443, '0.0.0.0', () => { console.log(httpServer.address().port); })

process.addListener('uncaughtException', (err) => {
    console.log(err);
});
process.addListener('unhandledRejection', (rej) => {
    console.log(rej);
});


