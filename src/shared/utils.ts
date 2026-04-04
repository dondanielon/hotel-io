import { GameStore } from "@root/shared/stores";
import { SETTING_SANDBOX_MAIN_CANVAS_ID } from "@shared/constants";
import { version } from "../../package.json";

export function printInfoMessage(): void {
  console.log(`\x1b[32m
      ██╗  ██╗ ██████╗ ████████╗███████╗██╗      ██╗ ██████╗ 
      ██║  ██║██╔═══██╗╚══██╔══╝██╔════╝██║      ██║██╔═══██╗
      ███████║██║   ██║   ██║   █████╗  ██║      ██║██║   ██║
      ██╔══██║██║   ██║   ██║   ██╔══╝  ██║      ██║██║   ██║
      ██║  ██║╚██████╔╝   ██║   ███████╗███████╗ ██║╚██████╔╝
      ╚═╝  ╚═╝ ╚═════╝    ╚═╝   ╚══════╝╚══════╝ ╚═╝ ╚═════╝ 
                                            Pre-Alpha v${version}
    \x1b[0m`);
}

export function assert<T>(val: T | undefined | null, name: string, logMessage: boolean = false): asserts val is T {
  if (!val) {
    if (logMessage) {
      console.error(`Assertion failed: ${name} is undefined or null`);
    }
    throw new Error(`Assertion failed: ${name} is undefined or null`);
  }
}

export function targetsMainCanvas(target: EventTarget | null): boolean {
  if (!target) return false;

  const currentGameMode = GameStore.getState().gameMode;
  if (!currentGameMode) return false;

  const targetId = target instanceof HTMLElement ? target.id : null;
  if (!targetId) return false;

  if (currentGameMode === "sandbox" && targetId === SETTING_SANDBOX_MAIN_CANVAS_ID) return true;

  return false;
}
