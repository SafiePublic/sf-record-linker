import { useReducer, useEffect, useState } from "preact/hooks";
import type { CardState, ObjectSettings, GlobalSettings, ValidationError } from "../lib/types";
import { DEFAULT_GLOBAL_SETTINGS } from "../lib/types";
import { validateCards } from "../lib/validation";
import { useChromeStorage } from "./hooks/useChromeStorage";
import { useToast } from "./hooks/useToast";
import { ObjectCard } from "./components/ObjectCard";
import { Toggle } from "./components/Toggle";
import { Toast } from "./components/Toast";

type Action =
  | { type: "load"; cards: CardState[] }
  | { type: "add" }
  | { type: "remove"; id: string }
  | { type: "update"; card: CardState }
  | { type: "setErrors"; errors: ValidationError[]; duplicateObjectNames: string[] };

interface State {
  cards: CardState[];
  errors: ValidationError[];
  duplicateObjectNames: string[];
}

let nextId = 1;

function createCard(overrides: Partial<CardState> = {}): CardState {
  return {
    id: String(nextId++),
    objectName: "",
    mode: "simple",
    fieldLabel: "",
    showLabel: true,
    format: "",
    ...overrides,
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "load":
      return { cards: action.cards, errors: [], duplicateObjectNames: [] };
    case "add":
      return { ...state, cards: [...state.cards, createCard()], errors: [], duplicateObjectNames: [] };
    case "remove":
      return { ...state, cards: state.cards.filter((c) => c.id !== action.id), errors: [], duplicateObjectNames: [] };
    case "update":
      return {
        ...state,
        cards: state.cards.map((c) => (c.id === action.card.id ? action.card : c)),
        errors: state.errors.filter((e) => e.cardId !== action.card.id),
      };
    case "setErrors":
      return { ...state, errors: action.errors, duplicateObjectNames: action.duplicateObjectNames };
  }
}

export function App() {
  const [storedSettings, storedGlobalSettings, saveSettings] = useChromeStorage();
  const [toastMessage, toastVisible, showToast] = useToast();
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    ...DEFAULT_GLOBAL_SETTINGS,
  });
  const [state, dispatch] = useReducer(reducer, {
    cards: [],
    errors: [],
    duplicateObjectNames: [],
  });

  useEffect(() => {
    setGlobalSettings(storedGlobalSettings);
  }, [storedGlobalSettings]);

  useEffect(() => {
    const entries = Object.entries(storedSettings);
    if (entries.length === 0 && state.cards.length > 0) return;
    if (entries.length === 0) return;

    const cards = entries
      .filter(([, val]) => val.enabled)
      .map(([key, val]) =>
        createCard({
          objectName: key,
          mode: val.mode ?? "simple",
          fieldLabel: val.fieldLabel,
          showLabel: val.showLabel,
          format: val.format,
        }),
      );
    dispatch({ type: "load", cards });
  }, [storedSettings]);

  const handleSave = async () => {
    const result = validateCards(state.cards);
    if (!result.valid) {
      dispatch({
        type: "setErrors",
        errors: result.errors,
        duplicateObjectNames: result.duplicateObjectNames,
      });

      if (result.duplicateObjectNames.length > 0) {
        showToast("オブジェクト名が重複しています");
      } else {
        showToast("入力内容を確認してください");
      }
      return;
    }

    const objectSettings: ObjectSettings = {};
    for (const card of state.cards) {
      objectSettings[card.objectName.trim()] = {
        enabled: true,
        mode: card.mode,
        fieldLabel: card.fieldLabel.trim(),
        showLabel: card.showLabel,
        format: card.format.trim(),
      };
    }

    await saveSettings(objectSettings, globalSettings);
    showToast("設定を保存しました");
  };

  const errorsForCard = (id: string) =>
    state.errors.filter((e) => e.cardId === id);

  return (
    <>
      <div class="page-header">
        <div class="page-header-row">
          <h1>SF Record Linker 設定</h1>
          <button class="btn-save" onClick={handleSave}>
            保存
          </button>
        </div>
        <p>オブジェクトごとにリンクテキストに含める項目を設定します。</p>
      </div>

      <div class="global-settings">
        <div class="global-settings-heading">全体設定</div>
        <Toggle
          label="レコード名のみリンクにする"
          checked={globalSettings.linkNameOnly}
          onChange={(linkNameOnly) =>
            setGlobalSettings((prev) => ({ ...prev, linkNameOnly }))
          }
        />
        <Toggle
          label="複数タブ時に箇条書きでコピー"
          checked={globalSettings.bulletList}
          onChange={(bulletList) =>
            setGlobalSettings((prev) => ({ ...prev, bulletList }))
          }
        />
        {globalSettings.bulletList && (
          <>
            <div class="segment-control" style={{ marginTop: '-4px' }}>
              <button
                class={`segment-btn ${globalSettings.bulletStyle === 'ul' ? 'active' : ''}`}
                onClick={() => setGlobalSettings((prev) => ({ ...prev, bulletStyle: 'ul' as const }))}
              >
                &lt;ul&gt; 形式
              </button>
              <button
                class={`segment-btn ${globalSettings.bulletStyle === 'custom' ? 'active' : ''}`}
                onClick={() => setGlobalSettings((prev) => ({ ...prev, bulletStyle: 'custom' as const }))}
              >
                任意文字列
              </button>
            </div>
            {globalSettings.bulletStyle === 'custom' && (
              <div class="field-group" style={{ marginBottom: '16px' }}>
                <label>接頭文字</label>
                <input
                  class="input-field"
                  style={{ width: '80px' }}
                  value={globalSettings.bulletChar}
                  onInput={(e) =>
                    setGlobalSettings((prev) => ({
                      ...prev,
                      bulletChar: (e.target as HTMLInputElement).value,
                    }))
                  }
                />
              </div>
            )}
          </>
        )}
      </div>

      <div id="cards">
        {state.cards.map((card) => (
          <ObjectCard
            key={card.id}
            card={card}
            errors={errorsForCard(card.id)}
            linkNameOnly={globalSettings.linkNameOnly}
            onChange={(updated) => dispatch({ type: "update", card: updated })}
            onRemove={() => dispatch({ type: "remove", id: card.id })}
          />
        ))}
      </div>

      <button class="btn-add" onClick={() => dispatch({ type: "add" })}>
        + オブジェクトを追加
      </button>

      <Toast message={toastMessage} visible={toastVisible} />
    </>
  );
}
