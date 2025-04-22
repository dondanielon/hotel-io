import { Component, RefPropType, Types } from 'ecsy';
import { Vector3 } from 'three';

export class MovementComponent extends Component<MovementComponent> {
  isMoving!: boolean;
  speed!: number;
  targetPosition!: Vector3 | null;
  isDashing!: boolean;
  dashDirection!: Vector3 | null;
  dashTimer!: number;
  static schema = {
    isMoving: { type: Types.Boolean },
    speed: { type: Types.Number },
    targetPosition: { type: Types.Ref as RefPropType<Vector3 | null> },
    isDashing: { type: Types.Boolean },
    dashDirection: { type: Types.Ref as RefPropType<Vector3 | null> },
    dashTimer: { type: Types.Number },
  };
}
