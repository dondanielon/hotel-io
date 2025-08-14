export enum WebSocketEvent {
  // Authentication and Connection Events
  Authentication = 0,
  JoinGame = 1,
  LeaveGame = 2,
  GameStateUpdate = 3,
  PlayerJoin = 4,
  PlayerLeave = 5,
  PlayerMove = 6,
  PlayerDash = 7,

  // Error Events (Server to Client only)
  Error = 252,
  Forbidden = 253,
  Unauthorized = 254,
  ServerError = 255,
}
