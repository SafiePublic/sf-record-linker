import type { CardState, ValidationError } from "../../lib/types";
import { SegmentControl } from "./SegmentControl";
import { Toggle } from "./Toggle";
import { Preview } from "./Preview";

interface ObjectCardProps {
  card: CardState;
  errors: ValidationError[];
  linkNameOnly: boolean;
  showObjectName: boolean;
  onChange: (card: CardState) => void;
  onRemove: () => void;
}

export function ObjectCard({ card, errors, linkNameOnly, showObjectName, onChange, onRemove }: ObjectCardProps) {
  const hasError = errors.length > 0;
  const fieldError = (field: ValidationError["field"]) =>
    errors.some((e) => e.field === field);

  const update = (partial: Partial<CardState>) => {
    onChange({ ...card, ...partial });
  };

  return (
    <div class={`card${hasError ? " error" : ""}`}>
      <div class="card-header">
        <span class="card-header-label">オブジェクトごとの拡張設定</span>
        <button class="btn-remove" onClick={onRemove}>
          削除
        </button>
      </div>

      <div class="field-group">
        <label>オブジェクト名</label>
        <input
          type="text"
          class={`input-field${fieldError("objectName") ? " error" : ""}`}
          value={card.objectName}
          placeholder="例: 商品"
          onInput={(e) => update({ objectName: (e.target as HTMLInputElement).value })}
        />
      </div>

      <SegmentControl mode={card.mode} onChange={(mode) => update({ mode })} />

      <div class={`mode-section${card.mode === "simple" ? " visible" : ""}`}>
        <div class="field-group">
          <label>項目ラベル名</label>
          <input
            type="text"
            class={`input-field${fieldError("fieldLabel") ? " error" : ""}`}
            value={card.fieldLabel}
            placeholder="例: 商品コード"
            onInput={(e) => update({ fieldLabel: (e.target as HTMLInputElement).value })}
          />
        </div>

        <Toggle
          label="項目ラベル名を出力する"
          checked={card.showLabel}
          onChange={(showLabel) => update({ showLabel })}
        />
      </div>

      <div class={`mode-section${card.mode === "custom" ? " visible" : ""}`}>
        <div class="field-group">
          <label>フォーマット</label>
          <input
            type="text"
            class={`input-field${fieldError("format") ? " error" : ""}`}
            value={card.format}
            placeholder="例: ${name}(${商品コード})"
            onInput={(e) => update({ format: (e.target as HTMLInputElement).value })}
          />
          <div class="help-text">
            <code>{"${name}"}</code> レコード名 / <code>{"${object}"}</code> オブジェクト名
            <br />
            <code>{"${項目ラベル名}"}</code> で任意の項目値を参照できます
          </div>
        </div>
      </div>

      <Preview card={card} linkNameOnly={linkNameOnly} showObjectName={showObjectName} />
    </div>
  );
}
