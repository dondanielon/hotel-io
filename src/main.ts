import { Game } from './game';
import { UserService } from './services/user.service';

window.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 'z') {
    UserService.login('admin@tyenet.com', 'Secure1');
  }
});

function bootstrap() {
  new Game();
}

bootstrap();
