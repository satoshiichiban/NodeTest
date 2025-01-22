// 現在地を取得する関数
function getCurrentPosition(successCallback, errorCallback) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
  } else {
    alert("このブラウザは位置情報を取得できません。");
  }
}

// 検索機能のための関数
function search() {
  console.log("検索ボタンがクリックされました");

  // 検索フォームの入力値を取得
  const keyword = document.getElementById("keyword").value;
  const radius = document.getElementById("radius").value;

  if (!keyword) {
    alert("キーワードを入力してください");
    return;
  }

  console.log(`入力されたキーワード: ${keyword}`);
  console.log(`選択された半径: ${radius}m`);

  // 現在地を取得
  getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      console.log(`取得した現在地: 緯度=${lat}, 経度=${lng}`);

      // サーバーにリクエストを送信
      fetch("/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keyword: keyword,
          radius: parseInt(radius),
          lat: lat, // 現在地の緯度
          lng: lng, // 現在地の経度
        }),
      })
        .then((response) => {
          console.log("サーバーからのレスポンス:", response);
          return response.json();
        })
        .then((data) => {
          console.log("取得した検索結果データ:", data);
          displayResults(data);
        })
        .catch((error) => {
          console.error("検索中にエラーが発生しました:", error);
          const resultsDiv = document.getElementById("results");
          if (resultsDiv) {
            resultsDiv.innerHTML =
              "<p>検索中にエラーが発生しました。再試行してください。</p>";
          }
        });
    },
    (error) => {
      console.error("現在地の取得に失敗しました:", error);
      alert("現在地の取得に失敗しました。デフォルトの位置で検索を実行します。");

      // デフォルト座標（鹿児島市中央区の仮の座標）で検索を実行
      const lat = 31.596553;
      const lng = 130.557116;
      console.log(`デフォルト位置を使用: 緯度=${lat}, 経度=${lng}`);

      // サーバーにリクエストを送信
      fetch("/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keyword: keyword,
          radius: parseInt(radius),
          lat: lat, // 仮の緯度
          lng: lng, // 仮の経度
        }),
      })
        .then((response) => {
          console.log("サーバーからのレスポンス:", response);
          return response.json();
        })
        .then((data) => {
          console.log("取得した検索結果データ:", data);
          displayResults(data);
        })
        .catch((error) => {
          console.error("検索中にエラーが発生しました:", error);
          const resultsDiv = document.getElementById("results");
          if (resultsDiv) {
            resultsDiv.innerHTML =
              "<p>検索中にエラーが発生しました。再試行してください。</p>";
          }
        });
    }
  );
}

// 検索結果を表示する関数
function displayResults(data) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (!data || data.length === 0) {
    resultsDiv.innerHTML = "<p>該当する施設が見つかりませんでした。</p>";
    return;
  }

  data.forEach((place) => {
    const card = document.createElement("div");
    card.className = "card";

    const distanceInfo =
      place.distanceText === "不明" || place.distanceText === "取得エラー"
        ? "距離情報が取得できませんでした"
        : place.distanceText;

    card.innerHTML = `
            <h3>${place.name}</h3>
            <p>住所: ${place.address}</p>
            <p>距離: ${distanceInfo}</p>
            <p>評価: ${place.rating}</p>
            <p>口コミ数: ${place.userRatingsTotal}</p>
            <a href="${place.mapLink}" target="_blank">Googleマップで見る</a>
            <button class="details-btn" onclick="showDetails('${place.placeId}')">詳細を見る</button>
        `;
    resultsDiv.appendChild(card);
  });
}
