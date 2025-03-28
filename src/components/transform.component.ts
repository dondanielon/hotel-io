import { Component, RefPropType, Types } from 'ecsy';
import { Vector3 } from 'three';

export class TransformComponent extends Component<TransformComponent> {
  position!: Vector3;
  targetPosition!: Vector3;
  rotation!: Vector3;
  scale!: Vector3;
  static schema = {
    position: { type: Types.Ref as RefPropType<Vector3> },
    targetPosition: { type: Types.Ref as RefPropType<Vector3> },
    rotation: { type: Types.Ref as RefPropType<Vector3> },
    scale: { type: Types.Ref as RefPropType<Vector3> },
  };
}
