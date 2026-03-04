// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/preact";
import { App } from "../../src/options/App";

// Mock chrome.storage API
const storageMock = {
  objectSettings: {} as Record<string, unknown>,
};

const changeListeners: Array<(changes: Record<string, unknown>) => void> = [];

const chromeMock = {
  storage: {
    sync: {
      get: vi.fn((_defaults: unknown, cb: (result: typeof storageMock) => void) => {
        cb(storageMock);
      }),
      set: vi.fn((_data: unknown, cb: () => void) => {
        cb();
      }),
    },
    onChanged: {
      addListener: vi.fn((fn: (changes: Record<string, unknown>) => void) => {
        changeListeners.push(fn);
      }),
      removeListener: vi.fn(),
    },
  },
};

Object.defineProperty(globalThis, "chrome", { value: chromeMock, writable: true });

function setInputValue(input: HTMLInputElement, value: string) {
  input.value = value;
  fireEvent.input(input);
}

beforeEach(() => {
  vi.clearAllMocks();
  changeListeners.length = 0;
  storageMock.objectSettings = {};
  cleanup();
});

describe("App", () => {
  it("renders the page header", () => {
    render(<App />);
    expect(screen.getByText("SF Record Linker 設定")).toBeTruthy();
    expect(screen.getByText("オブジェクトごとにリンクテキストに含める項目を設定します。")).toBeTruthy();
  });

  it("starts with no cards", () => {
    render(<App />);
    expect(screen.queryAllByText("オブジェクト設定")).toHaveLength(0);
  });

  it("adds a card when clicking the add button", async () => {
    render(<App />);
    fireEvent.click(screen.getByText("+ オブジェクトを追加"));
    expect(screen.getAllByText("オブジェクト設定")).toHaveLength(1);
  });

  it("removes a card when clicking delete", async () => {
    render(<App />);
    fireEvent.click(screen.getByText("+ オブジェクトを追加"));
    expect(screen.getAllByText("オブジェクト設定")).toHaveLength(1);

    fireEvent.click(screen.getByText("削除"));
    expect(screen.queryAllByText("オブジェクト設定")).toHaveLength(0);
  });

  it("shows validation error when saving empty card", async () => {
    render(<App />);
    fireEvent.click(screen.getByText("+ オブジェクトを追加"));
    fireEvent.click(screen.getByText("保存"));

    await waitFor(() => {
      expect(screen.getByText("入力内容を確認してください")).toBeTruthy();
    });
  });

  it("saves valid settings to chrome.storage", async () => {
    render(<App />);
    fireEvent.click(screen.getByText("+ オブジェクトを追加"));

    const inputs = document.querySelectorAll<HTMLInputElement>(".input-field");
    // Per card: objectName=0, fieldLabel=1, format=2
    setInputValue(inputs[0], "商品");
    setInputValue(inputs[1], "商品コード");

    fireEvent.click(screen.getByText("保存"));

    await waitFor(() => {
      expect(chromeMock.storage.sync.set).toHaveBeenCalledWith(
        {
          objectSettings: {
            "商品": {
              enabled: true,
              mode: "simple",
              fieldLabel: "商品コード",
              showLabel: true,
              format: "",
            },
          },
        },
        expect.any(Function),
      );
    });

    await waitFor(() => {
      expect(screen.getByText("設定を保存しました")).toBeTruthy();
    });
  });

  it("loads existing settings from chrome.storage", () => {
    storageMock.objectSettings = {
      "商品": {
        enabled: true,
        mode: "simple",
        fieldLabel: "商品コード",
        showLabel: true,
        format: "",
      },
    };

    render(<App />);

    const objectInput = document.querySelector<HTMLInputElement>(".input-field");
    expect(objectInput?.value).toBe("商品");
  });

  it("shows duplicate error when two cards have same object name", async () => {
    render(<App />);
    fireEvent.click(screen.getByText("+ オブジェクトを追加"));
    fireEvent.click(screen.getByText("+ オブジェクトを追加"));

    // Per card: objectName, fieldLabel, format (3 inputs each)
    // Card 1: 0,1,2 — Card 2: 3,4,5
    const inputs1 = document.querySelectorAll<HTMLInputElement>(".input-field");
    setInputValue(inputs1[0], "商品");
    setInputValue(inputs1[1], "商品コード");

    // Re-query after re-renders
    const inputs2 = document.querySelectorAll<HTMLInputElement>(".input-field");
    setInputValue(inputs2[3], "商品");
    setInputValue(inputs2[4], "カテゴリ");

    fireEvent.click(screen.getByText("保存"));

    await waitFor(() => {
      expect(screen.getByText("オブジェクト名が重複しています")).toBeTruthy();
    });
  });
});
