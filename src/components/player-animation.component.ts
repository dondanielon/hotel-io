import { Component, RefPropType, Types } from 'ecsy';
import { AnimationAction, AnimationMixer } from 'three';

export class PlayerAnimationComponent extends Component<PlayerAnimationComponent> {
  mixer!: AnimationMixer;
  idle!: AnimationAction;
  run!: AnimationAction;
  tpose!: AnimationAction;
  walk!: AnimationAction;
  static schema = {
    mixer: { type: Types.Ref as RefPropType<AnimationMixer> },
    idle: { type: Types.Ref as RefPropType<AnimationAction> },
    run: { type: Types.Ref as RefPropType<AnimationAction> },
    tpose: { type: Types.Ref as RefPropType<AnimationAction> },
    walk: { type: Types.Ref as RefPropType<AnimationAction> },
  };
}
