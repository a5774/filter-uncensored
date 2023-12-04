const http = require('http')
const koa = require('koa')
const app = Reflect.construct(koa, [])
// const router  =  Reflect.construct(require('koa-router'))


let serure = {
    tracker: {},
    lockTime: 1000 * 60 * 60 ,
    legitimateTime: 1000 * 5,
    legitimateCount: 10,
    lock(user, t) { return (user['lock'] = true) && (user['lockTimestamp'] = t) },
    isLock(user) { return user['lock'] },
    unlock(user, t) { return !((user['count'] = 0) || (user['lock'] = false) || (user['lockTimestamp'] = null) || (user['lastTimestamp'] = t)) },
    initLock(ip, t) { return Reflect.set(this.tracker, ip, { count: 0, lastTimestamp: t, lock: false, lockTimestamp: null }) && this.tracker[ip] },
    canUnlock(user, t) { return ((t - user['lockTimestamp']) >= this.lockTime) },
    isFrequently(user, t) { return ((t - user['lastTimestamp']) >= this.legitimateTime) ? (user['count'] = 0) || (user['lastTimestamp'] = t) : (user['count'] >= this.legitimateCount) },
    resetLock(user,t) {return user['lockTimestamp'] = t }
}



// 
// 
const STATE = {
    BLOCKED: `你个傻逼被屏蔽了,${serure.lockTime}ms后解封,重复请求将刷新屏蔽时间`,
    DUEBLOCK: `请求这么快赶死啊${serure.lockTime}ms后解封`,
    UNLOCKED: `刑满释放给爷爬`
}

app.use((ctx, next) => {
    let t = Date.now()
    let ip = ctx.req.socket.remoteAddress
    let user = serure.tracker[ip];
    user = !user ? serure.initLock(ip, t) : user;
    user['count']++
    ctx.body = (serure.isLock(user) && serure.canUnlock(user, t)) && serure.unlock(user, t) && STATE.UNLOCKED
        || (!serure.isLock(user) && serure.isFrequently(user, t)) && serure.lock(user, t) && STATE.DUEBLOCK
        || serure.isLock(user) && serure.resetLock(user,t) && STATE.BLOCKED
        || 'hellow'
    console.log(user);
})
app.listen(80)
/* 
    let ip = req.socket.remoteAddress;
    let user = serure.tracker[ip];
    user = !user ? serure.initLock(ip) : user
   
        
    
        
    }

    if (serure.isLock(user)) {
        res.write('You has been blocked')
        res.end();
        return null
    }
    console.log(serure.isFrequently(user));
    if (!serure.isLock(user) && serure.isFrequently(user)) {
        serure.lock(user);
        console.log(user['count']);
        res.write('Locked due to frequent requests');
        res.end();
        return null
    }
    user['count']++
   */
function detectFrequently(ctx, next) {

}

