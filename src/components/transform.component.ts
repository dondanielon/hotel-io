import { Component, Types } from 'ecsy';
import { Vector3 } from 'three';

export class TransformComponent extends Component<TransformComponent> {
  public position!: Vector3;
  public targetPosition!: Vector3;
  public rotation!: Vector3;
  public scale!: Vector3;
  public static schema = {
    position: { type: Types.Ref },
    targetPosition: { type: Types.Ref },
    rotation: { type: Types.Ref },
    scale: { type: Types.Ref },
  };
}
