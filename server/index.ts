import { createServer } from "http";
import { Server } from 'socket.io';
const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});


io.on("connection", (socket) => {
  const games:Room[] = []
  socket.on("create", message => {
    games.push(message)
  })

});

io.listen(3000)