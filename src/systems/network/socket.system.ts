// import * as THREE from "three";
// import { WebSocketEvent } from "@root/enums/network.enums";
// import { GameState, GameStore } from "@root/stores/game.store";
// import { PlayerComponent } from "@root/components/player.component";
// import { GLTFLoader } from "three/examples/jsm/Addons.js";
// import { PlayerAnimationComponent } from "@root/components/player-animation.component";
// import { MovementComponent } from "@root/components/movement.component";
// import { TerrainComponent } from "@root/components/terrain.component";
// import {
//   ECSYThreeSystem,
//   ECSYThreeWorld,
//   MeshTagComponent,
//   Object3DComponent,
//   WebGLRendererComponent,
// } from "ecsy-three";
// import { GameUtils } from "@root/utils/game.utils";
// import { GameAnimationAction } from "@root/enums/game.enums";
// import { Constants } from "@root/constants";
// import { Player, Terrain } from "@root/types/game.types";

// interface Vector3 {
//   x: number;
//   y: number;
//   z: number;
// }

// interface PlayerInputV2 {
//   type: "move" | "attack" | "ability" | "dash";
//   data: any;
//   timestamp: number;
//   sequenceId: number;
// }

// interface PredictedState {
//   position: Vector3;
//   velocity: Vector3;
//   timestamp: number;
//   sequenceId: number;
// }

// interface ServerPlayerState {
//   username: string;
//   skin: string;
//   position: Vector3;
//   velocity: Vector3;
//   targetPosition: Vector3 | null;
//   isDashing: boolean;
//   combat: {
//     health: number;
//     maxHealth: number;
//     isInCombat: boolean;
//   };
//   timestamp: number;
// }

// interface ServerJoinGame {
//   gameId: string;
//   host: string;
//   name: string;
//   terrain: Terrain;
//   players: Record<string, ServerPlayerState>;
//   serverTime: number;
//   tickRate: number;
// }

// interface CombatEvent {
//   type: "damage" | "heal" | "death" | "ability";
//   sourceId?: string;
//   targetId?: string;
//   value?: number;
//   timestamp: number;
// }

// interface GameStateUpdateV2 {
//   gameTime: number;
//   players: Record<string, ServerPlayerState>;
//   events?: CombatEvent[];
// }

// type Message = { event: WebSocketEvent; payload: any };

// /**
//  * System responsible for handling network communication with client-side prediction
//  * and server reconciliation for fast-paced combat gameplay.
//  */
// export class SocketSystemV2 extends ECSYThreeSystem {
//   // Hardcoded for now - should be configurable
//   private static readonly WS_URL = "ws://localhost:8080/ws";
//   private static readonly TERRAIN_POSITION = new THREE.Vector3(0, 0, 0);

//   // Prediction settings
//   private static readonly MAX_PREDICTION_TIME = 1000; // ms
//   private static readonly RECONCILIATION_THRESHOLD = 0.5; // units
//   private static readonly INPUT_BUFFER_SIZE = 60; // inputs to keep for reconciliation

//   private socket: WebSocket;
//   private messageQueue: Message[];
//   private gltfLoader: GLTFLoader;

//   // Client prediction state
//   private inputSequence: number = 0;
//   private inputBuffer: PlayerInputV2[] = [];
//   private predictedStates: PredictedState[] = [];
//   private serverTime: number = 0;
//   private clientTime: number = 0;
//   private timeOffset: number = 0;
//   private lastServerUpdate: number = 0;

//   // Network stats
//   private ping: number = 0;
//   private lastPingTime: number = 0;

//   // Local player state for prediction
//   private localPlayerId: string | null = null;
//   private localPlayerPosition: Vector3 = { x: 0, y: 0, z: 0 };
//   private localPlayerVelocity: Vector3 = { x: 0, y: 0, z: 0 };

//   static queries = {
//     terrain: {
//       components: [TerrainComponent, Object3DComponent, MeshTagComponent],
//     },
//     renderer: { components: [WebGLRendererComponent] },
//     players: {
//       components: [PlayerComponent, MovementComponent],
//     },
//   };

