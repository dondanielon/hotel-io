import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  AxesHelper,
  BackSide,
  Box3,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  SkinnedMesh,
  Vector3Like,
} from 'three';

import { GLTFile, PlayerMesh } from '../common/types';
import { DEBUG_AXES_SIZE, MOVEMENT_SYSTEM_PLAYER_WALKING_SPEED } from '../common/constants';

export class PlayerEntity {
  public id: string;
  public isMoving: boolean;
  public toggleRun: boolean;
  public speed: number;
  // MeshComponent
  public mesh: PlayerMesh;
  public boundingBox: Box3;
  private model: GLTFile;
  // AnimationComponent
  public idleAnimation: AnimationAction;
  public runAnimation: AnimationAction;
  public tPoseAnimation: AnimationAction;
  public walkAnimation: AnimationAction;
  public jumpAnimation: AnimationAction;
  public selectedMoveAnimation: AnimationAction;
  public mixer: AnimationMixer;

  constructor(model: GLTFile, inititalPosition: Vector3Like, debug: boolean) {
    this.id = model.id;
    this.isMoving = false;
    this.toggleRun = false;
    this.speed = MOVEMENT_SYSTEM_PLAYER_WALKING_SPEED;

    this.model = model;
    this.mesh = model.scene;
    this.boundingBox = new Box3().setFromObject(this.mesh);

    // this.mesh.traverse((child) => {
    //   if (child.name === 'Maria_sword' || child.name === 'Maria_J_J_Ong') {
    //     const node = child as SkinnedMesh;

    //     node.material = new MeshPhysicalMaterial({
    //       color: (node.material as MeshPhysicalMaterial).color || 0xffffff, // Mantén el color original
    //       roughness: 0.8, // Ajusta para reducir reflejos
    //       metalness: 0, // Elimina reflejos metálicos
    //       clearcoat: 0, // Reduce efectos brillantes adicionales
    //     });

    //     const outlineMaterial = new MeshBasicMaterial({
    //       color: 0x000000, // Color negro para el contorno
    //       side: BackSide, // Renderiza desde atrás
    //     });

    //     // Clonar la malla para el contorno
    //     const outlineMesh = new SkinnedMesh(node.geometry, outlineMaterial);
    //     outlineMesh.skeleton = node.skeleton; // Copiar el esqueleto
    //     outlineMesh.scale.set(3.2, 3.2, 3.2); // Agrandar ligeramente

    //     // Añadir el contorno como hijo
    //     node.add(outlineMesh);
    //   }
    // });
    // console.log(this.mesh);

    this.mixer = new AnimationMixer(this.mesh);

    const { idle, run, tPose, walk, jump } = this.findAnimations(this.model.animations);
    this.idleAnimation = this.mixer.clipAction(idle);
    this.runAnimation = this.mixer.clipAction(run);
    this.tPoseAnimation = this.mixer.clipAction(tPose);
    this.walkAnimation = this.mixer.clipAction(walk);
    this.jumpAnimation = this.mixer.clipAction(jump);

    this.idleAnimation.play();
    this.selectedMoveAnimation = this.walkAnimation;

    this.mesh.scale.set(1, 1, 1);
    this.mesh.castShadow = true;
    this.mesh.position.set(inititalPosition.x, inititalPosition.y, inititalPosition.z);

    if (debug) {
      this.mesh.add(new AxesHelper(DEBUG_AXES_SIZE));
    }
  }

  private findAnimations(animations: AnimationClip[]) {
    return {
      idle: animations.find((animation) => animation.name === 'idle')!,
      run: animations.find((animation) => animation.name === 'fast-run')!,
      tPose: animations.find((animation) => animation.name === 'tpose')!,
      walk: animations.find((animation) => animation.name === 'walk')!,
      jump: animations.find((animation) => animation.name === 'jump')!,
    };
  }
}
