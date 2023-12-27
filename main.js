// const http2 = require('http2')
const { app } = require('./index')
const { sslOption,temp } = require('./config')
const { ws_main } = require('./server/main.websocket')
const { ws_chat } = require('./server/chat.websocket')
const http = require((process.argv[2] && 'http') || 'https')
const serverPort = (process.argv[2] && 80) || 443
const serverOption = (process.argv[2] && {}) || sslOption
// let https2Server = http2.createSecureServer(ssl_option, app.callback())
let httpServer = http.createServer(serverOption, app.callback())

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

httpServer.listen(serverPort, '0.0.0.0', () => { console.log(httpServer.address().port) })

process.addListener('uncaughtException', (err) => {
    console.log(err);
});
process.addListener('unhandledRejection', (rej) => {
    console.log(rej);
});

