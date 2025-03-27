const ws = require('ws')
const wss = new ws.Server({ port: '3000'})

server.on('connection', socket => {
    socket.on('message', message => {
        console.log(message)
        socket.send('${message}')
    })
})