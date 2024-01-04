const { wsOption, domain_bus, domain_db, ax, sleep, denyGenre, BookMarker, DBBOOKMARKPATH, BUSBOOKMARKPATH, ws } = require('../config')
const fs = require('fs')
const cheerio = require('cheerio')
const { WebSocketServer } = require('ws');
// const server = new ws.Server({ server: httpServer})
const ws_main = new WebSocketServer(wsOption)
const bookmarkers = {
    javdb: new BookMarker('db', DBBOOKMARKPATH),
    javbus: new BookMarker('bus', BUSBOOKMARKPATH)
}
bookmarkers.javbus.init()
bookmarkers.javdb.init()
let abort = false
let auth = '_jdb_session=74ZwY3pQzbHVbrI%2Bep24Dvljx6SQp%2F4FLV%2BUkic8IKhF1cJqceCkdnmCLHcku%2BYY0ZiurtVgNAr9qhRQcj6R%2BgmKYcyEZFsYe2EQkpZj5SrWLJNXfmEaR1Uv7U%2FFSxzDhww2avNHf4rvxeQzqewBStjVK2zohIwZGbrU7%2BIras6%2BretyqJFL7SRf%2F6tfSYbFnuX8l3ERizvGT%2FmOxzhZ%2BJUQmMlIDRvRPCJ1nd9hOAavgcIA65JRCcoooRhSGwke%2BLkWMUvQZB6S%2BU%2BHyy7%2F4t4m1fh2C5vQk%2FL8TfSofnsNaZT6k69tmmdM4ZFFczvmr8499fMiPUH3N0lKbeH55qhK5PGpCRM0636lHQLnpO8dKtQOEp9MsObNX444nTWr%2FTI%3D--Ilist0HwOgXQNRWS--Q8yd637lQmB1Hxye%2ByPk5A%3D%3D'
// 函数作用域在定义时被确定在不改变this指向下,全局函数无法访问局部变量
async function javbus_(domain, 关键词, 区间, 演员, 类别, 导演, 制作商, 发行商, deny, socket, df) {
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
            !关键词 && `${domain}/page/${页面计数}` ||
            演员 && `${domain}/star/${关键词}/${页面计数}` ||
            类别 && `${domain}/genre/${关键词}/${页面计数}` ||
            导演 && `${domain}/director/${关键词}/${页面计数}` ||
            制作商 && `${domain}/studio/${关键词}/${页面计数}` ||
            发行商 && `${domain}/label/${关键词}/${页面计数}` ||
            关键词 && `${domain}/search/${关键词}/${页面计数}`;
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
            if (abort) break;
            // 控制push堆栈间隔
            await sleep(150)
            任务队列.push(
                (async (牛马, 计数) => {
                    let c = (页面计数 - 1) * 牛马们.length + 计数
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
                    let 单个搜索 = `${domain}/${牛马}`
                    let 牛马的略缩图 = 略缩图集[计数]
                    let pre = { df, d: 牛马的日期, f: 单个搜索, p: 牛马的略缩图, g: [], s: [], i: [], b: [], m: [], v: -1 }
                    // if (!(牛马的日期.slice(0, 4) >= 时间)) return { n: 牛马, s: 0x04, t: 'expire', extra: { d: 牛马的日期, p: 牛马的略缩图 } }
                    try {
                        // throw  new Error('cust')
                        let _$_ = cheerio.load((await ax.get(单个搜索)).data)
                        let 类别标签 = _$_('.genre label a').map((idx, el) => {
                            return _$_(el).attr('href')
                        }).get()
                        if (deny && 类别标签.find(g => denyGenre.some(d => g.includes(d)))) { return { n: 牛马, s: 0x05, t: 'deny', extra: { ...pre, g: 类别标签 } } }
                        let 磁力参数 = _$_('script:not([src]):nth-of-type(3)').text().match(/gid\s*=\s*(\d+)/)?.[1]
                        let 预览图集 = _$_('#sample-waterfall .sample-box').map((idx, el) => {
                            return _$_(el).attr('href')
                        }).get()
                        let 演员列表 = _$_('.movie .info p:last-of-type a').map((idx, el) => {
                            return { text: _$_(el).text().trim(), href: _$_(el).attr('href') }
                        }).get()
                        let 归属信息 = _$_('.movie .info p:nth-of-type(n+3):nth-of-type(-n+6) a').map((idx, el) => {
                            return { text: _$_(el).text(), href: _$_(el).attr('href') }
                        }).get()
                        if (磁力参数 == null) return { n: 牛马, s: 0x02, t: 'empty', extra: { ...pre, g: 类别标签, s: 演员列表, i: 预览图集, b: 归属信息 } };
                        let 磁力 = (await ax.get(`${domain}/ajax/uncledatoolsbyajax.php?gid=${磁力参数}&lang=zh&uc=0`, {
                            headers: {
                                'Referer': `${domain}/${牛马}`
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
                                    df,
                                    n: 牛马,//string
                                    d: 牛马的日期,//string
                                    f: 单个搜索,//string
                                    p: 牛马的略缩图,//string
                                    g: 类别标签,//array
                                    s: 演员列表,//array
                                    i: 预览图集,//array
                                    b: 归属信息,//array
                                    m: 磁力列表,//array
                                    u: /uncen|\u65E0\u7801\u7834\u89E3/ig.test(磁力),
                                    r: /\u65E0\u7801\u6D41\u51FA/ig.test(磁力),
                                    v: -1,
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
                        return { n: 牛马, s: 0x03, t: 'error', extra: pre }
                    }
                })(牛马们[计数], 计数)
            )
        }
    }
    Promise.allSettled(任务队列).then((ps) => {
        // console.log(ps.length);
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
}




async function javdb_(domain, 关键词, 区间, 演员, 类别, 导演, 制作商, 发行商, 系列, 番号集, dbsorts, socket, df) {
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
        (!区间[1] || 区间[1] == 页面计数) && (是否循环 = false)
        搜索 =
            !关键词 && `${domain}/censored?lm=v&vft=1&vst=1&page=${页面计数}` ||
            演员 && `${domain}/actors/${关键词}?lm=v&page=${页面计数}&sort_type=${dbsorts.dbsort}` ||
            类别 && `${domain}/tags?${关键词}&lm=v&page=${页面计数}` ||
            导演 && `${domain}/directors/${关键词}?lm=v&page=${页面计数}` ||
            制作商 && `${domain}/makers/${关键词}?lm=v&page=${页面计数}` ||
            发行商 && `${domain}/publishers/${关键词}?lm=v&page=${页面计数}` ||
            系列 && `${domain}/series/${关键词}?lm=v&page=${页面计数}` ||
            番号集 && `${domain}/video_codes/${关键词}?lm=v&page=${页面计数}&sort_type=${dbsorts.dbsort}` ||
            关键词 && `${domain}/search?q=${关键词}&lm=v&page=${页面计数}&sb=${dbsorts.dbsortsb}`;
        let full = await ax.get(搜索, {
            headers: {
                cookie: auth
            }
        })
        // console.log(full.request);
        // ws.write(full.data)
        auth = full.headers['set-cookie']?.map(auth => auth.split(';')[0]).join(';') || auth
        let $ = cheerio.load(full.data);
        let 牛马们 = $('.movie-list .item .video-title strong').map((idx, el) => {
            return $(el).text().trim()
        }).get()
        let 牛马们的日期 = $('.movie-list .item .meta').map((idx, el) => {
            return $(el).text().trim()
        }).get()
        // console.log(牛马们的日期);
        let 略缩图集 = $('.movie-list .item img').map((idx, el) => {
            return $(el).attr('src')
        }).get()
        // console.log(略缩图集);
        let 牛马们详细 = $('.movie-list .item a').map((idx, el) => {
            return `${domain}${$(el).attr('href')}`
        }).get()
        // console.log(牛马们详细);
        if (牛马们.length == 0) break;
        for (let 计数 = 0; 计数 <= 牛马们.length - 1; 计数++) {
            if (abort) break;
            // 控制push堆栈间隔
            await sleep(150)
            任务队列.push(
                (async (牛马, 计数) => {
                    let c = (页面计数 - 1) * 牛马们.length + 计数
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
                    let 单个搜索 = 牛马们详细[计数]
                    let 牛马的略缩图 = 略缩图集[计数]
                    try {
                        // throw  new Error('cust')
                        let _$_ = cheerio.load((await ax.get(单个搜索)).data)
                        let 归属信息 = _$_('.video-detail .video-meta-panel .movie-panel-info > .panel-block .value').map((idx, el) => {
                            let belong = [_$_('a[href^="/directors/"]', el), _$_('a[href^="/makers/"]', el), _$_('a[href^="/publishers/"]', el), _$_('a[href^="/series/"]', el)]
                            let target = belong.find(b => (b.length == 1) && b)
                            if (target) {
                                return { text: target.text().trim(), href: `${domain}${target.attr('href')}`.replace(/\?.*$/g, '') }
                            }
                        }).get()
                        // console.log(归属信息);
                        let 预览图集 = _$_('.video-panel .message-body .preview-images .tile-item').map((idx, el) => {
                            return _$_(el).attr('href')
                        }).get()
                        // console.log(预览图集);
                        let 演员列表 = _$_('.video-detail .video-meta-panel .movie-panel-info > .panel-block .female').map((idx, el) => {
                            return { text: _$_(el).prev().text().trim(), href: `${domain}${$(el).prev().attr('href')}` }
                        }).get()
                        // console.log(演员列表);
                        let 类别标签 = _$_('.video-detail .video-meta-panel .movie-panel-info > .panel-block .value a[href^="/tags?"]').map((idx, el) => {
                            return `${domain}${_$_(el).attr('href')}`
                        }).get()
                        // console.log(类别标签);
                        let 老司机的看法 = _$_('.video-detail .video-meta-panel .movie-panel-info > .panel-block .has-text-grey').text().match(/\d+/g)?.join('/')
                        // console.log(老司机的看法);
                        let 磁力 = _$_('.video-panel .message-body .magnet-links').text().replace(/\s/g, '')
                        // console.log(磁力);
                        let 磁力列表 = _$_('.video-panel .message-body .magnet-links .item').map((idx, el) => {
                            return { text: [_$_('.magnet-name a .name', el).text().trim(), _$_('.magnet-name a .meta', el).text().trim(), _$_('.date .time', el).text().trim()], href: _$_('.magnet-name a', el).attr('href') }
                        }).get()
                        socket.send(JSON.stringify(
                            {
                                type: 'CENSORED',
                                data: {
                                    df,
                                    n: 牛马,
                                    d: 牛马的日期,
                                    f: 单个搜索,
                                    p: 牛马的略缩图,
                                    s: 演员列表,
                                    i: 预览图集,
                                    g: 类别标签,
                                    m: 磁力列表,
                                    b: 归属信息,
                                    u: /uncen|\u65E0\u7801\u7834\u89E3/ig.test(磁力),
                                    r: /\u65E0\u7801\u6D41\u51FA/ig.test(磁力),
                                    v: 老司机的看法 || 'N/A'
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
                        return { n: 牛马, s: 0x03, t: 'error', extra: { d: 牛马的日期, f: 单个搜索, p: 牛马的略缩图 } }
                    }
                })(牛马们[计数], 计数)
            )
        }
    }
    Promise.allSettled(任务队列).then((ps) => {
        // console.log(ps.length);
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
}


ws_main.addListener('connection', (socket, req) => {
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
            type: 'PING',
            data: Date.now()
        }
    ))
    socket.addEventListener('message', ({ data }) => {
        let message = JSON.parse(data)
        switch (message.type) {
            case 'PONG':
                socket.isAlive = true
                break;
            case 'SEARCH':
                let { keyWord, range, star, genre, director, studio, label, deny, javdb, actors, tags, directors, makers, publishers, series, codes, dbsorts = { dbsort: 1, dbsortsb: 0, dbsortvst: 1 } } = message
                console.log(message);
                if (javdb) {
                    javdb_(domain_db, keyWord, range, actors, tags, directors, makers, publishers, series, codes, dbsorts, socket, 'javdb')
                } else {
                    javbus_(domain_bus, keyWord, range, star, genre, director, studio, label, deny, socket, 'javbus')
                }
                break;
            case 'ABORT':
                abort = true
                break;
            case 'INSERT':
                bookmarkers[message.data['df']].insert(message.data)
                break;
            case 'REMOVE':
                bookmarkers[message.data['df']].remove(message.data)
                break;
        }

    })
})
ws_main.interval = setInterval(() => {
    ws_main.clients.forEach(ws => {
        if (!ws.isAlive) ws.close()
        ws.isAlive = false
        ws.send(JSON.stringify(
            {
                type: 'PING',
                data: Date.now()
            }
        ))
    })
}, 1000 * 15);

ws_main.addListener('close', () => {
    clearInterval(ws_main.interval)
    console.log("server is close");
})
module.exports = {
    ws_main
}

