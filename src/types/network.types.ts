import { Player, Terrain } from "./game.types";

export interface NetworkJoinGamePayload {
  gameId: string;
  host: string;
  name: string;
  players: Record<string, Player>;
  terrain: Terrain;
}

export interface NetworkGameState {
  players: Record<string, Player>;
}
