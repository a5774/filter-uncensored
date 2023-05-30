const path = require('path')
const fs = require('fs')
const https = require('https')
const http = require('http')
const Koa = require('koa')
const Router = require('koa-router')
const static = require('koa-static')
const bodyparser = require('koa-bodyparser')
const cheerio = require('cheerio')
const cp = require('child_process')
const { Axios } = require('axios')
let app = new Koa()
let router = new Router()
const ws = require('ws')
let sort = (origin) => {
    Array.prototype.sort.call(origin, (x, y) => y.view - x.view)
}
let ax = new Axios({
    proxy: {
        host: '127.0.0.1',
        port: '7890',
        protocol: 'http'
    },
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
    }
});

async function pronSignRaw(URL_) {
    let response = await ax.get(URL_, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36'
        }
    });
    return response.data
}
function parseDOM(html) {
    let ranks = []
    let $ = cheerio.load(html, {
        decodeEntities: true
    })
    $('article .archive-entry').each((index, ele) => {
        let view = $('.views', ele).text()
        let pron_url = $(ele).attr('href')
        let pron_name = pron_url.split('\/').slice(-2, -1)[0]
        ranks.push({ view: Number(view), pron_url: pron_url, pron_name: pron_name })
    })
    return { ranks, $ }
}

router.get('/Designation/:flag', async (ctx, next) => {
    let list_ranks = []
    let flag = ctx.params.flag.trim()
    let raw = await pronSignRaw(`https://www4.javhdporn.net/search/${flag}`)
    let mix = parseDOM(raw)
    let href = mix.$('.pagination ul').children().last().children().attr('href')
    list_ranks.push(...mix.ranks)
    if (href) {
        let last = Number(href.match(/\d+/g)[1])
        while (true) {
            if (last == 1) break;
            // console.log(last);
            let html = await pronSignRaw(`https://www4.javhdporn.net/search/${flag}/page/${last--}/`)
            list_ranks.push(...parseDOM(html).ranks)
        }
    }
    list_ranks = list_ranks.filter(item => {
        return item.pron_name.toUpperCase().includes(flag.toUpperCase())
    })
    // console.log(list_ranks);
    sort(list_ranks)
    ctx.body = list_ranks
})
router.get('/ParticularDesignation/:flag', async (ctx, next) => {
    let flag = ctx.params.flag.trim()
    let raw = await pronSignRaw(`https://www4.javhdporn.net/search/${flag}`)
    // console.log(raw)
    // console.log(flag)
    let ranks = parseDOM(raw).ranks
    ranks = ranks.filter(item => {
        return item.pron_name.toUpperCase() == flag.toUpperCase()
    })
    if (!ranks.length) {
        ctx.body = [{
            pron_name: "nnpj-318",
            pron_url: "https://www2.javhdporn.net/video/nnpj-318/",
            view: 99999
        }]
        return null
    }
    ctx.body = ranks
})
router.get('/StarsDesignation/:flag', async (ctx, next) => {
    // get pronStars
    let flag = ctx.params.flag.trim()
    let raw = await pronSignRaw(`https://www4.javhdporn.net/video/${flag}/`)
    let $ = parseDOM(raw).$
    let pornStars = $('#video-actors .fa-user').next().attr('href')
    if (!pornStars) {
        ctx.body = ctx.body = [{
            pron_name: "nnpj-318",
            pron_url: "https://www4.javhdporn.net/video/nnpj-318/",
            view: 99999
        }]
        return null
    }
    let starsRaw = await pronSignRaw(pornStars)
    // get pronList
    let list_ranks_stars = []
    let mix = parseDOM(starsRaw)
    let href = mix.$('.pagination ul').children().last().children().attr('href')
    list_ranks_stars.push(...mix.ranks)
    if (href) {
        let last = Number(href.match(/\d+/g)[1])
        while (true) {
            if (last == 1) break;
            // console.log(last);
            let html = await pronSignRaw(`${pornStars}/page/${last--}/`)
            list_ranks_stars.push(...parseDOM(html).ranks)
            // console.log(list_ranks_stars);
        }
    }
    sort(list_ranks_stars)
    ctx.body = list_ranks_stars
})


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

router.get('/pics/thumb/:rhex', async (ctx, next) => {
    let u = `https://www.javbus.com/pics/thumb/${ctx.params.rhex}`
    let pics = (await ax.get(u, { responseEncoding: 'binary' }))
    ctx.response.set(pics.headers)
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
    let {sequence} = ctx.params
    let referPage = `https://www4.javhdporn.net/video/${sequence}`
        let $ = cheerio.load((await ax.get(referPage)).data)
        let vid = $('#video-player-area').attr('data-video-id');
        let views = (await ax.post(`https://www4.javhdporn.net/wp-content/themes/kingtube/ajax-view.php`, `action=post-views&nonce=19f832024a&post_id=${vid}`, {
            headers: {
                "Referer": `https://www4.javhdporn.net/video/${sequence}/`
            }
        })).data;
        ctx.response.set('Cache-Control',`max-age=${60}`);
        (/\bviews\b/ig.test(views))?ctx.body  = JSON.parse(views).views:ctx.body = -1;
})


app.use(static(path.resolve(__dirname, './static'), { extensions: ['js', 'html'] }))
app.use(router.routes())


const ssl_option = {
    key: fs.readFileSync(`./SSL/knockdoor.top.key`, { encoding: 'utf-8' }),
    cert: fs.readFileSync(`./SSL/knockdoor.top.pem`, { encoding: 'utf-8' })
}
let httpServer = http.createServer(app.callback(), ssl_option)

