import { ECSYThreeSystem } from 'ecsy-three';

export class PhysicsSystem extends ECSYThreeSystem {
  static queries = {};

  execute(_delta: number, _time: number): void {}
}
