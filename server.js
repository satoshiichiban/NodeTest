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

            const results = placesJson.results.map((place) => ({
                name: place.name || '名称不明',
                address: place.vicinity || '住所不明',
                rating: place.rating || '評価なし',
                userRatingsTotal: place.user_ratings_total || 0,
                mapLink: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
            }));

            res.json(results);
        });
    }).on('error', (err) => {
        console.error("APIリクエストエラー:", err.message);
        res.status(500).send('施設データの取得に失敗しました。');
    });
});

// サーバーを起動
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
