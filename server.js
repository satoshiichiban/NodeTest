// dotenv を読み込む
require('dotenv').config();
const express = require('express');
const https = require('https');
const path = require('path');

const app = express();
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// 静的ファイルを提供 (index.html を含むフォルダ)
app.use(express.static(path.join(__dirname, 'public')));

// JSONのリクエストボディを解析
app.use(express.json());

// 施設検索エンドポイント
app.post('/search', (req, res) => {
  const { keyword, lat, lng } = req.body;

  if (!keyword || !lat || !lng) {
    return res.status(400).send('必要なパラメータが不足しています。');
  }

  const placesApiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=3000&keyword=${encodeURIComponent(keyword)}&language=ja&key=${GOOGLE_API_KEY}`;

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

// サーバーを起動
app.listen(3000, () => {
  console.log('Server is running at http://localhost:3000');
});
