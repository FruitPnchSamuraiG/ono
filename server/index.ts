import { createServer } from "http";
import { Server } from 'socket.io';
import { calculateStacked, dealCards, initializeDeck, updatePlayerTurn, validateMove, validateWin } from "./utils.js";

// here initializing the http and web-sockets server
const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

let games: Room[] = []
// basic rundown, for connection
io.on("connection", (socket) => {
  socket.on("create", (message: Room & { username: string }) => {
    console.log(message.username, "created a room")
    // initializing a deck of 110
    const drawDeck = initializeDeck()
    // popping of the first card and adding it to the discard deck
    const firstCard = drawDeck.pop()
    const { deck, hand } = dealCards(drawDeck, 8)
    // initializing basic gamestate properties
    const gameState: GameState = {
      currentPlayerIndex: 0,
      direction: 1,
      discardDeck: [],
      drawDeck: deck,
      winners: [],
    }
    message.players = [{ username: message.username, hand: hand }]
    message.maxPlayers = 8
    // typescript shennanigans , I think I misspelled it
    if (firstCard) {
      gameState.discardDeck.push(firstCard)
    } else {
      socket._error('Deck is empty')
    }
    message.gameState = gameState
    // adding the current game to the central state
    games.push(message)
    socket.emit("roomState", games.at(-1))
    socket.join(String(message.roomId))
    io.to(String(message.roomId)).emit("roomCreated", message)
  })

  socket.on("join", message => {
    console.log(message.username, `joined the room ${message.roomId}`)
    let room = games.find(val => val.roomId == message.roomId)
    // ensuring that a room exists and there is space
    if (room && room.players.length != room.maxPlayers) {
      // dealing cards
      const { deck, hand } = dealCards(room.gameState.drawDeck, 8)
      // adding the player in the list
      const currentPlayer: Player = { username: message.username, hand: hand }

      // updating room state
      room = { ...room, players: [...room.players, currentPlayer], gameState: { ...room.gameState, drawDeck: deck } }
      // updating the central games state
      games = games.filter(game => game.roomId != room?.roomId)
      games.push(room)

      // joining the room
      socket.join(message.roomId)
      io.to(String(room.roomId)).emit("roomState", room)
    }
  })

  socket.on("play", message => {
    const room = games.find(val => val.roomId == message.roomId)
    const roomIndex = games.findIndex(val => val.roomId == message.roomId)
    const player = room?.players.find(val => val.username == message.username)
    const playerIndex = room?.players.findIndex(val => val.username == message.username)
    if (room && playerIndex != -1 && playerIndex != undefined) {
      const topMostCard = room.gameState.discardDeck.at(-1)
      if (topMostCard && validateMove(topMostCard, message.card)) {
        // this means we can play the move
        if (player && player.hand.length > 0) {
            // removing the player
          if (validateWin(player?.hand)) {
            io.to(String(room.roomId)).emit('notification', `${player.username} has finished the game!`)
            room.players = room.players.filter(val => val.username != player.username)
            room.gameState.winners.push(player.username)
          }
          else player.hand = player.hand.filter((val, index) => index != message.index)
        }
        // updating the discard deck, we can optimize this here by only having stackable cards in the discard deck (not yet)
        room.gameState.discardDeck.push(message.card)
        // updating the current player
        room.gameState.currentPlayerIndex = updatePlayerTurn(room.players.length, room.gameState.currentPlayerIndex, message.card.value)
        games[roomIndex] = room
        // emitting to everyone in the room
        io.to(String(room.roomId)).emit("roomState", room)
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
        room.gameState.currentPlayerIndex = updatePlayerTurn(room.players.length, room.gameState.currentPlayerIndex)
        games[roomIndex] = room
        // emitting to everyone in the room
        io.to(String(room.roomId)).emit("roomState", room)
        io.to(String(room.roomId)).emit("notification", `${player?.username} ne 8 uthaye`)
      }
    }
  })

  socket.on('draw', message => {
    const room = games.find(val => val.roomId == message.roomId)
    const roomIndex = games.findIndex(val => val.roomId == message.roomId)
    const player = room?.players.find(val => val.username == message.username)
    const playerIndex = room?.players.findIndex(val => val.username == message.username)
    if (room && playerIndex != -1 && playerIndex != undefined) {
      // passing the discard deck here to calculate how many need to be picked up 
      const uthaneKitne = calculateStacked(room.gameState.discardDeck)
      const utha = room.gameState.drawDeck.slice(-uthaneKitne)
      // updating local player and room state
      if (player && player.hand) {
        player.hand = player.hand.concat(utha)
        room.players[playerIndex] = player
      }

      for (let i = 0; i < uthaneKitne; i++) room.gameState.drawDeck.pop()
      if(uthaneKitne > 1) room.gameState.discardDeck.push({type: "blank", value: "blank"})
      room.gameState.currentPlayerIndex = updatePlayerTurn(room.players.length, room.gameState.currentPlayerIndex)
      games[roomIndex] = room
      io.to(String(room.roomId)).emit("roomState", room)
      io.to(String(room.roomId)).emit("notification", `${player?.username} ne ${uthaneKitne} uthaye`)
    }
  })

  socket.on("delete", message => {
    games = games.filter(val => val != message)
  })
});
io.listen(5000)