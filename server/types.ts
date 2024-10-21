interface Room {
  roomId: number
  players: Player[],
  maxPlayers: number,
  gameState: GameState
}

interface Player {
  username: string,
  hand: Card[]
}

interface Card {
  value: string,
  type: string,
}

interface GameState {
  drawDeck: Card[]
  discardDeck: Card[]
  currentPlayerIndex: number,
  direction: number, 
  winners: string[]
}