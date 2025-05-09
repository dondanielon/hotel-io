import * as THREE from "three";
import { WebSocketEvent } from "@root/enums/network.enums";
import { GameState, GameStore } from "@root/stores/game.store";
import { PlayerComponent } from "@root/components/player.component";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { PlayerAnimationComponent } from "@root/components/player-animation.component";
import { MovementComponent } from "@root/components/movement.component";
import { TerrainComponent } from "@root/components/terrain.component";
import {
  ECSYThreeSystem,
  ECSYThreeWorld,
  MeshTagComponent,
  Object3DComponent,
  WebGLRendererComponent,
} from "ecsy-three";
import { LobbyState, Player } from "@root/types/game.types";
import { GameUtils } from "@root/utils/game.utils";
import { GameAnimationAction } from "@root/enums/game.enums";

type Message = { event: WebSocketEvent; payload: any };

/**
 * System responsible for handling network communication and game state synchronization.
 */
export class SocketSystem extends ECSYThreeSystem {
  // Hardcoded for now
  private static readonly WS_URL = "ws://localhost:80";
  private static readonly TERRAIN_POSITION = new THREE.Vector3(-5, 0, 5);

  private socket: WebSocket;
  private messageQueue: Message[];
  private gltfLoader: GLTFLoader;

  static queries = {
    terrain: {
      components: [TerrainComponent, Object3DComponent, MeshTagComponent],
    },
    renderer: { components: [WebGLRendererComponent] },
  };

  constructor(world: ECSYThreeWorld) {
    super(world);
    this.messageQueue = [];
    this.socket = new WebSocket(SocketSystem.WS_URL);
    this.socket.binaryType = "arraybuffer";
    this.gltfLoader = new GLTFLoader();
    this.setupWebSocket();
  }

  private setupWebSocket(): void {
    this.socket.onclose = () => console.log("Disconnected from server");
    this.socket.onerror = (error) => console.error("WebSocket error:", error);
    this.socket.onopen = () => GameStore.subscribe(this.handleGameStateChange.bind(this));

    this.socket.onmessage = (rawMessage) => {
      const message = this.parseRawMessage(rawMessage);
      this.messageQueue.push(message);
    };
  }

  init(): void {}

  execute(_delta: number, _time: number): void {
    let message: Message | null;
    while ((message = this.messageQueue.shift() ?? null)) {
      this.processMessage(message);
    }
  }

  private parseRawMessage(rawMessage: MessageEvent): Message {
    console.info("rawmessage", rawMessage);
    const arrayBuffer = rawMessage.data as ArrayBuffer;
    const uint8Array = new Uint8Array(arrayBuffer);
    const event = uint8Array[0];
    const rawPayload = new TextDecoder().decode(uint8Array.slice(1));
    console.log({ event, payload: new TextDecoder().decode(uint8Array.slice(1)) });

    // This is a band aid for this issue, I still need to implement a better way
    // of parsing the messages received by the server
    let payload: any;
    try {
      payload = JSON.parse(rawPayload);
    } catch {
      console.info("Invalid JSON to parse, using fallback");
      payload = rawPayload;
    }

    return { event, payload };
  }

  private sendMessage(event: WebSocketEvent, payload: string): void {
    if (this.socket.readyState !== WebSocket.OPEN) {
      console.error("Error sending message: Connection with server dropped");
      return;
    }

    const payloadBuffer = new TextEncoder().encode(payload);
    const message = new Uint8Array(1 + payloadBuffer.length);
    message[0] = event;
    message.set(payloadBuffer, 1);

    this.socket.send(message);
  }

  private handleGameStateChange(state: GameState): void {
    if (state.requestGameList) {
      this.sendMessage(WebSocketEvent.GamesList, "");
      GameStore.update("requestGameList", false);
    }

    if (state.targetPosition) {
      this.sendMessage(WebSocketEvent.PlayerMove, JSON.stringify(state.targetPosition));
      GameStore.update("targetPosition", null);
    }
  }

  private processMessage({ event, payload }: Message): void {
    switch (event) {
      case WebSocketEvent.Authentication: {
        GameStore.update("user", payload);
        this.sendMessage(WebSocketEvent.JoinGame, "public-game");
        break;
      }

      case WebSocketEvent.JoinGame: {
        const sceneEntity = this.queries.renderer.results[0]?.getComponent(WebGLRendererComponent)?.scene!;
        const scene = sceneEntity.getObject3D<THREE.Scene>()!;

        const { terrain, players } = payload as LobbyState;
        const terrainPoints = terrain.points.map((point) => new THREE.Vector2(point.x, point.y));
        const terrainMesh = GameUtils.createTerrain(terrainPoints, SocketSystem.TERRAIN_POSITION);

        this.world.createEntity().addObject3DComponent(terrainMesh, sceneEntity).addComponent(TerrainComponent);

        for (const [id, player] of Object.entries(players)) {
          this.gltfLoader.load("/models/basic_male.glb", (model) => {
            model.scene.scale.set(1, 1, 1);
            model.scene.position.set(0, 0, 0);
            model.scene.castShadow = true;
            this.createPlayerEntity({ scene, model, id, player });
          });
        }

        break;
      }

      default:
        console.warn("Unknown/Unhandled message event:", event);
    }
  }

  private createPlayerEntity(config: {
    id: string;
    scene: THREE.Scene;
    model: any;
    player: Player;
    noAnimation?: boolean;
  }): void {
    const mixer = new THREE.AnimationMixer(config.model.scene);

    const playerEntity = this.world
      .createEntity()
      .addObject3DComponent(config.model.scene)
      .addComponent(MovementComponent, {
        isMoving: false,
        speed: 1,
        targetPosition: null,
        isDashing: false,
        dashDirection: null,
        dashTimer: 0,
      })
      .addComponent(PlayerComponent, { username: config.player.username, id: config.id });

    if (config.noAnimation === true) {
      const animations = GameUtils.setupPlayerAnimations(mixer, config.model.animations);
      playerEntity.addComponent(PlayerAnimationComponent, {
        ...animations,
        mixer,
        currentAction: GameAnimationAction.Idle,
      });

      animations.idle.play();
    }

    config.scene.add(config.model.scene);

    const mappedPlayers = GameStore.getState().mappedPlayers;
    GameStore.update("mappedPlayers", { ...mappedPlayers, [config.id]: playerEntity.id });

    if (config.id === GameStore.getState().user?.id) {
      GameStore.update("cameraTarget", playerEntity);
    }
  }
}
