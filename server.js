const http = require("http");
const fs = require("fs");
const path = require("path");
const https = require("https");

const PORT = 3000;
const API_KEY = "AIzaSyBGzR8gVSIykeDsWump7hkbvZNplTwLUZQ"; // Google Places APIのAPIキーをここに設定
const placeId = "ChIJCewJkL2LGGAR3Qmk0vCTGkg"; // 東京タワーのPlace ID

// サーバー作成
const server = http.createServer((req, res) => {
  if (req.url === "/" || req.url === "/index.html") {
    // `index.html` を返す処理
    const filePath = path.join(__dirname, "index.html");
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Internal Server Error");
      } else {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(data);
      }
    });
  } else if (req.url === "/place-details") {
    // Google Places API を呼び出してデータを取得
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${API_KEY}`;
    https.get(url, (apiRes) => {
      let data = "";
      apiRes.on("data", (chunk) => {
        data += chunk;
      });
      apiRes.on("end", () => {
        // APIのレスポンスをターミナルに出力
        console.log("Google API Raw Response:", data);

        const parsedData = JSON.parse(data);

        if (parsedData.result) {
          // APIレスポンスが正しい場合、クライアントに送信
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(parsedData.result));
        } else {
          // APIレスポンスにエラーがある場合
          console.error("Google API Error:", parsedData);
          res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("Failed to fetch place details");
        }
      });
    }).on("error", (err) => {
      // HTTPSリクエスト自体のエラーを処理
      console.error("HTTPS Request Error:", err);
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Error calling Google Places API");
    });
  } else {
    // 他のURLに対する404エラー
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not Found");
  }
});

// サーバーを起動
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
