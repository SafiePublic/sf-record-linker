interface SegmentControlProps {
  mode: "simple" | "custom";
  onChange: (mode: "simple" | "custom") => void;
}

export function SegmentControl({ mode, onChange }: SegmentControlProps) {
  return (
    <div class="segment-control">
      <button
        type="button"
        class={`segment-btn${mode === "simple" ? " active" : ""}`}
        onClick={() => onChange("simple")}
      >
        簡易フォーマット
      </button>
      <button
        type="button"
        class={`segment-btn${mode === "custom" ? " active" : ""}`}
        onClick={() => onChange("custom")}
      >
        カスタムフォーマット
      </button>
    </div>
  );
}
