export enum GameAnimationAction {
  TPose = "tpose",
  Walk = "walk",
  Run = "run",
  Dash = "dash",
  SwordAttack = "swordAttack",
  Idle = "idle",
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
