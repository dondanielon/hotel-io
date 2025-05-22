import { Game } from "./game";
import { initAmmo } from "./libs/physics/ammo";
import { UserService } from "./services/user.service";

async function bootstrap() {
  await initAmmo();

  const game = new Game();
  game.setupLobby();
  window.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "z") {
      UserService.login("admin@tyenet.com", "Secure1");
    }
  });
}

bootstrap();