//   constructor(world: ECSYThreeWorld) {
//     super(world);
//     this.messageQueue = [];
//     this.gltfLoader = new GLTFLoader();
//     this.clientTime = Date.now();

//     this.socket = new WebSocket(SocketSystemV2.WS_URL);
//     this.socket.binaryType = "arraybuffer";
//     this.socket.onclose = () => console.log("Disconnected from server");
//     this.socket.onerror = (error) => console.error("WebSocket error:", error);
//     this.socket.onopen = () => {
//       console.log("Connected to server");
//       GameStore.subscribe(this.handleGameStateChange.bind(this));
//     };

//     this.socket.onmessage = (rawMessage) => {
//       const message = this.parseRawMessage(rawMessage);
//       this.messageQueue.push(message);
//     };
//   }

//   init(): void {}

//   execute(delta: number, time: number): void {
//     this.clientTime = Date.now();

//     // Process incoming messages
//     let message: Message | null;
//     while ((message = this.messageQueue.shift() ?? null)) {
//       this.processMessage(message);
//     }

//     // Update client-side prediction
//     this.updateClientPrediction(delta);

//     // Clean up old data
//     this.cleanupOldData();
//   }

//   private updateClientPrediction(delta: number): void {
//     if (!this.localPlayerId) return;

//     // Apply physics to local player prediction
//     const deltaSeconds = delta / 1000;

//     // Simple physics simulation (should match server)
//     const friction = 0.8;
//     this.localPlayerVelocity.x *= Math.pow(friction, deltaSeconds * 10);
//     this.localPlayerVelocity.z *= Math.pow(friction, deltaSeconds * 10);

//     this.localPlayerPosition.x += this.localPlayerVelocity.x * deltaSeconds;
//     this.localPlayerPosition.z += this.localPlayerVelocity.z * deltaSeconds;

//     // Update visual representation
//     this.updateLocalPlayerVisuals();
//   }

//   private updateLocalPlayerVisuals(): void {
//     const localPlayerEntity = this.queries.players.results.find(
//       (entity) => entity.getComponent(PlayerComponent)?.id === this.localPlayerId,
//     );

//     if (localPlayerEntity) {
//       const mesh = localPlayerEntity.getObject3D<THREE.Mesh>();
//       if (mesh) {
//         mesh.position.set(this.localPlayerPosition.x, this.localPlayerPosition.y, this.localPlayerPosition.z);
//       }
//     }
//   }

//   private parseRawMessage(rawMessage: MessageEvent): Message {
//     const arrayBuffer = rawMessage.data as ArrayBuffer;
//     const uint8Array = new Uint8Array(arrayBuffer);
//     const event = uint8Array[0];
//     const rawPayload = new TextDecoder().decode(uint8Array.slice(1));

//     // This is a band aid for this issue, I still need to implement a better way
//     // of parsing the messages received by the server
//     let payload: any;
//     try {
//       payload = JSON.parse(rawPayload);
//     } catch {
//       console.info("Invalid JSON to parse, using fallback");
//       payload = rawPayload;
//     }

//     return { event, payload };
//   }

//   private sendMessage(event: WebSocketEvent, payload: string): void {
//     if (this.socket.readyState !== WebSocket.OPEN) {
//       console.error("Error sending message: Connection with server dropped");
//       return;
//     }

//     const payloadBuffer = new TextEncoder().encode(payload);
//     const message = new Uint8Array(1 + payloadBuffer.length);
//     message[0] = event;
//     message.set(payloadBuffer, 1);

//     this.socket.send(message);
//   }

//   private sendInput(input: PlayerInputV2): void {
//     // Store input for reconciliation
//     this.inputBuffer.push({ ...input });

//     // Limit buffer size
//     if (this.inputBuffer.length > SocketSystemV2.INPUT_BUFFER_SIZE) {
//       this.inputBuffer.shift();
//     }

//     // Apply input immediately for prediction
//     this.applyInputLocally(input);

//     // Send to server
//     this.sendMessage(WebSocketEvent.PlayerMove, JSON.stringify(input));
//   }

//   private applyInputLocally(input: PlayerInputV2): void {
//     if (!this.localPlayerId) return;

