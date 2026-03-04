import type { CardState } from "../../lib/types";

function computePreviewParts(card: CardState, linkNameOnly: boolean): { before: string; linked: string; after: string } {
  const objectName = card.objectName.trim() || "オブジェクト名";

  if (card.mode === "custom") {
    const format = card.format.trim();
    if (!format) return { before: "", linked: "レコード名", after: "" };

    const expanded = format.replace(/\$\{([^}]+)\}/g, (match, key: string) => {
      if (key === "name") return match; // ${name} はそのまま
      if (key === "object") return objectName;
      return `[${key}]`;
    });

    if (linkNameOnly && expanded.includes("${name}")) {
      const idx = expanded.indexOf("${name}");
      return {
        before: expanded.slice(0, idx),
        linked: "レコード名",
        after: expanded.slice(idx + "${name}".length),
      };
    }

    // linkNameOnly=false or ${name} なし → 全体
    const full = expanded.replace(/\$\{name\}/g, "レコード名");
    return { before: "", linked: full, after: "" };
  }

  // simple mode
  const label = card.fieldLabel.trim() || "ラベル";
  const suffix = card.showLabel ? `(${label}:値)` : "(値)";

  if (linkNameOnly) {
    return { before: "", linked: "レコード名", after: suffix };
  }
  return { before: "", linked: `レコード名${suffix}`, after: "" };
}

interface PreviewProps {
  card: CardState;
  linkNameOnly: boolean;
}

export function Preview({ card, linkNameOnly }: PreviewProps) {
  const { before, linked, after } = computePreviewParts(card, linkNameOnly);
  return (
    <div class="preview">
      <div class="preview-heading">プレビュー</div>
      <div class="preview-text">
        {before && <span>{before}</span>}
        <u>{linked}</u>
        {after && <span>{after}</span>}
      </div>
    </div>
  );
}
