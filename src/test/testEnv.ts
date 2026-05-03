import { vi } from "vitest";

type MediaQueryChangeListener = (event: MediaQueryListEvent) => void;

let mediaMatches = false;
const mediaListeners = new Set<MediaQueryChangeListener>();
const localStorageState = new Map<string, string>();

export function setDesktopViewport(isDesktop: boolean) {
  mediaMatches = isDesktop;

  const event = {
    matches: mediaMatches,
    media: "(min-width: 768px)",
  } as MediaQueryListEvent;

  for (const listener of mediaListeners) {
    listener(event);
  }
}

export function resetTestBrowserState() {
  setDesktopViewport(false);
  localStorageState.clear();
}

class ResizeObserverMock implements ResizeObserver {
  disconnect() {}

  observe() {}

  unobserve() {}
}

const localStorageMock: Storage = {
  get length() {
    return localStorageState.size;
  },
  clear() {
    localStorageState.clear();
  },
  getItem(key: string) {
    return localStorageState.get(key) ?? null;
  },
  key(index: number) {
    return Array.from(localStorageState.keys())[index] ?? null;
  },
  removeItem(key: string) {
    localStorageState.delete(key);
  },
  setItem(key: string, value: string) {
    localStorageState.set(key, value);
  },
};

Object.defineProperty(window, "matchMedia", {
  configurable: true,
  writable: true,
  value: vi.fn((query: string): MediaQueryList => ({
    matches: mediaMatches,
    media: query,
    onchange: null,
    addEventListener: (_type: "change", listener: MediaQueryChangeListener) => {
      mediaListeners.add(listener);
    },
    removeEventListener: (_type: "change", listener: MediaQueryChangeListener) => {
      mediaListeners.delete(listener);
    },
    addListener: (listener: MediaQueryChangeListener) => {
      mediaListeners.add(listener);
    },
    removeListener: (listener: MediaQueryChangeListener) => {
      mediaListeners.delete(listener);
    },
    dispatchEvent: () => true,
  })),
});

Object.defineProperty(window.HTMLElement.prototype, "scrollIntoView", {
  configurable: true,
  value: vi.fn(),
});

Object.defineProperty(window, "localStorage", {
  configurable: true,
  value: localStorageMock,
});

vi.stubGlobal("ResizeObserver", ResizeObserverMock);
