import { instance, spy } from 'ts-mockito';

export class SmartMockFactory {
  create<T extends object>(defaults: Partial<T> = {}): T {
    const base = Object.assign({}, defaults) as T;
    const spied = spy(base);
    return instance(spied);
  }
}
