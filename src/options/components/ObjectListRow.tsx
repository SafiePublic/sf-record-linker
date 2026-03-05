import type { CardState, ValidationError } from "../../lib/types";
import { ObjectForm } from "./ObjectForm";

interface ObjectListRowProps {
  card: CardState;
  errors: ValidationError[];
  linkNameOnly: boolean;
  showObjectName: boolean;
  expanded: boolean;
  onChange: (card: CardState) => void;
  onRemove: () => void;
  onToggle: () => void;
}

function modeBadgeLabel(mode: CardState["mode"]): string {
  return mode === "simple" ? "簡易" : "カスタム";
}

function configSummary(card: CardState): string {
  if (card.mode === "simple") {
    return card.fieldLabel.trim() || "—";
  }
  return card.format.trim() || "—";
}

export function ObjectListRow({
  card,
  errors,
  linkNameOnly,
  showObjectName,
  expanded,
  onChange,
  onRemove,
  onToggle,
}: ObjectListRowProps) {
  const hasError = errors.length > 0;

  return (
    <div class={`list-row${hasError ? " error" : ""}`}>
      <div class="list-row-summary" onClick={onToggle}>
        <span class="list-row-chevron">{expanded ? "▼" : "▶"}</span>
        <span class="list-row-name">{card.objectName.trim() || "（未設定）"}</span>
        <span class="mode-badge">{modeBadgeLabel(card.mode)}</span>
        <span class="list-row-config">{configSummary(card)}</span>
        <button
          class="btn-remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          削除
        </button>
      </div>

      {expanded && (
        <div class="list-row-detail">
          <ObjectForm
            card={card}
            errors={errors}
            linkNameOnly={linkNameOnly}
            showObjectName={showObjectName}
            onChange={onChange}
          />
        </div>
      )}
    </div>
  );
}
