import { Component, RefPropType, Types } from "ecsy";
import { CollisionLayer, CollisionShape2D } from "@shared/enums/game.enums";
import * as THREE from "three";
import { ECSYThreeEntity } from "ecsy-three";

export class Collision2DComponent extends Component<Collision2DComponent> {
  shape!: CollisionShape2D;
  radius!: number;
  layer!: CollisionLayer;
  size!: THREE.Vector2;
  collidesWith!: number;
  points!: THREE.Vector2[];
  isActive!: boolean;
  isTrigger!: boolean;
  collidingEntities!: Set<ECSYThreeEntity>;

  static schema = {
    layer: { type: Types.Number },
    shape: { type: Types.Ref as RefPropType<CollisionShape2D> },
    radius: { type: Types.Number },
    size: { type: Types.Ref as RefPropType<THREE.Vector2> },
    points: { type: Types.Ref as RefPropType<THREE.Vector2[]> },
    collidesWith: { type: Types.Number },
    isActive: { type: Types.Boolean },
    isTrigger: { type: Types.Boolean },
    collidingEntities: { type: Types.Ref as RefPropType<Set<ECSYThreeEntity>> },
  };
}
