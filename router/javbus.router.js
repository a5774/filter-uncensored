const cheerio = require('cheerio')
const {router,domain_bus,viewDomain,viewCacheTimeout,ax} = require('../config')
router.get('/:pics/:kind/:rhex', async (ctx, next) => {
    let u = `${domain_bus}/${ctx.params.pics}/${ctx.params.kind}/${ctx.params.rhex}`
    // let pics = (await ax.get(u, { responseEncoding: 'binary' }))
    let pics = (await ax.get(u, { responseType: 'stream' }))
    ctx.response.set(pics.headers)
    ctx.response.set('connection', 'keep-alive')
    ctx.type = 'image/jpeg';
    ctx.status = 200
    ctx.body = pics.data
})

router.get('/views/:sequence', async (ctx, next) => {
    let { sequence } = ctx.params
    let referPage = `https://www4.javhdporn.net/video/${sequence}`
    let $ = cheerio.load((await ax.get(referPage)).data)
    // fs.writeFileSync('./temp.html',(await ax.get(referPage)).data)
    let vid = $('#video-player-area').attr('data-video-id');
    let data = (await ax.post(`${viewDomain}/wp-content/themes/kingtube/ajax-view.php`, `action=post-views&post_id=${vid}`, {
        headers: {
            "Referer": `${viewDomain}/video/${sequence}/`
        }
    })).data;
    if (/\bviews\b/ig.test(data)) {
        ctx.response.set('Cache-Control', `max-age=${viewCacheTimeout}`);
        ctx.body = JSON.parse(data).views
        return null
    }
    ctx.body = -1
})