let server = new ws.Server({ server: httpServer })

async function 休眠主进程(t) {
    return new Promise(r => {
        setTimeout(() => {
            r(t)
        }, t);
    })
}


server.addListener('connection', (socket, req) => {
    let abort = false
    // html5 api 
    console.log(server.clients.size);
    socket.addListener('close', () => {
        socket.close()
        console.log('Client closed...');
    })
    console.log('Client connection...');
    socket.addEventListener('message', evt => {
        let message = JSON.parse(evt.data)
        switch (message.type) {
            case 'scrach':
                let { keyWord, stars, genre, mode } = message
                socket.send(JSON.stringify(
                    {
                        type: 'start',
                        data: {
                            m: `正在搜索:${keyWord}!`
                        }
                    }
                ))
                if (keyWord == '') return null;
                console.log(keyWord);
                (async function (关键词, 演员, 类别, 模式) {
                    abort = false
                    let 搜索 = '';
                    let 区间 = [];
                    let 任务队列 = [];
                    let 指定页面;
                    let 页面计数 = 1
                    let 是否循环 = true
                    if (关键词.indexOf('$') != -1) {
                        let 额外参数 = 关键词.split('$')
                        关键词 = 额外参数[0]
                        if (额外参数[1].indexOf('-') != -1) {
                            区间.push(...额外参数[1].split('-'))
                            区间.every(isNaN) ? 页面计数 = parseInt(区间[0]) : null
                        } else {
                            指定页面 = 额外参数[1]

                        }
                    }
                    for (页面计数; 是否循环; 页面计数++) {
                        if (指定页面) {
                            页面计数 = 指定页面
                            是否循环 = false
                        }
                        if (区间.length && (页面计数 == (parseInt(区间[1]) || 1))) {
                            是否循环 = false
                        }
                        搜索 = `https://www.javbus.com/search/${关键词}/${页面计数}`
                        if(!关键词){
                            搜索 = `https://www.javbus.com/page/${页面计数}`
                        }
                        if (演员) {
                            搜索 = `https://www.javbus.com/star/${关键词}/${页面计数}`
                        }
                        if (类别) {
                            搜索 = `https://www.javbus.com/genre/${关键词}/${页面计数}`
                        }
                        let $ = cheerio.load((await ax.get(搜索)).data)

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
                            任务队列.push(
                                (async (牛马, 计数) => {
                                    let c = (页面计数 - 1) * 牛马们.length + 计数
                                    // 控制push堆栈间隔
                                    await 休眠主进程(计数 * 100)
                                    socket.send(JSON.stringify(
                                        {
                                            type: 'log',
                                            data: {
                                                n: 牛马,
                                                c: c
                                            }
                                        }
                                    ))
                                    let 牛马的日期 = 牛马们的日期[计数]
                                    let 牛马的略缩图 = 略缩图集[计数]
                                    let 单个搜索 = `https://www.javbus.com/${牛马}`
                                    try {
                                        if (模式 === 'censored') {
                                            socket.send(JSON.stringify(
                                                {
                                                    type: 'censored',
                                                    data: {
                                                        n: 牛马,
                                                        d: 牛马的日期,
                                                        p: 牛马的略缩图
                                                    }
                                                }
                                            ))
                                            return 0x01
                                        }
                                        let _$_ = cheerio.load((await ax.get(单个搜索)).data)
                                        let 磁力参数 = _$_('script:not([src]):nth-of-type(3)').text().match(/gid\s*=\s*(\d+)/)?.[1]
                                        if (磁力参数 == null) return;
                                        // console.log(磁力参数);
                                        // if (磁力参数 == null) continue;
                                        let 磁力 = (await ax.get(`https://www.javbus.com/ajax/uncledatoolsbyajax.php?gid=${磁力参数}&lang=zh&img=/pics/cover/9mzx_b.jpg&uc=0`, {
                                            headers: {
                                                'Referer': `https://www.javbus.com/${牛马}`
                                            }
                                        })).data
                                        if (/\buncensored\b/ig.test(磁力) && (模式 === 'uncensored')) {
                                            socket.send(JSON.stringify(
                                                {
                                                    type: 'uncensored',
                                                    data: {
                                                        n: 牛马,
                                                        d: 牛马的日期,
                                                        p: 牛马的略缩图
                                                    }
                                                }
                                            ))
                                            return 0x02
                                        }
                                    } catch (err) {
                                        console.log(err);
                                        console.log(牛马);
                                        socket.send(JSON.stringify(
                                            {
                                                type: 'err',
                                                data: {
                                                    err: err.message,
                                                    n: 牛马
                                                }
                                            }
                                        ))
                                        return 0x03
                                    }
                                })(牛马们[计数], 计数)
                            )
                        }
                    }
                    Promise.allSettled(任务队列).then((ps) => {
                        console.log(ps);
                        socket.send(JSON.stringify(
                            {
                                type: 'done',
                                data: {
                                    m: '搜索完成!'
                                }
                            }
                        ))
                    })
                })(keyWord, stars, genre, mode)
                break;
            case 'abort':
                abort = true
                break;
        }

    })

})


httpServer.listen(80, '0.0.0.0', () => { console.log(httpServer.address().port); })
process.addListener('uncaughtException', (err) => {
    console.log(err);
})
process.addListener('unhandledRejection', (rej) => {
    console.log(rej);
});