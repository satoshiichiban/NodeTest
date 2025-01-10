// dotenv を読み込む
require('dotenv').config();

// 必要なモジュールを読み込む
const express = require('express');
const https = require('https');
const path = require('path');

// Express アプリケーションを初期化
const app = express();

// Google APIキーを環境変数から取得
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// 静的ファイルを提供 (public フォルダを使用)
app.use(express.static(path.join(__dirname, 'public')));

// JSONのリクエストボディを解析
app.use(express.json());

// 施設検索エンドポイント
app.post('/search', (req, res) => {
  const { keyword, lat, lng, radius = 3000, limit = 10 } = req.body; // デフォルト値を設定

  if (!keyword || !lat || !lng) {
    return res.status(400).send('必要なパラメータが不足しています。');
  }

  const placesApiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${encodeURIComponent(keyword)}&language=ja&key=${GOOGLE_API_KEY}`;

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
          const directionsApiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${lat},${lng}&destination=${place.geometry.location.lat},${place.geometry.location.lng}&mode=walking&key=${GOOGLE_API_KEY}`;
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
          }).on('error', (err) => {
            console.error("Directions APIエラー:", err);
            resolve({
              name: place.name || '名称不明',
              address: place.vicinity || '住所不明',
              rating: place.rating || '評価なし',
              distanceText: '取得エラー',
              distanceValue: Infinity,
              userRatingsTotal: place.user_ratings_total || 0,
              mapLink: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
            });
          });
        });
      });

      Promise.all(placesPromises).then((results) => {
        const filteredResults = results
          .filter((place) => place.distanceValue <= radius) // 半径で絞り込み
          .sort((a, b) => b.rating - a.rating) // 評価順
          .slice(0, limit); // 件数制限
        res.json(filteredResults);
      });
    });
  });
});

// サーバーを起動
const PORT = 3000; // ポート番号を指定
app.listen(PORT, () => {
  console.log(`Server is starting on port ${PORT}`); // サーバー起動時の確認ログ
  console.log(`Server is running at http://localhost:${PORT}`); // アクセスURLも表示
});
