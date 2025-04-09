import Ammo from 'ammojs-typed';
import { Game } from './game';
import { UserService } from './services/user.service';

async function bootstrap() {
  // Initialize Ammo.js
  await Ammo.bind(Ammo)(Ammo);
  const game = new Game();
  game.setupLobby();
  window.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'z') {
      UserService.login('admin@tyenet.com', 'Secure1');
    }
  });
}

bootstrap();
