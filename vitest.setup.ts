import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { resetTestBrowserState } from "@/src/test/testEnv";

afterEach(() => {
  cleanup();
  resetTestBrowserState();
  vi.useRealTimers();
});
