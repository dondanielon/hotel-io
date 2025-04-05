import Ammo from 'ammojs-typed';
import { Game } from './game';
import { UserService } from './services/user.service';

async function bootstrap() {
  // Initialize Ammo.js
  await Ammo.bind(Ammo)(Ammo);
  new Game();
  window.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'z') {
      UserService.login('admin@tyenet.com', 'Secure1');
    }
  });
}

bootstrap();
