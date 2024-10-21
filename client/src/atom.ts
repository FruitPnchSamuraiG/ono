import { atom } from "jotai"
import { io } from "socket.io-client"

export interface GameState {
  drawDeck: Card[]
  discardDeck: Card[]
  currentPlayerIndex: number,
  direction: number, 
}

export interface Card {
  value: string,
  type: string,
}

export interface Player {
  username: string,
  hand: Card[],
}

export interface Room {
  roomId: number
  players: Player[],
  maxPlayers: number,
  gameState: GameState
}


export const roomStateAtom = atom<Room>()
export const playerAtom = atom<Player>()

// initializing the socket
export const socket = io("http://localhost:5000")