//     switch (input.type) {
//       case "move":
//         const { targetPosition } = input.data;
//         if (targetPosition) {
//           // Calculate movement direction and apply velocity
//           const direction = this.getDirection(this.localPlayerPosition, targetPosition);
//           const speed = 5.0; // Should match server

//           this.localPlayerVelocity.x = direction.x * speed;
//           this.localPlayerVelocity.z = direction.z * speed;
//         }
//         break;

//       case "dash":
//         const { direction } = input.data;
//         if (direction) {
//           const dashSpeed = 12.0; // Should match server
//           this.localPlayerVelocity.x = direction.x * dashSpeed;
//           this.localPlayerVelocity.z = direction.z * dashSpeed;
//         }
//         break;
//     }

//     // Store predicted state
//     this.predictedStates.push({
//       position: { ...this.localPlayerPosition },
//       velocity: { ...this.localPlayerVelocity },
//       timestamp: this.clientTime,
//       sequenceId: input.sequenceId,
//     });

//     // Limit predicted states
//     if (this.predictedStates.length > SocketSystemV2.INPUT_BUFFER_SIZE) {
//       this.predictedStates.shift();
//     }
//   }

//   private handleGameStateChange(state: GameState): void {
//     if (state.targetPosition) {
//       const input: PlayerInputV2 = {
//         type: "move",
//         data: { targetPosition: state.targetPosition },
//         timestamp: this.clientTime,
//         sequenceId: ++this.inputSequence,
//       };

//       this.sendInput(input);
//       GameStore.update("targetPosition", null);
//     }

//     if (state.dashTargetPosition) {
//       const direction = this.getDirection(this.localPlayerPosition, state.dashTargetPosition);

//       const input: PlayerInputV2 = {
//         type: "dash",
//         data: { direction },
//         timestamp: this.clientTime,
//         sequenceId: ++this.inputSequence,
//       };

//       this.sendInput(input);
//       GameStore.update("dashTargetPosition", null);
//     }
//   }

//   private processMessage({ event, payload }: Message): void {
//     switch (event) {
//       case WebSocketEvent.Authentication: {
//         const user = payload;
//         this.localPlayerId = user.id;
//         GameStore.update("user", user);

//         // Join public game V2
//         this.sendMessage(WebSocketEvent.JoinGame, JSON.stringify({ gameId: "public-game-v2" }));
//         break;
//       }

//       case WebSocketEvent.JoinGame: {
//         const sceneEntity = this.queries.renderer.results[0]?.getComponent(WebGLRendererComponent)?.scene!;
//         const scene = sceneEntity.getObject3D<THREE.Scene>()!;

//         const { terrain, players, serverTime, tickRate } = payload as ServerJoinGame;
//         this.serverTime = serverTime;
//         this.timeOffset = this.clientTime - serverTime;

//         console.log(`Connected to game - Tick Rate: ${tickRate}Hz`);

//         // Create terrain
//         const terrainPoints = terrain.points.map((point: any) => new THREE.Vector2(point.x, point.y));
//         const terrainMesh = GameUtils.createTerrain(terrainPoints, SocketSystemV2.TERRAIN_POSITION);
//         this.world.createEntity().addObject3DComponent(terrainMesh, sceneEntity).addComponent(TerrainComponent);

//         // Create players
//         for (const [id, player] of Object.entries(players)) {
//           this.gltfLoader.load("/models/basic_male.glb", (model) => {
//             model.scene.scale.set(1, 1, 1);
//             model.scene.position.set(player.position.x, player.position.y, player.position.z);
//             model.scene.castShadow = true;

//             // Initialize local player position
//             if (id === this.localPlayerId) {
//               this.localPlayerPosition = { ...player.position };
//               this.localPlayerVelocity = { x: 0, y: 0, z: 0 };
//             }

//             this.createPlayerEntity({ scene, model, id, player, noAnimation: true });
//           });
//         }

//         break;
//       }

//       case WebSocketEvent.PlayerJoin: {
//         const { playerId, player } = payload;
//         console.log(`Player ${playerId} joined the game`);

