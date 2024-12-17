// dotenv を読み込む
require('dotenv').config();

// 必要なモジュールを読み込む
const express = require('express');
const https = require('https');
const path = require('path');
const { Translate } = require('@google-cloud/translate').v2; // Google Translationライブラリ

// Express アプリケーションを初期化
const app = express();

// Google APIキーの環境変数が正しく読み込まれているかを確認
console.log("GOOGLE_API_KEY:", process.env.GOOGLE_API_KEY);
console.log("GOOGLE_TRANSLATION_API_KEY:", process.env.GOOGLE_TRANSLATION_API_KEY);

// Google Cloud Translation API テスト
(async () => {
  try {
    const translateTest = new Translate({ key: process.env.GOOGLE_TRANSLATION_API_KEY });
    const [translation] = await translateTest.translate("Hello, world!", "ja");
    console.log("Translation test result:", translation); // 翻訳テスト結果を表示
  } catch (error) {
    console.error("Google Translation API Test Error:", error); // エラー詳細を表示
  }
})();

// Google Cloud Translationクライアントを初期化
const GOOGLE_TRANSLATION_API_KEY = process.env.GOOGLE_TRANSLATION_API_KEY;
const translate = new Translate({ key: GOOGLE_TRANSLATION_API_KEY });

// 静的ファイルを提供 (public フォルダを使用)
app.use(express.static(path.join(__dirname, 'public')));

// JSONのリクエストボディを解析
app.use(express.json());

// 施設検索エンドポイント
app.post('/search', (req, res) => {
  const { keyword, lat, lng } = req.body;

  if (!keyword || !lat || !lng) {
    return res.status(400).send('必要なパラメータが不足しています。');
  }

  const placesApiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=3000&keyword=${encodeURIComponent(keyword)}&language=ja&key=${process.env.GOOGLE_API_KEY}`;

  https.get(placesApiUrl, (placesRes) => {
    let placesData = '';
    placesRes.on('data', (chunk) => (placesData += chunk));
    placesRes.on('end', () => {
      const placesJson = JSON.parse(placesData);
      if (!placesJson.results || placesJson.results.length === 0) {
        return res.json([]);
      }

      const placesPromises = placesJson.results.map((place) => {
        return new Promise((resolve) => {
          const directionsApiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${lat},${lng}&destination=${place.geometry.location.lat},${place.geometry.location.lng}&mode=walking&key=${process.env.GOOGLE_API_KEY}`;
          https.get(directionsApiUrl, (directionsRes) => {
            let directionsData = '';
            directionsRes.on('data', (chunk) => (directionsData += chunk));
            directionsRes.on('end', () => {
              const directionsJson = JSON.parse(directionsData);
              const distanceText = directionsJson.routes[0]?.legs[0]?.distance?.text || '不明';
              const distanceValue = directionsJson.routes[0]?.legs[0]?.distance?.value || Infinity;
              resolve({
                name: place.name || '名称不明',
                address: place.vicinity || '住所不明',
                rating: place.rating || '評価なし',
                distanceText,
                distanceValue,
                userRatingsTotal: place.user_ratings_total || 0,
                mapLink: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
              });
            });
          });
        });
      });

      Promise.all(placesPromises).then((results) => {
        const filteredResults = results
          .filter((place) => place.distanceValue <= 3000)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 10);
        res.json(filteredResults);
      });
    });
  });
});

// 施設詳細エンドポイント
app.get('/place-details', (req, res) => {
  const placeId = req.query.place_id;

  if (!placeId) {
    return res.status(400).json({ error: 'place_id パラメータが必要です。' });
  }

  // Google Places API の URL を作成
  const apiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${process.env.GOOGLE_API_KEY}`;

  // APIリクエスト
  https.get(apiUrl, (apiRes) => {
    let data = '';

    // データを受信
    apiRes.on('data', (chunk) => {
      data += chunk;
    });

    // データ受信完了時
    apiRes.on('end', () => {
      const parsedData = JSON.parse(data);

      if (parsedData.result) {
        const placeDetails = {
          name: parsedData.result.name,
          address: parsedData.result.formatted_address,
          rating: parsedData.result.rating,
          distance: "2.3km", // 仮データ
          reviews: parsedData.result.reviews
            ? parsedData.result.reviews.map((review) => ({
                author_name: review.author_name,
                text: review.text,
              }))
            : [],
        };

        res.status(200).json(placeDetails);
      } else {
        res.status(500).json({ error: 'データ取得に失敗しました。' });
      }
    });
  }).on('error', (err) => {
    res.status(500).json({ error: 'APIリクエストエラー: ' + err.message });
  });
});

// 翻訳エンドポイント
app.post('/translate', async (req, res) => {
  const { text, targetLanguage } = req.body;

  if (!text || !targetLanguage) {
    return res.status(400).send("テキストと対象言語が必要です。");
  }

  try {
    const [translation] = await translate.translate(text, targetLanguage); // 翻訳実行
    res.json({ translatedText: translation }); // 翻訳結果を返す
  } catch (error) {
    console.error("Error during translation:", error.message);
    res.status(500).json({
      error: "翻訳中にエラーが発生しました。",
      details: error.message,
    });
  }
});

// サーバーを起動
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
