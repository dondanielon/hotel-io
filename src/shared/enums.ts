export enum Action {
  Default = "",
  EditorPlacingItem = "editor-placing-item",
}

export enum CollisionLayer {
  TERRAIN = 1,
  PLAYER = 2,
  ENEMY = 4,
  PROJECTILE = 8,
  WALLS = 16,
  ABILITIES = 32,
}

export enum CollisionShape2D {
  CIRCLE = "circle",
  BOX = "box",
  LINE = "line",
}

export enum GameAnimationAction {
  TPose = "tpose",
  Walk = "walk",
  Run = "run",
  Dash = "dash",
  SwordAttack = "sword-attack",
  Idle = "idle",
}

export enum KeyPressed {
  PlayerDash = "w",
  Console = "`",
}
