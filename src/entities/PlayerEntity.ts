import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  AxesHelper,
  Box3,
  Vector3Like,
} from 'three';

import { GLTFile, PlayerMesh } from '../common/types';
import { DEBUG_AXES_SIZE } from '../common/constants';

export class PlayerEntity {
  public id: string;
  public isMoving: boolean;
  // MeshComponent
  public mesh: PlayerMesh;
  public boundingBox: Box3;
  private model: GLTFile;
  // AnimationComponent
  public idleAnimation: AnimationAction;
  public runAnimation: AnimationAction;
  public tPoseAnimation: AnimationAction;
  public mixer: AnimationMixer;

  constructor(model: GLTFile, inititalPosition: Vector3Like, debug: boolean) {
    this.id = model.id;
    this.isMoving = false;

    this.model = model;
    this.mesh = model.scene;
    this.boundingBox = new Box3().setFromObject(this.mesh);

    this.mixer = new AnimationMixer(this.mesh);

    const { idle, run, tPose } = this.findAnimations(this.model.animations);
    console.log(idle);
    this.idleAnimation = this.mixer.clipAction(idle);
    this.runAnimation = this.mixer.clipAction(run);
    this.tPoseAnimation = this.mixer.clipAction(tPose);

    this.idleAnimation.play();

    this.mesh.scale.set(1, 1, 1);
    this.mesh.castShadow = true;
    this.mesh.position.set(inititalPosition.x, inititalPosition.y, inititalPosition.z);

    if (debug) {
      this.mesh.add(new AxesHelper(DEBUG_AXES_SIZE));
    }
  }

  private findAnimations(animations: AnimationClip[]) {
    return {
      idle: animations.find((animation) => animation.name === 'breathing-idle')!,
      run: animations.find((animation) => animation.name === 'standard-run')!,
      tPose: animations.find((animation) => animation.name === 't-pose')!,
    };
  }
}
