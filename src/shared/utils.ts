import { GameStore } from "@root/shared/stores";
import { UIConsole } from "@ui/console";
import { version } from "../../package.json";

import {
  SETTING_SANDBOX_MAIN_CANVAS_ID,
  UI_CONSOLE_TAG_NAME,
  UI_OBJECT_CONTEXT_MENU_TAG_NAME,
} from "@shared/constants";

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

export function removeOrAppendConsole(): void {
  const collection = document.getElementsByTagName(UI_CONSOLE_TAG_NAME);
  const existing = collection[0];
  if (existing instanceof UIConsole) {
    existing.close();
  } else {
    const console = document.createElement(UI_CONSOLE_TAG_NAME);
    document.body.appendChild(console);
  }
}

export function removeObjectContextMenuIfPresent(): void {
  const collection = document.getElementsByTagName(UI_OBJECT_CONTEXT_MENU_TAG_NAME);
  if (collection.length) {
    for (const element of collection) {
      element.remove();
    }
  }
}
