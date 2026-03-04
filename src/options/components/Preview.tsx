import type { CardState } from "../../lib/types";

function computePreviewText(card: CardState): string {
  const objectName = card.objectName.trim() || "オブジェクト名";

  if (card.mode === "custom") {
    const format = card.format.trim();
    if (!format) return "レコード名";
    return format.replace(/\$\{([^}]+)\}/g, (_, key: string) => {
      if (key === "name") return "レコード名";
      if (key === "object") return objectName;
      return `[${key}]`;
    });
  }

  const label = card.fieldLabel.trim() || "ラベル";
  return card.showLabel ? `レコード名(${label}:値)` : "レコード名(値)";
}

interface PreviewProps {
  card: CardState;
}

export function Preview({ card }: PreviewProps) {
  return (
    <div class="preview">
      <div class="preview-heading">プレビュー</div>
      <div class="preview-text">{computePreviewText(card)}</div>
    </div>
  );
}
