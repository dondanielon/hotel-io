type Listener<T> = (state: T) => void;

export class Store<T extends object> {
  private state: T;
  private listeners: Set<Listener<T>>;

  constructor(initialState: T) {
    this.state = initialState;
    this.listeners = new Set();
  }

  getState(): T {
    return this.state;
  }

  setState(newState: Partial<T>): void {
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  subscribe(listener: Listener<T>): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }

  update<K extends keyof T>(key: K, value: T[K]): void {
    this.setState({ [key]: value } as unknown as Partial<T>);
  }

  reset(initialState: T): void {
    this.state = initialState;
    this.notify();
  }
}
