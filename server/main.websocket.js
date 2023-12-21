const {wsOption,domain_bus,domain_db,ax,sleep,bookmarker,denyGenre} = require('../config')
const cheerio = require('cheerio')
const { WebSocketServer } = require('ws');
// const server = new ws.Server({ server: httpServer})
let ws_main = new WebSocketServer(wsOption)
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
                let { keyWord, range, stars, genre, director, studio, label, onunc, deny } = message
                console.log(message);
                let domain = domain_bus;
                (async function (关键词, 区间, 演员, 类别, 导演, 制作商, 发行商, onunc, deny) {
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
                            关键词 && `${domain}${onunc ? '/uncensored' : ''}/search/${关键词}/${页面计数}`;
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
                                    // if (!(牛马的日期.slice(0, 4) >= 时间)) return { n: 牛马, s: 0x04, t: 'expire', extra: { d: 牛马的日期, p: 牛马的略缩图 } }
                                    try {
                                        // throw  new Error('cust')
                                        let _$_ = cheerio.load((await ax.get(单个搜索)).data)
                                        let 类别标签 = _$_('.genre label a').map((idx, el) => {
                                            return _$_(el).attr('href')
                                        }).get()
                                        if (deny && 类别标签.find(g => denyGenre.some(d => g.includes(d)))) { return { n: 牛马, s: 0x05, t: 'deny', extra: { d: 牛马的日期, p: 牛马的略缩图, g: 类别标签 } } }
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
                                        let 磁力 = (await ax.get(`${domain}/ajax/uncledatoolsbyajax.php?gid=${磁力参数}&lang=zh&uc=${onunc ? 1 : 0}`, {
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
                                                    n: 牛马,//string
                                                    d: 牛马的日期,//string
                                                    p: 牛马的略缩图,//string
                                                    s: 演员列表,//array
                                                    i: 预览图集,//array
                                                    g: 类别标签,//array
                                                    m: 磁力列表,//array
                                                    b: 归属信息,//array
                                                    r: /uncen/ig.test(磁力)//boolean

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
                })(keyWord, range, stars, genre, director, studio, label, onunc, deny)
                break;
            case 'ABORT':
                abort = true
                break;
            case 'INSERT':
                bookmarker.insert(message.data)
                break;
            case 'REMOVE':
                bookmarker.remove(message.data)
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
module.exports = {
    ws_main
}

