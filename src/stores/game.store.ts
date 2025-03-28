import { User } from '@root/types/user.types';
import { Store } from './store';

export interface GameState {
  requestGameList: boolean;
  targetPosition: { x: number; y: number; z: number } | null;
  user: User | null;
}

export const GameStore = new Store<GameState>({
  requestGameList: false,
  targetPosition: null,
  user: null,
});
