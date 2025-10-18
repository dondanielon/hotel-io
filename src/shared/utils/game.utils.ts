import { SettingsConstants } from "../constants/settings.constants";
import { GameStore } from "../stores/game.store";

export class GameUtils {
  static isClickingInMainCanvas(target: EventTarget | null): boolean {
    if (!target) return false;

    const currentGameMode = GameStore.getState().gameMode;
    if (!currentGameMode) return false;

    const targetId = target instanceof HTMLElement ? target.id : null;
    if (!targetId) return false;

    if (currentGameMode === "sandbox" && targetId === SettingsConstants.SandboxMainCanvasId) return true;

    return false;
  }
}
