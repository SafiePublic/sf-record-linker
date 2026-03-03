/**
 * リンク生成ロジック
 * Phase 1: formatBasicLink — レコード名 + URL のシンプルなリンク
 * Phase 2: formatExtendedLink — オブジェクト項目値付きリンク（予定）
 * Phase 3: formatCustomLink — テンプレートベースのカスタムリンク（予定）
 */

function formatBasicLink(recordName, url) {
  const escaped = escapeHtml(recordName);
  return {
    html: `<a href="${url}">${escaped}</a>`,
    plain: recordName,
  };
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
