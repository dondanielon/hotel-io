import { Component, RefPropType, Types } from 'ecsy';
import { Vector3 } from 'three';

export class MovementComponent extends Component<MovementComponent> {
  isMoving!: boolean;
  speed!: number;
  targetPosition!: Vector3 | null;
  static schema = {
    isMoving: { type: Types.Boolean },
    speed: { type: Types.Number },
    targetPosition: { type: Types.Ref as RefPropType<Vector3 | null> },
  };
}
