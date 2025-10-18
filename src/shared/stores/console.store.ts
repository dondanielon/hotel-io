import { Store } from "@root/libs/state-manager";

export interface ConsoleState {
  history: string[];
  isOpen: boolean;
}

export const ConsoleStore = new Store<ConsoleState>({
  history: [],
  isOpen: false,
});

// Enable notify on update
ConsoleStore.notifyOnUpdate = true;
