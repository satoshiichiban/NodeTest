// dotenv を読み込む（必ず最初に記述）
require('dotenv').config();

const express = require('express');
const app = express();

// 環境変数を取得
const PASSWORD = process.env.PASSWORD;
const API_KEY = process.env.API_KEY;
const ENVIRONMENT = process.env.ENVIRONMENT;

// 既存のルート
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// 新しい認証用エンドポイント
app.get('/login', (req, res) => {
    const userPassword = req.query.password;

    if (userPassword !== PASSWORD) {
        return res.status(403).send('Invalid Password');
    }

    res.send(`Welcome to the ${ENVIRONMENT} environment!`);
});

// 新しいAPIキー確認用エンドポイント
app.get('/api', (req, res) => {
    res.send(`API Key is: ${API_KEY}`);
});

// サーバー起動（重複しないように注意）
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
