// dotenv を読み込む
require('dotenv').config();

// 必要なモジュールを読み込む
const express = require('express');
const { Translate } = require('@google-cloud/translate').v2; // Google Translationライブラリ

// Express アプリケーションを初期化
const app = express();
app.use(express.json()); // JSON形式のリクエストを受け取る設定

// 静的ファイルを提供する設定を追加
app.use(express.static('public'));

// Google Cloud Translation クライアントを初期化
const GOOGLE_TRANSLATION_API_KEY = process.env.GOOGLE_TRANSLATION_API_KEY;

// APIキーが正しく読み込まれているかを確認
console.log("GOOGLE_TRANSLATION_API_KEY:", GOOGLE_TRANSLATION_API_KEY);
const translate = new Translate({ key: GOOGLE_TRANSLATION_API_KEY });

// 翻訳エンドポイント
app.post('/translate', async (req, res) => {
  const { text, targetLanguage } = req.body;

  if (!text || !targetLanguage) {
    return res.status(400).send("テキストと対象言語が必要です。");
  }

  try {
    const [translation] = await translate.translate(text, targetLanguage);
    res.json({ translatedText: translation });
  } catch (error) {
    console.error("Error during translation:", error.message);
    res.status(500).json({ error: "翻訳中にエラーが発生しました。" });
  }
});

// デフォルトルート（"/"）
app.get('/', (req, res) => {
  res.send("Welcome to the Translation API! 🚀");
});

// サーバー起動
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
