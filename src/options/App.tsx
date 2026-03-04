import { useReducer, useEffect } from "preact/hooks";
import type { CardState, ObjectSettings, ValidationError } from "../lib/types";
import { validateCards } from "../lib/validation";
import { useChromeStorage } from "./hooks/useChromeStorage";
import { useToast } from "./hooks/useToast";
import { ObjectCard } from "./components/ObjectCard";
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
    alias: "",
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
  const [storedSettings, saveSettings] = useChromeStorage();
  const [toastMessage, toastVisible, showToast] = useToast();
  const [state, dispatch] = useReducer(reducer, {
    cards: [],
    errors: [],
    duplicateObjectNames: [],
  });

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
          alias: val.alias,
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
        alias: card.alias.trim(),
      };
    }

    await saveSettings(objectSettings);
    showToast("設定を保存しました");
  };

  const errorsForCard = (id: string) =>
    state.errors.filter((e) => e.cardId === id);

  return (
    <>
      <div class="page-header">
        <h1>SF Record Linker 設定</h1>
        <p>オブジェクトごとにリンクテキストに含める項目を設定します。</p>
      </div>

      <div id="cards">
        {state.cards.map((card) => (
          <ObjectCard
            key={card.id}
            card={card}
            errors={errorsForCard(card.id)}
            onChange={(updated) => dispatch({ type: "update", card: updated })}
            onRemove={() => dispatch({ type: "remove", id: card.id })}
          />
        ))}
      </div>

      <button class="btn-add" onClick={() => dispatch({ type: "add" })}>
        + オブジェクトを追加
      </button>

      <div class="footer-actions">
        <button class="btn-save" onClick={handleSave}>
          保存
        </button>
      </div>

      <Toast message={toastMessage} visible={toastVisible} />
    </>
  );
}
