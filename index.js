const fs = require('fs')
const path = require('path')
const static = require('koa-static')
const { STATE, auth_, ROUTERDIR, router, app, STATICDIR, noCahce, bookmarker, fileCacheTimeout } = require('./config')
const secure = {
    tracker: {},
    lockTime: 1000 * 60,
    legitimateTime: 1000 * 1,
    legitimateCount: 8,
    lock(user, t) { return (user['lock'] = true) && (user['lockTimestamp'] = t) },
    isLock(user) { return user['lock'] },
    unlock(user, t) { return ((user['count'] = 0) || (user['lock'] = false) || (user['lockTimestamp'] = null) || (user['lastTimestamp'] = t)) },
    initLock(ip, t) { return Reflect.set(this.tracker, ip, { count: 0, lastTimestamp: t, lock: false, lockTimestamp: null }) && this.tracker[ip] },
    canUnlock(user, t) { return ((t - user['lockTimestamp']) >= this.lockTime) },
    isFrequently(user, t) { return ((t - user['lastTimestamp']) >= this.legitimateTime) ? !((user['count'] = 0) || (user['lastTimestamp'] = t)) : (user['count'] >= this.legitimateCount) },
    resetLock(user, t) { return user['lockTimestamp'] = t }
}
async function detectFrequently(ctx, next) {
    let t = Date.now()
    let ip = ctx.req.socket.remoteAddress
    let user = secure.tracker[ip];
    user = !user ? secure.initLock(ip, t) : user;
    let lock = (secure.isLock(user) && secure.canUnlock(user, t)) && secure.unlock(user, t) && `${STATE.UNLOCKED}`
        || (!secure.isLock(user) && secure.isFrequently(user, t)) && secure.lock(user, t) && `${STATE.DUEBLOCK},解封时间:${secure.lockTime - (t - user['lockTimestamp'])}`
        || secure.isLock(user) && /* secure.resetLock(user, t) && */ `${STATE.BLOCKED},解封时间:${secure.lockTime - (t - user['lockTimestamp'])}`
    console.log(secure.tracker);
    lock ? ctx.body = h5template(lock) : ++user['count'] && await next()
}

async function authVerify(ctx, next) {
    let auth = ctx.request.headers.authorization?.replace('Basic ', '');
    if (auth != auth_) {
        ctx.set('WWW-Authenticate', 'Basic')
        // ctx.assert(ctx,401,'no-auth')   
        ctx.status = 401
        ctx.body = 'Unauthention'
        return null
    }
    await next()
}
async function crossOrigin(ctx, next) {
    ctx.set({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "*"
    })
    await next()
}

function localRouter(router_p) {
    let routers = fs.readdirSync(router_p)
    routers.forEach(r => require(path.resolve(__dirname, `${router_p}/${r}`)))
}
bookmarker.init()
localRouter(ROUTERDIR)
// app.use(detectFrequently)
// app.use(authVerify)
app.use(crossOrigin)
app.use(static(STATICDIR, { setHeaders: (res, path, stats) => !noCahce.some(n => path.includes(n)) ? res.setHeader('Cache-Control', `max-age=${fileCacheTimeout}`) : null, extensions: ['js', 'json', 'html'] }))
app.use(router.routes())
app.use(router.allowedMethods())
module.exports = {
    app
}