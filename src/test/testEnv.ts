import { vi } from "vitest";

type MediaQueryChangeListener =
  | EventListenerOrEventListenerObject
  | ((event: MediaQueryListEvent) => void);

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
    if (typeof listener === "function") {
      listener(event);
    } else {
      listener.handleEvent(event);
    }
  }
}

export function resetTestBrowserState() {
  setDesktopViewport(false);
  mediaListeners.clear();
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
    return localStorageState.get(String(key)) ?? null;
  },
  key(index: number) {
    return Array.from(localStorageState.keys())[index] ?? null;
  },
  removeItem(key: string) {
    localStorageState.delete(String(key));
  },
  setItem(key: string, value: string) {
    localStorageState.set(String(key), String(value));
  },
};

Object.defineProperty(window, "matchMedia", {
  configurable: true,
  writable: true,
  value: vi.fn((query: string): MediaQueryList => ({
    matches: mediaMatches,
    media: query,
    onchange: null,
    addEventListener: (type: string, listener: MediaQueryChangeListener | null) => {
      if (type === "change" && listener) {
        mediaListeners.add(listener);
      }
    },
    removeEventListener: (type: string, listener: MediaQueryChangeListener | null) => {
      if (type === "change" && listener) {
        mediaListeners.delete(listener);
      }
    },
    addListener: (listener: ((event: MediaQueryListEvent) => void) | null) => {
      if (listener) {
        mediaListeners.add(listener);
      }
    },
    removeListener: (listener: ((event: MediaQueryListEvent) => void) | null) => {
      if (listener) {
        mediaListeners.delete(listener);
      }
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
