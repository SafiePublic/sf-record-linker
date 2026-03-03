# SF Record Linker

Salesforce Lightning レコードページ用 Chrome 拡張機能。レコードへのリンクをワンクリックでクリップボードにコピーする。

## プロジェクト構成

```
sf-record-linker/
├── manifest.json              # Chrome Extension Manifest V3
├── content.js                 # Content Script（DOM操作・UI挿入）
├── lib/
│   └── link-formatter.js      # リンク生成ロジック（フォーマット分離）
├── options.html               # 設定画面（Phase 2）
├── options.js                 # 設定画面ロジック（Phase 2）
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── .gitignore
```

## 技術スタック

- Chrome Extension Manifest V3
- Content Script（Salesforce Lightning ページで動作）
- Clipboard API (`navigator.clipboard.write()`) — text/html + text/plain 両方をセット
- MutationObserver — SPA ページ遷移検知・再挿入
- chrome.storage.sync — 設定保存（Phase 2以降）

## 開発ルール

- 個人利用ツールのためテストフレームワークは不使用
- `chrome://extensions/` →「パッケージ化されていない拡張機能を読み込む」で動作確認
- レコード名の DOM セレクタはユーザー提供の HTML サンプルで確定する（暫定セレクタで実装開始）

## フェーズ構成

- **Phase 1**: 基本機能（レコード名検出、コピーアイコン、クリップボード）
- **Phase 2**: 拡張形式（オブジェクトごとの項目追加、設定画面）
- **Phase 3**: カスタムフォーマット（テンプレート変数、複数項目、プレビュー）

## 実装計画

詳細な実装計画: `~/.claude/projects/-Users-s-kikuchi-GitHub-sf-record-linker/memory/implementation-plan.md`
