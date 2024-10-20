import { createServer } from "http";
import { Server } from 'socket.io';
import { dealCards, initializeDeck, validateMove } from "./utils.js";

// here initializing the http and web-sockets server
const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

// basic rundown, for connection
io.on("connection", (socket) => {
  let games: Room[] = []
  socket.on("create", (message: Room) => {
    // initializing a deck of 110
    const drawDeck = initializeDeck()
    // popping of the first card and adding it to the discard deck
    const firstCard = drawDeck.pop()

    // initializing basic gamestate properties
    const gameState: GameState = {
      currentPlayerIndex: 0,
      direction: 1,
      discardDeck: [],
      drawDeck: drawDeck
    }
    // typescript shennanigans , I think I misspelled it
    if (firstCard) {
      gameState.discardDeck.push(firstCard)
    } else {
      socket._error('Deck is empty')
    }
    message.gameState = gameState
    // adding the current game to the central state
    games.push(message)
    socket.join(String(message.roomId))
    io.to(String(message.roomId)).emit("roomCreated", message)
  })

  socket.on("join", message => {
    let room = games.find(val => val.roomId == message.roomId)
    // ensuring that a room exists and there is space
    if (room && room.players.length != room.maxPlayers) {
      // dealing cards
      const { deck, hand } = dealCards(room.gameState.drawDeck, 8)
      // adding the player in the list
      const currentPlayer: Player = { username: message.userName, hand: hand }

      // updating room state
      room = { ...room, players: [...room.players, currentPlayer], gameState: { ...room.gameState, drawDeck: deck } }
      // updating the central games state
      games = games.filter(game => game.roomId != room?.roomId)
      games.push(room)

      // joining the room
      socket.join(message.roomId)
      io.to(String(room.roomId)).emit("newJoinee", `${message.username} has joined the room!`)
    }
  })

  socket.on("play", message => {
    /*
        {
          roomId,
          card,
          userName
        }
      */
    const room = games.find(val => val.roomId == message.roomId)
    const roomIndex = games.findIndex(val => val.roomId == message.roomId)
    const player = room?.players.find(val => val.username == message.username)
    const playerIndex = room?.players.findIndex(val => val.username == message.username)
    if (room && playerIndex) {
      const topMostCard = room.gameState.discardDeck.at(-1)
      if (topMostCard && validateMove(topMostCard, message.card)) {
        // this means we can play the move
        if (player && player.hand) player.hand.pop()
        room.gameState.discardDeck.push(message.card)
        games[roomIndex] = room
      } else {
        // pick-up 8 cards
        const utha = room.gameState.drawDeck.slice(-8)
        // updating local player and room state
        if (player && player.hand) {
          player.hand = player.hand.concat(utha)
          room.players[playerIndex] = player
        }
        // removing cards from the draw deck
        for (let i = 0; i < 8; i++) room.gameState.drawDeck.pop()
        games[roomIndex] = room
      }
      socket.emit("updateHand", player);
    }
  })

  socket.on("delete", message => {
    games = games.filter(val => val != message)
  })
});
io.listen(3000)