//         // Load and create new player
//         this.gltfLoader.load("/models/basic_male.glb", (model) => {
//           const sceneEntity = this.queries.renderer.results[0]?.getComponent(WebGLRendererComponent)?.scene!;
//           const scene = sceneEntity.getObject3D<THREE.Scene>()!;

//           model.scene.scale.set(1, 1, 1);
//           model.scene.position.set(player.position.x, player.position.y, player.position.z);
//           model.scene.castShadow = true;

//           this.createPlayerEntity({ scene, model, id: playerId, player, noAnimation: true });
//         });
//         break;
//       }

//       case WebSocketEvent.GameStateUpdate: {
//         const updateData = payload as GameStateUpdateV2;
//         this.handleServerUpdate(updateData);
//         break;
//       }

//       case WebSocketEvent.PlayerLeave: {
//         const { playerId } = payload;
//         console.log(`Player ${playerId} left the game`);

//         // Remove player entity
//         const playerEntity = this.queries.players.results.find(
//           (entity) => entity.getComponent(PlayerComponent)?.id === playerId,
//         );

//         if (playerEntity) {
//           playerEntity.remove();
//         }
//         break;
//       }

//       default:
//         console.warn("Unknown/Unhandled V2 message event:", event);
//     }
//   }

//   private handleServerUpdate(updateData: GameStateUpdateV2): void {
//     this.serverTime = updateData.gameTime;
//     this.lastServerUpdate = this.clientTime;

//     // Handle combat events
//     // if (updateData.events) {
//     //   this.processCombatEvents(updateData.events);
//     // }

//     // Update player states with reconciliation
//     for (const [playerId, serverState] of Object.entries(updateData.players)) {
//       // if (playerId === this.localPlayerId) {
//       //   this.reconcileLocalPlayer(serverState);
//       // } else {
//       //   this.updateRemotePlayer(playerId, serverState);
//       // }
//       this.updateRemotePlayer(playerId, serverState);
//     }
//   }

//   private reconcileLocalPlayer(serverState: ServerPlayerState): void {
//     if (!this.localPlayerId) return;

//     // Calculate position difference
//     const positionDiff = this.getDistance(this.localPlayerPosition, serverState.position);

//     // If difference is significant, reconcile
//     if (positionDiff > SocketSystemV2.RECONCILIATION_THRESHOLD) {
//       console.log(`Reconciling position - Diff: ${positionDiff.toFixed(2)}`);

//       // Set position to server state
//       this.localPlayerPosition = { ...serverState.position };
//       this.localPlayerVelocity = { ...serverState.velocity };

//       // Re-apply inputs that happened after server timestamp
//       const serverTimestamp = serverState.timestamp;
//       const inputsToReapply = this.inputBuffer.filter((input) => input.timestamp > serverTimestamp);

//       for (const input of inputsToReapply) {
//         this.applyInputLocally(input);
//       }
//     }

//     // Update health and combat state
//     this.updateLocalPlayerUI(serverState);
//   }

//   private updateRemotePlayer(playerId: string, serverState: ServerPlayerState): void {
//     const playerEntity = this.queries.players.results.find(
//       (entity) => entity.getComponent(PlayerComponent)?.id === playerId,
//     );

//     if (playerEntity) {
//       const mesh = playerEntity.getObject3D<THREE.Mesh>();
//       const movementComponent = playerEntity.getMutableComponent(MovementComponent);

//       if (mesh && movementComponent) {
//         // Smooth interpolation to server position
//         const targetPosition = new THREE.Vector3(
//           serverState.position.x,
//           serverState.position.y,
//           serverState.position.z,
//         );

//         movementComponent.targetPosition = targetPosition;
//         movementComponent.isMoving = true;

//         // Update combat visual effects
//         this.updatePlayerCombatVisuals(playerId, serverState.combat);
//       }
//     }
//   }

//   private processCombatEvents(events: CombatEvent[]): void {
//     for (const event of events) {
//       switch (event.type) {
//         case "damage":
//           this.showDamageEffect(event);
//           break;
//         case "heal":
//           this.showHealEffect(event);
//           break;
//         case "death":
//           this.showDeathEffect(event);
//           break;
//         case "ability":
//           this.showAbilityEffect(event);
//           break;
//       }
//     }
//   }

