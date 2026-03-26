# Chrome ウェブストア公開手順ガイド

## 1. デベロッパーアカウント登録

- https://chrome.google.com/webstore/devconsole にアクセス
- 初回は $5 の登録料が必要
- Google アカウントでログイン

## 2. 申請前に準備するもの

### 必須素材

| 素材 | ファイル | 状態 |
|------|---------|------|
| ZIP パッケージ | `npm run package` → `sf-record-linker.zip` | ✅ 準備済み |
| アイコン 128x128 | `icons/icon128.png` | ✅ 準備済み |
| スクリーンショット（1枚以上） | `docs/screenshots/` | ⚠️ オプション画面のみ。**コピー動作のスクリーンショットを追加推奨** |
| プライバシーポリシー URL | `docs/privacy-policy.html` | ⚠️ ファイル作成済み。GitHub Pages 等で公開が必要 |
| ストア掲載テキスト | `docs/store-listing.md` | ✅ 準備済み |

### 推奨素材

| 素材 | サイズ | 状態 |
|------|-------|------|
| プロモーション画像（小） | 440x280 PNG | 未作成 |
| プロモーション画像（大） | 920x680 PNG | 未作成 |

### スクリーンショット仕様

- 最小 1280x800 または 640x400
- 最大 5枚
- PNG または JPEG
- 推奨内容:
  1. Salesforce レコードページでアイコンクリック → コピー成功バッジ表示
  2. コピーしたリンクをメール等に貼り付けた結果
  3. オプション画面（既存: `store-screenshot-options.png`）

## 3. プライバシーポリシーの公開

`docs/privacy-policy.html` を公開する。方法はいずれか:

### 方法A: GitHub Pages

```bash
# リポジトリの Settings → Pages → Source: main / docs
# 公開後の URL 例:
# https://<username>.github.io/sf-record-linker/privacy-policy.html
```

### 方法B: GitHub の raw URL

リポジトリが public なら raw URL をそのまま使える（ただし HTML レンダリングされない）。

→ **GitHub Pages（方法A）を推奨**

## 4. デベロッパーダッシュボードでの申請手順

### Step 1: パッケージアップロード

1. https://chrome.google.com/webstore/devconsole を開く
2. 「新しいアイテム」をクリック
3. `sf-record-linker.zip` をアップロード

### Step 2: ストアの掲載情報

`docs/store-listing.md` の内容をコピーして入力:

| フィールド | 入力内容 |
|-----------|---------|
| 名前 | SF Record Linker |
| 概要 | `store-listing.md` の「概要」セクション |
| 詳細説明 | `store-listing.md` の「詳細説明」セクション |
| カテゴリ | 仕事効率化（Productivity） |
| 言語 | 日本語（デフォルト）、English |
| スクリーンショット | `docs/screenshots/` 内の画像をアップロード |

### Step 3: プライバシーへの取り組み

| フィールド | 入力内容 |
|-----------|---------|
| シングルパーパス | Salesforce Lightning レコードページのリンクをクリップボードにコピーする |
| 権限の正当性 | 下記参照 |
| プライバシーポリシー URL | GitHub Pages の URL |
| データの使用 | 「ユーザーのデータを収集または使用しない」にチェック |

**権限の正当性（審査フォーム記入用）:**

> This extension uses the following permissions:
>
> - **clipboardWrite**: Required to copy generated hyperlinks to the user's clipboard.
> - **storage**: Required to save and sync user-configured copy format settings across devices.
> - **declarativeContent**: Required to enable the extension icon only on Salesforce Lightning record pages (*.lightning.force.com).
>
> The extension does not collect, transmit, or store any personal data. All processing occurs entirely within the user's browser.

### Step 4: 配布設定

| フィールド | 設定 |
|-----------|------|
| 公開設定 | 公開（一般公開）または 限定公開 |
| 対象地域 | すべての地域 |

### Step 5: 審査に提出

「審査のために提出」ボタンをクリック。通常 1〜3 営業日で審査完了。

## 5. 審査後のバージョン更新手順

1. `manifest.json` と `package.json` の `version` を更新
2. `npm run package` で新しい ZIP を作成
3. デベロッパーダッシュボードで「パッケージを更新」→ 新しい ZIP をアップロード
4. 必要に応じてストア掲載情報を更新
5. 「審査のために提出」

## チェックリスト

- [ ] デベロッパーアカウント登録済み
- [ ] コピー動作のスクリーンショットを追加
- [ ] プライバシーポリシーを GitHub Pages で公開
- [ ] `npm run package` で ZIP 作成
- [ ] ストア掲載情報を入力
- [ ] プライバシー情報を入力
- [ ] 審査に提出
