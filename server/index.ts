import express from 'express';
import http from 'http';
import {Server} from 'socket.io';

const app = express();
const server = http.createServer(app);



type Point = {x: number, y: number}

type DrawLine = {
  prevPoint: Point | null
  currentPoint: Point
  color: string,
  lineWidth: number,
}

const io = new Server(server, {
  cors: {
    origin: '*'
  },
})

io.on('connection', (socket) => {
  socket.on('client-ready', () => {
    socket.broadcast.emit('get-canvas-state')
  })

  socket.on('canvas-state', (state) => {
    console.log('received canvas state')
    socket.broadcast.emit('canvas-state-from-server', state)
  })

  socket.on('draw-line', ({ prevPoint, currentPoint, color, lineWidth}: DrawLine) => {
    socket.broadcast.emit('draw-line', { prevPoint, currentPoint, color, lineWidth })
  })

  socket.on('clear', () => io.emit('clear'))
})

server.listen(3001, () => {
  console.log('✔️ Server listening on port 3001')
})
