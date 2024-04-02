const { wsOption, domain_bus, domain_db, ax, sleep, BookMarker, DBBOOKMARKPATH, BUSBOOKMARKPATH, /* ws ,*/ regx, recvtemp } = require('../config')
const fs = require('fs')
const cheerio = require('cheerio')
const { WebSocketServer } = require('ws');
// const server = new ws.Server({ server: httpServer})
const ws_main = new WebSocketServer(wsOption)
const bookmarkers = {
    javdb: new BookMarker('db', DBBOOKMARKPATH),
    javbus: new BookMarker('bus', BUSBOOKMARKPATH)
}
let jdb = '_jdb_session=JIi%2BG5lhEOIQJ%2FduafDrAjgNZc09nSPLfU33CrKfjZ%2FQzBRgcF7TfSox3cAM9oVtJOU1IrYmbqkliGODNvvm%2BaMvR1Lc4Kcw19Pp92swThHOOwhy757RGqoO2%2FBq6qJIHMsVhl381h%2FovuWtIKKxiTkxqKYiTGMuN9FhYHul5zj%2BJDMTbJw0bTzVT4p5AsAQg%2FFM2DaCYm%2Bx4oojuAKYu2AA16E5B7IUTp7e4CPDkE6weW6im4%2BGt9nRSh8Umyv8lWKQ8DdDPVGxV5F1svRSifkprY%2BEPU5MsMC%2Fryx7IWFZ4Ek42NWvpH81o2fi99wsCgF%2BlhdW%2FeO1B8UMOMgA%2B%2BFNpfc4SnQIW74s1mzKNm1Mr0D4HPD8wcSGcYJrjDMpZH0%3D--CL4r818sxRFwvpjO--T19PGzpD8%2FqQzBR2RH4ZBg%3D%3D'
bookmarkers.javbus.init()
bookmarkers.javdb.init()

function _ping() {
    this.send(
        JSON.stringify(
            {
                type: 'PING',
                data: Date.now()
            }
        )
    )
}
function _send(type, data) {
    this.send(
        JSON.stringify(
            {
                type,
                data
            }
        )
    )
}
function _progress(data) {
    this.send(
        JSON.stringify(
            {
                type: "PROGRESS",
                data
            }
        )
    )
}


