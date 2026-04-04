type Listener<T> = (state: T) => void;

export class StoreManager<T extends object> {
  private state: T;
  private listeners: Set<Listener<T>>;
  private notifyEnabled: boolean;

  constructor(initialState: T, enableNotify = true) {
    this.state = initialState;
    this.listeners = new Set();
    this.notifyEnabled = enableNotify;
  }

  public getState(): T {
    return this.state;
  }

  public setState(newState: Partial<T>): void {
    this.state = { ...this.state, ...newState };
    if (this.notifyEnabled) {
      this.notify();
    }
  }

  public subscribe(listener: Listener<T>): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public update<K extends keyof T>(key: K, value: T[K]): void {
    this.setState({ [key]: value } as unknown as Partial<T>);
  }

  public reset(initialState: T): void {
    this.state = initialState;
    if (this.notifyEnabled) {
      this.notify();
    }
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }
}
