export interface NetworkPlayer {
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

export interface NetworkTerrain {
  id: string;
  name: string;
  points: Array<{ x: number; y: number }>;
}

export interface NetworkJoinGamePayload {
  gameId: string;
  host: string;
  name: string;
  players: Record<string, NetworkPlayer>;
}

export interface NetworkGameState {
  players: Record<string, NetworkPlayer>;
}
