import { Component, Types } from 'ecsy';

export class PlayerComponent extends Component<PlayerComponent> {
  id!: string;
  username!: string;
  static schema = {
    id: { type: Types.String },
    username: { type: Types.String },
  };
}
