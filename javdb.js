const { ax, domain_db } = require('./config');
const fs = require('fs');
`
?vft=0
0 all
1 magnet
2 subs
3 comment
4 ch_playable
5 playable
?lm=v
v samll
h large
?vst=1
1 release date  sort
2 update magnet sort 
?tag=.
c10 base
c11 year
c1 theme
c2 role
c3 clothing
c4 body 
c5 behavior
c6 play
c7 genern
c9 time
?sort_type=0 
anti-
0 date-sort 
1 pf-sort
2 hot-sort
3 watch-sort
4 want-w-sort 
`
let d_full = 'https://javdb.com/video_codes/MIFD'
let d_signle = 'https://javdb.com/v/QVG7n8'
const cheerio = require('cheerio')
// let ws = fs.createWriteStream('./single.html')
async function full() {
    let data = fs.readFileSync('./index.html')
    // let data = (await ax.get(d_full)).data
    let $ = cheerio.load(data)
    let n = '.movie-list .item .video-title strong'
    let sginle_u = '.movie-list .item a'
    let thumb = '.movie-list .item img'
    let date = '.movie-list .item .meta'
    let n_ = $(n).map((idx, el) => {
        return $(el).text()
    }).get()
    console.log(n_);
    let su = $(sginle_u).map((idx, el) => {
        return $(el).attr('href')
    }).get()
    console.log(su);
    let tb = $(thumb).map((idx, el) => {
        return $(el).attr('src')
    }).get()
    console.log(tb);
    let date_ = $(date).map((idx, el) => {
        return $(el).text().trim()
    }).get()
    console.log(date_);

}
// full()



async function single() {
    // let data = fs.readFileSync('./index_full.html')
    let data = (await ax.get('https://javdb.com/v/M6AEQ')).data
    // ws.write(data)
    let $ = cheerio.load(data)
    let all_panel = '.video-detail .video-meta-panel .movie-panel-info > .panel-block'
    let want_w = '.video-detail .video-meta-panel .movie-panel-info > .panel-block .has-text-grey'
    let pics_s = '.video-panel .message-body .preview-images .tile-item'
    let magnet = '.video-panel .message-body .magnet-links .item'
    let actor = '.video-detail .video-meta-panel .movie-panel-info > .panel-block .female'
    let all_p = {}
    $(all_panel).map((idx, el) => {
        let v = $('.value', el)
        let k = $('strong:nth-child(1)', el).text().slice(0, -1)
        let childs = v.children()
        if (childs.length) {
            v = childs.map((idx, el_) => $(el_).attr('href')).get()
        } else {
            v = v.text().trim()
        }
        return { k, v }
    }).get().forEach(pb => {
        Object.assign(all_p, { [pb.k]: pb.v })
    })

    console.log(all_p);
    let ww_ = $(want_w).text().match(/\d+/g)
    console.log(ww_);


    let pics_ = $(pics_s).map((idx, el) => {
        return $(el).attr('href')
    }).get()
    console.log(pics_);


    let magnet_ = $(magnet).map((idx, el) => {
        return { text: [$('.magnet-name a .name', el).text().trim(), $('.magnet-name a .meta', el).text().trim(), $('.date .time', el).text().trim()], href: $('.magnet-name a', el).attr('href') }
    }).get()
    console.log(magnet_);



    let actor_ = $(actor).map((idx, el) => {
        return $(el).prev().attr('href')
    }).get()
    console.log(actor_);
    let 类别标签 = $('.video-detail .video-meta-panel .movie-panel-info > .panel-block .value a[href^="/tags?"]').map((idx, el) => {
        return `${domain_db}${$(el).attr('href')}`
    }).get()
    console.log(类别标签);

}
single()


async function tag() {
    let tagt = {}
    let data = await (await (ax.get('https://javdb.com/tags/uncensored'))).data
    let $ = cheerio.load(data)
    let tags = $('.tag_labels .tag').map((idx, el) => {
        Object.assign(tagt, { [$(el).attr('href').split('?')[1]]: $(el).text().trim() })
    })
    // console.log(tags);

    fs.writeFileSync('./static/dbTagUncensoredTable.json',JSON.stringify(tagt))

}
// tag()

"https://www.javdb.com/tags?c7=312"
"https://www.javdb.com/actors/MxZP"




"https://www.javdb.com/directors/Rx4"
"https://www.javdb.com/makers/zKW?f=download"
"https://www.javdb.com/publishers/p0B"
"https://www.javdb.com/series/pSAG"