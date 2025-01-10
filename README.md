
# NodeTest Project

## プロジェクト概要
<br>
Node.jsを使用して施設検索ツールを作成したプロジェクトです。
<br><br><br>
4つのAPIを活用し、ユーザーが特定のキーワードや条件で施設を検索できる機能を提供します。 <br>
Maps JavaScript API<br>
Geolocation API<br>
Directions API<br>
Places API

---

## ローカルでの実行環境
- URL: `http://localhost:3000`

---

## 主なファイル
- **server.js**: バックエンドロジック。外部API（Google Places API）通信・エラーハンドリング部分。
- **script.js**: フロントエンドロジック。ユーザー入力の処理と検索結果の表示部分。
- **index.html**: ユーザーインターフェース（検索フォームと結果表示のデザイン）。

　　※機密情報は環境変数で管理しています。

---

## 設計方針
- **コードの可読性向上**: フロントエンドとバックエンドを分割、整理しています。
- **機能の追加・修正のしやすさ**: 各ファイルが明確な役割を持つ為、影響範囲を最小化しました。
- **拡張性**: 将来的な機能追加や変更を考慮した構造。
- **レスポンシブデザイン**: スマホ、タブレット、PCなど多様な画面サイズに最適表示で対応。

---

## 主な機能
1. **施設検索**:
   - ユーザーがキーワードと条件（距離、最大件数）を入力し、指定範囲内の施設を検索。
   - 例: 「カフェ」と入力すると、近隣のカフェを一覧表示。
2. **検索結果表示**:
   - 施設名、住所、距離、評価、口コミ数をカード形式で表示。
   - 例: 「スターバックス」「住所: ◯◯」「距離: 1.2km」など。
3. **エラーハンドリング**:
   - キーワード未入力時やAPIエラー時に、適切なエラーメッセージを表示。
---

## 使用方法
1. このリポジトリをクローンします。
  　```bash
git clone <リポジトリURL>
2. 必要な依存関係をインストールします:
   ```bash
   npm install
3.サーバー起動
node server.js
4.ブラウザで以下にアクセス
http://localhost:3000/
