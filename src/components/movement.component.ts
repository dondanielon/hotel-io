import { Component, Types } from 'ecsy';

export class MovementComponent extends Component<MovementComponent> {
  isMoving!: boolean;
  speed!: number;
  static schema = {
    isMoving: { type: Types.Boolean, default: false },
    speed: { type: Types.Number, default: 1 },
  };
}
