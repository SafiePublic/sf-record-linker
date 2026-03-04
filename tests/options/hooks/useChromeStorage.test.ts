// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/preact";
import { useChromeStorage } from "../../../src/options/hooks/useChromeStorage";

const changeListeners: Array<(changes: Record<string, { newValue: unknown }>) => void> = [];

const chromeMock = {
  storage: {
    sync: {
      get: vi.fn((_defaults: unknown, cb: (result: Record<string, unknown>) => void) => {
        cb({ objectSettings: { "商品": { enabled: true, mode: "simple", fieldLabel: "商品コード", showLabel: true, format: "", alias: "" } } });
      }),
      set: vi.fn((_data: unknown, cb: () => void) => {
        cb();
      }),
    },
    onChanged: {
      addListener: vi.fn((fn: (changes: Record<string, { newValue: unknown }>) => void) => {
        changeListeners.push(fn);
      }),
      removeListener: vi.fn(),
    },
  },
};

Object.defineProperty(globalThis, "chrome", { value: chromeMock, writable: true });

beforeEach(() => {
  vi.clearAllMocks();
  changeListeners.length = 0;
});

describe("useChromeStorage", () => {
  it("loads initial settings from chrome.storage.sync", () => {
    const { result } = renderHook(() => useChromeStorage());
    const [settings] = result.current;
    expect(settings).toHaveProperty("商品");
    expect(chromeMock.storage.sync.get).toHaveBeenCalledOnce();
  });

  it("saves settings to chrome.storage.sync", async () => {
    const { result } = renderHook(() => useChromeStorage());
    const [, save] = result.current;

    await act(async () => {
      await save({ "取引先": { enabled: true, mode: "simple", fieldLabel: "取引先名", showLabel: true, format: "", alias: "" } });
    });

    expect(chromeMock.storage.sync.set).toHaveBeenCalledWith(
      { objectSettings: { "取引先": { enabled: true, mode: "simple", fieldLabel: "取引先名", showLabel: true, format: "", alias: "" } } },
      expect.any(Function),
    );
  });

  it("registers onChanged listener", () => {
    renderHook(() => useChromeStorage());
    expect(chromeMock.storage.onChanged.addListener).toHaveBeenCalledOnce();
  });

  it("updates settings when onChanged fires", () => {
    const { result } = renderHook(() => useChromeStorage());

    act(() => {
      changeListeners[0]({
        objectSettings: {
          newValue: { "新オブジェクト": { enabled: true, mode: "custom", fieldLabel: "", showLabel: false, format: "${name}", alias: "" } },
        },
      });
    });

    const [settings] = result.current;
    expect(settings).toHaveProperty("新オブジェクト");
  });

  it("removes listener on unmount", () => {
    const { unmount } = renderHook(() => useChromeStorage());
    unmount();
    expect(chromeMock.storage.onChanged.removeListener).toHaveBeenCalledOnce();
  });
});
