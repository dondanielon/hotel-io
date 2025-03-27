import { System } from 'ecsy';
import { WebSocketEvent } from '@root/enums/network.enums';
import { GameState, GameStore } from '@root/stores/game.store';

type Message = { event: WebSocketEvent; payload: any };

export class NetworkSystem extends System {
  private socket!: WebSocket;
  private messageQueue!: Message[];

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

    // TODO: Validate event and payload

    return { event, payload };
  }

  private listener(state: GameState) {
    if (state.requestGameList) {
      this.sendMessage(WebSocketEvent.GamesList, '');
      GameStore.update('requestGameList', false);
    }
  }

  private processMessage(message: Message) {
    switch (message.event) {
      case WebSocketEvent.Authentication:
        break;
      case WebSocketEvent.GamesList: {
        break;
      }
      case WebSocketEvent.JoinGame: {
        break;
      }
      case WebSocketEvent.GameStateUpdate: {
        break;
      }
    }
  }
}
