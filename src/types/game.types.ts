export interface LobbyState {
  id: string;
  host: string;
  name: string;
  players: Record<string, Player>;
  terrain: Terrain;
}

export interface Player {
  username: string;
  skin: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  targetPosition: {
    x: number;
    y: number;
    z: number;
  } | null;
}

export interface Terrain {
  id: string;
  name: string;
  points: Array<{ x: number; y: number }>;
}
