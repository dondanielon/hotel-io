import { User } from '@root/types/user.types';
import { Store } from './store';

export interface GameState {
  mappedPlayers: Record<string, number>;
  requestGameList: boolean;
  targetPosition: { x: number; y: number; z: number } | null;
  user: User | null;
}

export const GameStore = new Store<GameState>({
  mappedPlayers: {},
  requestGameList: false,
  targetPosition: null,
  user: null,
});
