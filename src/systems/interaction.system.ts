import { ECSYThreeSystem } from 'ecsy-three';

export class InteractionSystem extends ECSYThreeSystem {
  static queries = {};

  execute() {
    console.log('InteractionSystem');
  }
}
