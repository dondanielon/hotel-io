export enum WebSocketEvent {
  // Authentication and Connection Events
  Authentication = 0,

  // Game Management Events
  CreateGame = 10,
  DeleteGame = 11,
  GamesList = 12,
  JoinGame = 13,
  LeaveGame = 14,
  GameStateUpdate = 15,
  GameSettingsUpdate = 16,

  // Player Events
  PlayerJoin = 20,
  PlayerLeave = 21,
  PlayerMove = 22,
  PlayerAction = 23,
  PlayerStateUpdate = 24,
  PlayerInventoryUpdate = 25,
  PlayerStatsUpdate = 26,

  // Chat and Communication
  PlayerMessage = 30,
  MessageList = 31,
  SystemMessage = 32,
  WhisperMessage = 33,

  // Game State Events
  TerrainUpdate = 40,
  ObjectSpawn = 41,
  ObjectDespawn = 42,
  ObjectInteraction = 43,
  WeatherUpdate = 44,
  TimeUpdate = 45,

  // Combat and Interaction
  CombatStart = 50,
  CombatEnd = 51,
  DamageDealt = 52,
  DamageReceived = 53,
  ItemPickup = 54,
  ItemDrop = 55,

  // Error Events (Server to Client only)
  Error = 252,
  Forbidden = 253,
  Unauthorized = 254,
  ServerError = 255,
}