function genTargeTrack(){
    
}
// 函数作用域在定义时被确定在不改变this指向下,全局函数无法访问局部变量
async function javbus_(domain, 关键词, 区间, 演员, 类别, 导演, 制作商, 发行商, socket, tasks, df) {
    let 搜索 = '';
    let 页面计数 = 1;
    let 是否循环 = true;
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
            if (socket.abort) break;
            // 控制push堆栈间隔
            await sleep(150)
            tasks.push(
                (async (牛马, 计数) => {
                    let l = (页面计数 - 1) * 牛马们.length + 计数
                    _progress.call(socket, {
                        m: `${牛马}<==>${l}`
                    })
                    let 牛马的日期 = 牛马们的日期[计数]
                    let 单个搜索 = `${domain}/${牛马}`
                    let 牛马的略缩图 = 略缩图集[计数]
                    let pret = { ...recvtemp, df, d: 牛马的日期, f: 单个搜索, p: 牛马的略缩图 }
                    try {
                        // throw  new Error('cust')
                        let _$_ = cheerio.load((await ax.get(单个搜索)).data)
                        let 类别标签 = _$_('.genre label a').map((idx, el) => {
                            return _$_(el).attr('href')
                        }).get()
                        let 磁力参数 = _$_('script:not([src]):nth-of-type(3)').text().match(regx.magnet)?.[1]
                        let 预览图集 = _$_('#sample-waterfall .sample-box').map((idx, el) => {
                            return _$_(el).attr('href')
                        }).get()
                        let 演员列表 = _$_('.movie .info p:last-of-type a').map((idx, el) => {
                            return { text: _$_(el).text().trim(), href: _$_(el).attr('href') }
                        }).get()
                        let 归属信息 = _$_('.movie .info p:nth-of-type(n+3):nth-of-type(-n+6) a').map((idx, el) => {
                            return { text: _$_(el).text(), href: _$_(el).attr('href') }
                        }).get()
                        // return { n: 牛马, s: 0x02, t: 'empty', extra: pret }
                        if (磁力参数 == null) return { n: 牛马, s: 0x02, t: 'empty', extra: { ...pret, g: 类别标签, s: 演员列表, i: 预览图集, b: 归属信息 } };
                        let 磁力 = (await ax.get(`${domain}/ajax/uncledatoolsbyajax.php?gid=${磁力参数}&lang=zh&uc=0`, {
                            headers: {
                                'Referer': `${domain}/${牛马}`
                            }
                        })).data;
                        let $$ = cheerio.load(`<table>${磁力}</table>`)
                        let 磁力列表 = $$('tr').map((idx, el) => {
                            return { text: $$('a[rel]', el).map((idx, e) => $$(e).text().trim()).get(), href: $$('a[rel]:nth-child(1)', el).attr('href') }
                        }).get();
                        磁力 = $$.text().replace(regx.emtpy, '')
                        _send.call(socket, 'CENSORED', {
                            df,
                            n: 牛马,
                            d: 牛马的日期,
                            f: 单个搜索,
                            p: 牛马的略缩图,
                            g: 类别标签,
                            s: 演员列表,
                            i: 预览图集,
                            b: 归属信息,
                            m: 磁力列表,
                            u: regx.unc.test(磁力),
                            r: regx.rev.test(磁力),
                            l: -1,
                            c: [],
                            v: [-1]
                        });
                        return { n: 牛马, s: 0x01, t: 'regular' };
                    } catch (err) {
                        _send.call(socket, 'ERROR', {
                            err: err.message,
                            n: 牛马
                        })
                        return { n: 牛马, s: 0x03, t: 'error', extra: pret }
                    }
                })(牛马们[计数], 计数)
            )
        }
    }
    return null
}



async function javdb_(domain, 关键词, 区间, 演员, 类别, 导演, 制作商, 发行商, 系列, 番号集, dbsorts, socket, tasks, df) {
    let 搜索 = '';
    let 页面计数 = 1;
    let 是否循环 = true;
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
                cookie: jdb
            }
        })
        jdb = full.headers['set-cookie']?.map(jdb => jdb.split(';')[0]).join(';') || jdb
        // ws.write(full.data)
        let $ = cheerio.load(full.data);
        let 牛马们 = $('.movie-list .item .video-title strong').map((idx, el) => {
            return $(el).text().trim()
        }).get()
        // console.log(牛马们);
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
            if (socket.abort) break;
            // if (计数 == 1) break
            // 控制push堆栈间隔
            await sleep(300)
            tasks.push(
                (async (牛马, 计数) => {
                    let l = (页面计数 - 1) * 牛马们.length + 计数
                    _progress.call(socket, {
                        m: `${牛马}<==>${l}`
                    })
                    let 牛马的日期 = 牛马们的日期[计数]
                    let 单个搜索 = 牛马们详细[计数]
                    let 牛马的略缩图 = 略缩图集[计数]
                    let pret = { ...recvtemp, df, d: 牛马的日期, f: 单个搜索, p: 牛马的略缩图 }
                    try {
                        let _$_ = cheerio.load((await ax.get(单个搜索)).data)
                        let _$_$_ = cheerio.load((await ax.get(`${单个搜索}/reviews/lastest`)).data, {
                            headers: {
                                cookie: jdb
                            }
                        })
                        // console.log(评论预览);
                        let 归属信息 = _$_('.video-detail .video-meta-panel .movie-panel-info > .panel-block .value').map((idx, el) => {
                            let belong = [_$_('a[href^="/directors/"]', el), _$_('a[href^="/makers/"]', el), _$_('a[href^="/publishers/"]', el), _$_('a[href^="/series/"]', el)]
                            let target = belong.find(b => (b.length == 1) && b)
                            if (target) {
                                return { text: target.text().trim(), href: `${domain}${target.attr('href')}`.replace(regx.query, '') }
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
                        let 磁力 = _$_('.video-panel .message-body .magnet-links').text().replace(regx.emtpy, '')
                        // console.log(磁力);
                        let 磁力列表 = _$_('.video-panel .message-body .magnet-links .item').map((idx, el) => {
                            return { text: [_$_('.magnet-name a .name', el).text().trim(), _$_('.magnet-name a .meta', el).text().trim(), _$_('.date .time', el).text().trim()], href: _$_('.magnet-name a', el).attr('href') }
                        }).get()
                        let 评论总数 = _$_('.video-detail .review-tab span').text().match(regx.number)?.[0] ?? -1
                        // console.log(评论总数);
                        let 老司机的看法 = _$_('.video-detail .video-meta-panel .movie-panel-info > .panel-block .has-text-grey').text().match(regx.number) || [-1]
                        // console.log(老司机的看法);
                        let 评论预览 = _$_$_('.review-item').map((idx, el) => {
                            return { text: _$_$_('.content p', el).text().replace(regx.emtpy, ' '), date: _$_$_('.review-item .time', el).text() }
                        }).get().slice(0, -1)
                        _send.call(socket, 'CENSORED', {
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
                            u: regx.unc.test(磁力),
                            r: regx.rev.test(磁力),
                            l: 评论总数,
                            c: 评论预览,
                            v: 老司机的看法
                        })
                        return { n: 牛马, s: 0x01, t: 'regular' };
                    } catch (err) {
                        // 优化reflow检测
                        _send.call(socket, 'ERROR', {
                            err: err.message,
                            n: 牛马
                        })
                        return { n: 牛马, s: 0x03, t: 'error', extra: pret }
                    }
                })(牛马们[计数], 计数)
            )
        }
    }
    return null
}


