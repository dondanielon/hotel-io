import { Store } from './store';

export interface GameState {
  requestGameList: boolean;
  targetPosition: { x: number; y: number; z: number } | null;
}

export const GameStore = new Store<GameState>({
  requestGameList: false,
  targetPosition: null,
});
