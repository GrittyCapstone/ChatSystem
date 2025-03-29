import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { Server } from 'socket.io'

// Assuming the error is due to the missing './types' module, let's create a mock implementation for demonstration purposes
// This should be replaced with the actual implementation or correct import path
type ServerToClientEvents = any;
type ClientToServerEvents = any;
type Message = any;
type User = any;
type UsersState = any;
type EnterRoomData = any;
type MessageData = any;

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
const port = process.env.PORT || 3000

const UsersState: UsersState = {
  users: [],
  setUsers: function(newUsers: User[]) {
    this.users = newUsers
  }
}

function buildMsg(name: string, text: string): Message {
  return {
    name,
    text,
    time: new Intl.DateTimeFormat('default', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    }).format(new Date())
  }
}

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true)
    handle(req, res, parsedUrl)
  })

  const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' ? false : ["http://localhost:3000"],
      methods: ["GET", "POST"],
      credentials: true
    }
  })

  io.on('connection', (socket) => {
    console.log(`User ${socket.id} connected`)

    socket.emit('message', buildMsg('Admin', 'Welcome to the chat!'))

    socket.on('enterRoom', (data: EnterRoomData) => {
      const { name, room } = data;
      // Leave previous room
      const prevRoom = UsersState.users.find((user: User) => user.id === socket.id)?.room
      if (prevRoom) {
        socket.leave(prevRoom)
        io.to(prevRoom).emit('message', buildMsg('Admin', `${name} has left the room`))
      }

      // Join new room
      socket.join(room)
      
      // Update users list
      const user = { id: socket.id, name, room }
      UsersState.setUsers([
        ...UsersState.users.filter((u: User) => u.id !== socket.id),
        user
      ])

      // Notify room of new user
      socket.emit('message', buildMsg('Admin', `You have joined the ${room} chat room`))
      socket.broadcast.to(room).emit('message', buildMsg('Admin', `${name} has joined the room`))

      // Update user list for room
      io.to(room).emit('userList', {
        users: UsersState.users.filter((u: User) => u.room === room)
      })

      // Update rooms list for everyone
      io.emit('roomList', {
        rooms: Array.from(new Set(UsersState.users.map((u: User) => u.room)))
      })
    })

    socket.on('message', (data: MessageData) => {
      const { name, text } = data;
      const room = UsersState.users.find((u: User) => u.id === socket.id)?.room
      if (room) {
        io.to(room).emit('message', buildMsg(name, text))
      }
    })

    socket.on('activity', (name: Parameters<ClientToServerEvents['activity']>[0]) => {
      const room = UsersState.users.find((u: User) => u.id === socket.id)?.room
      if (room) {
        socket.broadcast.to(room).emit('activity', name)
      }
    })

    socket.on('disconnect', () => {
      const user = UsersState.users.find((u: User) => u.id === socket.id)
      if (user) {
        io.to(user.room).emit('message', buildMsg('Admin', `${user.name} has left the room`))
        UsersState.setUsers(UsersState.users.filter((u: User) => u.id !== socket.id))
        
        io.to(user.room).emit('userList', {
          users: UsersState.users.filter((u: User) => u.room === user.room)
        })
        
        io.emit('roomList', {
          rooms: Array.from(new Set(UsersState.users.map((u: User) => u.room)))
        })
      }
    })
  })

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
})