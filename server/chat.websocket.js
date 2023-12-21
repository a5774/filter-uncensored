const { v4 } = require('uuid')
const {wsOption} = require('../config')
const { WebSocket, WebSocketServer } = require('ws');
const ws_chat = new WebSocketServer(wsOption)
let clientMap = new Map()
ws_chat.addListener('connection', (socket, req) => {
    let UUID = v4();
    clientMap.set(socket, UUID)
    console.log(clientMap.size);
    socket.send(JSON.stringify({
        type: 'AUTH',
        UUID
    }));

    Array.from(clientMap.keys()).forEach(client => {
        if (client.readyState == WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'ONLINE',
                group: Array.from(clientMap.values())
            }))
        }

    })
    socket.addListener('close', (code, reason) => {
        console.log(`code:${code}, reason${reason}`);
        console.log(`${clientMap.get(socket)} to close`);
        Array.from(clientMap.keys()).forEach(client => {
            if (client.readyState == WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: 'ONLINE',
                    group: Array.from(clientMap.values())
                }))
            }
        })
        clientMap.delete(socket)
    })
    socket.addListener('error', err => {
        console.log('error');
        if (err) console.log(err);
        socket.close()
    })

    socket.addEventListener('message', ({ data }) => {
        if (Buffer.isBuffer(data)) {
            // fs.writeFileSync('./temp.txt',data,{encoding:'utf-8'})
            Array.from(clientMap.keys()).forEach(client => {
                if (client != socket && client.readyState == WebSocket.OPEN) {
                    client.send(data, { binary: true })
                }
            })
            return null
        }
        let message = JSON.parse(data)
        switch (message.type) {
            case 'CODES':
                fs.writeFileSync(`./static/${Date.now()}.json`, data, { flag: 'w+' })
                break;
            case 'TEXT':
                break;
        }
    })
})
module.exports = {
    ws_chat
}