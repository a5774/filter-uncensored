const { router } = require('../config')
async function addressTest(ctx, next) {
    console.log(ctx.req.socket.address())
    // console.log(ctx.res.socket.address())
    // console.log(ctx.req.socket.localAddress);
    // console.log(ctx.req.socket.remoteAddress);
    ctx.body = `<h1 style=font-size:100px >牛马你好!${ctx.req.socket.remoteAddress}</h1>`
}
router.get('/test', addressTest)