//   private showDamageEffect(event: CombatEvent): void {
//     console.log(`Damage dealt: ${event.value} from ${event.sourceId} to ${event.targetId}`);
//     // TODO: Implement visual damage effects
//   }

//   private showHealEffect(event: CombatEvent): void {
//     console.log(`Heal: ${event.value} to ${event.targetId}`);
//     // TODO: Implement visual heal effects
//   }

//   private showDeathEffect(event: CombatEvent): void {
//     console.log(`Player ${event.targetId} died`);
//     // TODO: Implement death effects
//   }

//   private showAbilityEffect(event: CombatEvent): void {
//     console.log(`Ability used by ${event.sourceId}`);
//     // TODO: Implement ability effects
//   }

//   private updateLocalPlayerUI(serverState: ServerPlayerState): void {
//     // Update health bar, combat indicators, etc.
//     const healthPercent = (serverState.combat.health / serverState.combat.maxHealth) * 100;
//     console.log(`Health: ${healthPercent.toFixed(1)}%`);

//     // TODO: Update actual UI elements
//   }

//   private updatePlayerCombatVisuals(playerId: string, combatState: any): void {
//     // Update player visual effects based on combat state
//     if (combatState.isInCombat) {
//       // Add combat indicator
//       console.log(`Player ${playerId} is in combat`);
//     }

//     // TODO: Implement visual combat indicators
//   }

//   private cleanupOldData(): void {
//     const cutoffTime = this.clientTime - SocketSystemV2.MAX_PREDICTION_TIME;

//     // Clean up old inputs
//     this.inputBuffer = this.inputBuffer.filter((input) => input.timestamp > cutoffTime);

//     // Clean up old predicted states
//     this.predictedStates = this.predictedStates.filter((state) => state.timestamp > cutoffTime);
//   }

//   private createPlayerEntity(config: {
//     id: string;
//     scene: THREE.Scene;
//     model: any;
//     player: Player;
//     noAnimation?: boolean;
//   }): void {
//     const playerEntity = this.world.createEntity();
//     playerEntity.addObject3DComponent(config.model.scene);
//     playerEntity.addComponent(PlayerComponent, { username: config.player.username, id: config.id });
//     playerEntity.addComponent(MovementComponent, {
//       speed: Constants.PLAYER_SPEED,
//       isMoving: false,
//       targetPosition: null,
//       isDashing: false,
//       dashDirection: null,
//       dashTimer: 0,
//     });

//     if (!config.noAnimation && config.model.animations && config.model.animations.length > 0) {
//       const mixer = new THREE.AnimationMixer(config.model.scene);
//       const animations = GameUtils.setupPlayerAnimations(mixer, config.model.animations);

//       playerEntity.addComponent(PlayerAnimationComponent, {
//         ...animations,
//         mixer,
//         currentAction: GameAnimationAction.Idle,
//       });

//       animations.idle.play();
//     }

//     config.scene.add(config.model.scene);

//     // Store mapping for quick lookup
//     const currentMappedPlayers = GameStore.getState().mappedPlayers;
//     GameStore.update("mappedPlayers", {
//       ...currentMappedPlayers,
//       [config.id]: playerEntity.id,
//     });

//     // Set the camera target to client player
//     if (config.id === GameStore.getState().user?.id) {
//       GameStore.update("cameraTarget", playerEntity);
//     }
//   }

//   // Utility functions
//   private getDistance(pos1: Vector3, pos2: Vector3): number {
//     const dx = pos2.x - pos1.x;
//     const dy = pos2.y - pos1.y;
//     const dz = pos2.z - pos1.z;
//     return Math.sqrt(dx * dx + dy * dy + dz * dz);
//   }

//   private getDirection(from: Vector3, to: Vector3): Vector3 {
//     const distance = this.getDistance(from, to);
//     if (distance === 0) return { x: 0, y: 0, z: 0 };

//     return {
//       x: (to.x - from.x) / distance,
//       y: (to.y - from.y) / distance,
//       z: (to.z - from.z) / distance,
//     };
//   }
// }
