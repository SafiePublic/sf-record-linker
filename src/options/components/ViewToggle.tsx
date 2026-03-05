export type ViewMode = "card" | "list";

interface ViewToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewToggle({ mode, onChange }: ViewToggleProps) {
  return (
    <div class="view-toggle">
      <button
        type="button"
        class={`view-toggle-btn${mode === "card" ? " active" : ""}`}
        onClick={() => onChange("card")}
      >
        カード
      </button>
      <button
        type="button"
        class={`view-toggle-btn${mode === "list" ? " active" : ""}`}
        onClick={() => onChange("list")}
      >
        リスト
      </button>
    </div>
  );
}
