import { MovementComponent } from "@root/components/movement.component";
import { PlayerAnimationComponent } from "@root/components/player-animation.component";
import { PlayerComponent } from "@root/components/player.component";
import { PlayerConstants } from "@shared/constants/player.constants";
import { ECSYThreeSystem } from "ecsy-three";

/**
 * System responsible for handling player animations
 */
export class AnimationSystem extends ECSYThreeSystem {
  static queries = {
    players: {
      components: [PlayerComponent, PlayerAnimationComponent, MovementComponent],
    },
  };

  execute(delta: number, _time: number): void {
    for (const entity of this.queries.players.results) {
      const playerMesh = entity.getObject3D<THREE.Mesh>()!;
      const animationComponent = entity.getComponent(PlayerAnimationComponent)!;
      const movementComponent = entity.getComponent(MovementComponent)!;

      animationComponent.mixer.update(delta);

      if (movementComponent.isDashing && animationComponent.walk.isRunning()) {
        animationComponent.walk.fadeOut(PlayerConstants.ANIMATION_FADE_DURATION);
        animationComponent.idle.reset().fadeIn(PlayerConstants.ANIMATION_FADE_DURATION).play();
      }

      if (!movementComponent.targetPosition) return;

      const distance = movementComponent.speed * delta;

      if (playerMesh.position.distanceTo(movementComponent.targetPosition) > distance) {
        if (!animationComponent.walk.isRunning()) {
          animationComponent.idle.fadeOut(PlayerConstants.ANIMATION_FADE_DURATION);
          animationComponent.walk.reset().fadeIn(PlayerConstants.ANIMATION_FADE_DURATION).play();
        }
      } else {
        if (animationComponent.walk.isRunning()) {
          animationComponent.walk.fadeOut(PlayerConstants.ANIMATION_FADE_DURATION);
          animationComponent.idle.reset().fadeIn(PlayerConstants.ANIMATION_FADE_DURATION).play();
        }
      }
    }
  }
}