ws_main.addListener('connection', (socket, req) => {
    socket.isAlive = false
    console.log(`connections:${ws_main.clients.size}`);
    socket.addListener('close', () => {
        socket.close()
        console.log(`connections:${ws_main.clients.size}`);
    })
    // html5 api 
    _ping.call(socket)
    socket.addEventListener('message', async ({ data }) => {
        let message = JSON.parse(data)
        switch (message.type) {
            case 'PONG':
                socket.isAlive = !(message.data ^ 4010)
                break;
            case 'SEARCH':
                socket.abort = false;
                let tasks = [];
                let { keyWord, range, star, genre, director, studio, label, mode, actors, tags, directors, makers, publishers, series, codes, dbsorts = { dbsort: 1, dbsortsb: 0, dbsortvst: 1 } } = message
                if (range.some(p => Number.isNaN(parseInt(p)))) {
                    _progress.call(socket, {
                        m: `e:[k:KEYWORD_OR_RANGE_ERR]`,
                    })
                    break;
                }
                _progress.call(socket, {
                    m: `s:[t:${range[0]}${range[1] ? `,${range[1]}` : ''}]!`
                })
                switch (mode) {
                    case 'javbus':
                        await javbus_(domain_bus, keyWord, range, star, genre, director, studio, label, socket, tasks, mode)
                        break;
                    case 'javdb':
                        await javdb_(domain_db, keyWord, range, actors, tags, directors, makers, publishers, series, codes, dbsorts, socket, tasks, mode)
                        break;
                }
                Promise.allSettled(tasks).then((ps) => {
                    // let errs = ps.reduce((acc, curr) => acc + ( curr.value.v != 1) ? 1 : 0, 0);
                    let errs = ps.filter(({ value }) => value.s != 1 ? value.n : null)
                    _send.call(socket, 'DONE', {
                        m: `r:[t:${ps.length}][e:${errs.length}]`,
                        len: ps.length,
                        reflow: errs
                    })
                })
                break;
            case 'ABORT':
                socket.abort = true
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
        _ping.call(ws)
    })
}, 1000 * 15);


ws_main.addListener('close', () => {
    clearInterval(ws_main.interval)
    console.log("server is close");
})
module.exports = {
    ws_main
}

