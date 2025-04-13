import { ECSYThreeSystem } from 'ecsy-three';

export class DebugSystem extends ECSYThreeSystem {
  static queries = {};

  execute(_delta: number, _time: number): void {}
}
