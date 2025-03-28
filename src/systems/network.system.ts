import * as THREE from 'three';
import { WebSocketEvent } from '@root/enums/network.enums';
import { GameState, GameStore } from '@root/stores/game.store';
import { LobbyState } from '@root/types/game.types';
import { PlayerComponent } from '@root/components/player.component';
import { TransformComponent } from '@root/components/transform.component';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { PlayerAnimationComponent } from '@root/components/player-animation.component';
import { MovementComponent } from '@root/components/movement.component';
import { TerrainComponent } from '@root/components/terrain.component';
import {
  ECSYThreeSystem,
  MeshTagComponent,
  Object3DComponent,
  WebGLRendererComponent,
} from 'ecsy-three';

type Message = { event: WebSocketEvent; payload: any };

// TODO: Move to a separate file and use a singleton
const gltfLoader = new GLTFLoader();

export class NetworkSystem extends ECSYThreeSystem {
  private socket!: WebSocket;
  private messageQueue!: Message[];
  private mappedPlayers: Record<string, number> = {};
  static queries = {
    terrain: { components: [TerrainComponent, Object3DComponent, MeshTagComponent] },
    renderer: { components: [WebGLRendererComponent] },
  };

  init() {
    this.messageQueue = [];
    this.socket = new WebSocket('ws://localhost:80');
    this.socket.binaryType = 'arraybuffer';

    this.socket.onclose = () => console.log('Disconnected from server');
    this.socket.onerror = (error) => console.error('WebSocket error:', error);
    this.socket.onopen = () => GameStore.subscribe(this.listener.bind(this));

    this.socket.onmessage = (rawMessage) => {
      const message = this.parseRawMessage(rawMessage);
      this.messageQueue.push(message);
    };
  }

  execute(_delta: number, _time: number): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()!;
      this.processMessage(message);
    }
  }

  private sendMessage(event: WebSocketEvent, payload: string): void {
    if (this.socket.readyState !== WebSocket.OPEN) {
      console.error('Error sending message: Connection with server dropped');
      return;
    }

    const payloadBuffer = new TextEncoder().encode(payload);
    const message = new Uint8Array(1 + payloadBuffer.length);
    message[0] = event;
    message.set(payloadBuffer, 1);

    this.socket.send(message);
  }

  private parseRawMessage(rawMessage: MessageEvent): Message {
    const arrayBuffer = rawMessage.data as ArrayBuffer;
    const uint8Array = new Uint8Array(arrayBuffer);
    const event = uint8Array[0];
    const payload = JSON.parse(new TextDecoder().decode(uint8Array.slice(1)));
    // TODO: Assign type and validate if event corresponds to payload type

    return { event, payload };
  }

  private listener(state: GameState) {
    if (state.requestGameList) {
      this.sendMessage(WebSocketEvent.GamesList, '');
      GameStore.update('requestGameList', false);
    }

    if (state.targetPosition) {
      const test = JSON.stringify(state.targetPosition);
      this.sendMessage(WebSocketEvent.PlayerMove, test);
      GameStore.update('targetPosition', null);
    }
  }

  private processMessage({ event, payload }: Message) {
    switch (event) {
      case WebSocketEvent.Authentication:
        GameStore.update('user', payload);
        this.sendMessage(WebSocketEvent.JoinGame, 'public-game');
        break;
      case WebSocketEvent.GamesList: {
        break;
      }
      case WebSocketEvent.JoinGame: {
        const lobbyState = payload as LobbyState;
        const sceneEntity =
          this.queries.renderer.results[0].getComponent(WebGLRendererComponent)?.scene;
        if (!sceneEntity) return;

        const scene = sceneEntity.getObject3D<THREE.Scene>();
        if (!scene) return;

        /**
         * steps: Number of subdivisions
         * depth: Depth of the extrusion (platform height)
         * bevelEnabled: Adds a bevel around the edges
         */
        const terrainGeometrySettings = { steps: 2, depth: -0.1, bevelEnabled: false };
        const terrainShape = new THREE.Shape(
          lobbyState.terrain.points.map((p) => new THREE.Vector2(p.x, p.y))
        );
        const terrainGeometry = new THREE.ExtrudeGeometry(terrainShape, terrainGeometrySettings);
        const terrainMaterial = new THREE.MeshToonMaterial({
          side: 1,
          color: new THREE.Color(0xffffff),
        });
        const terrainMesh = new THREE.Mesh(terrainGeometry, terrainMaterial);
        terrainMesh.receiveShadow = true;
        terrainMesh.rotation.x = -Math.PI / 2;
        terrainMesh.position.set(-5, 0, 5);

        this.world
          .createEntity()
          .addObject3DComponent(terrainMesh, sceneEntity)
          .addComponent(TerrainComponent);

        scene.add(terrainMesh);

        for (const [id, player] of Object.entries(lobbyState.players)) {
          gltfLoader.load('/models/girl.glb', (model) => {
            model.scene.scale.set(1, 1, 1);
            model.scene.position.set(0, 0, 0);
            model.scene.castShadow = true;

            const mixer = new THREE.AnimationMixer(model.scene);
            const playerEntity = this.world
              .createEntity()
              .addObject3DComponent(model.scene)
              .addComponent(MovementComponent)
              .addComponent(PlayerComponent, { username: player.username, id })
              .addComponent(TransformComponent, {
                position: new THREE.Vector3(
                  player.position.x,
                  player.position.y,
                  player.position.z
                ),
              })
              .addComponent(PlayerAnimationComponent, {
                mixer,
                idle: mixer.clipAction(model.animations.find((x) => x.name === 'idle')!),
                run: mixer.clipAction(model.animations.find((x) => x.name === 'fast-run')!),
                tpose: mixer.clipAction(model.animations.find((x) => x.name === 'tpose')!),
                walk: mixer.clipAction(model.animations.find((x) => x.name === 'walk')!),
                current: mixer.clipAction(model.animations.find((x) => x.name === 'idle')!),
              });

            this.mappedPlayers[id] = playerEntity.id;
            scene.add(model.scene);
          });
        }
        break;
      }
      case WebSocketEvent.GameStateUpdate: {
        break;
      }
    }
  }
}
