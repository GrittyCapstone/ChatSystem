'use client'

import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { ClientToServerEvents, ServerToClientEvents, Message } from '@/types'

export default function Chat() {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null)
  const [name, setName] = useState('')
  const [room, setRoom] = useState('')
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<string[]>([])
  const [rooms, setRooms] = useState<string[]>([])
  const [activity, setActivity] = useState('')

  useEffect(() => {
    const newSocket = io('ws://localhost:3000')
    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  useEffect(() => {
    if (!socket) return

    socket.on('message', (message) => {
      setMessages(prev => [...prev, message])
      setActivity('')
    })

    socket.on('userList', ({ users }) => {
      setUsers(users.map(u => u.name))
    })

    socket.on('roomList', ({ rooms }) => {
      setRooms(rooms)
    })

    socket.on('activity', (name) => {
      setActivity(`${name} is typing...`)
      setTimeout(() => setActivity(''), 2000)
    })

    return () => {
      socket.off('message')
      socket.off('userList')
      socket.off('roomList')
      socket.off('activity')
    }
  }, [socket])

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault()
    if (socket && name && room) {
      socket.emit('enterRoom', { name, room })
    }
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (socket && message && name) {
      socket.emit('message', { name, text: message })
      setMessage('')
    }
  }

  const handleTyping = () => {
    if (socket && name) {
      socket.emit('activity', name)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Join Form */}
      <form onSubmit={handleJoinRoom} className="mb-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="border p-2 mr-2"
        />
        <input
          type="text"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="Room name"
          className="border p-2 mr-2"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Join Room
        </button>
      </form>

      {/* Messages */}
      <div className="h-96 overflow-y-auto border mb-4 p-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-2 ${
              msg.name === name ? 'text-right' : 'text-left'
            }`}
          >
            <span className="font-bold">{msg.name}: </span>
            <span>{msg.text}</span>
            <span className="text-xs text-gray-500"> ({msg.time})</span>
          </div>
        ))}
      </div>

      {/* Send Message Form */}
      <form onSubmit={handleSendMessage} className="mb-4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleTyping} 
          placeholder="Type a message"
          className="border p-2 mr-2 w-full"
        />
        <button type="submit" className="bg-green-500 text-white p-2 rounded">
          Send
        </button>
      </form>

      {/* Activity */}
      <div className="text-gray-500 italic">{activity}</div>

      {/* Users & Rooms */}
      <div className="mt-4 flex gap-4">
        <div>
          <h3 className="font-bold">Users:</h3>
          <ul>
            {users.map((user, i) => (
              <li key={i}>{user}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-bold">Rooms:</h3>
          <ul>
            {rooms.map((room, i) => (
              <li key={i}>{room}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}