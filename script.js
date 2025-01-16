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

// 現在地を取得する関数
function getCurrentPosition(successCallback, errorCallback) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
  } else {
    alert("このブラウザは位置情報を取得できません。");
  }
}

// 検索機能の実行関数
function search() {
  console.log("検索ボタンがクリックされました");
  const keyword = document.getElementById("keyword").value;
  const radius = document.getElementById("radius").value;

  if (!keyword) {
    alert("キーワードを入力してください。");
    return;
  }

  getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      fetch("/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keyword,
          radius: parseInt(radius),
          lat,
          lng,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("サーバーからのレスポンスが正しくありません");
          }
          return response.json();
        })
        .then((data) => {
          console.log("取得した検索結果データ:", data);
          displayResults(data);
        })
        .catch((error) => {
          console.error("検索中にエラーが発生しました:", error);
          const resultsDiv = document.getElementById("results");
          resultsDiv.innerHTML =
            "<p>検索に失敗しました。再試行してください。</p>";
        });
    },
    (error) => {
      console.error("現在地の取得に失敗しました:", error);
      alert("現在地を取得できませんでした。位置情報を有効にしてください。");
    }
  );
}

// 詳細情報を表示する関数
function showDetails(placeId) {
  console.log("詳細を見るボタンがクリックされました:", placeId);

  fetch(`/place-details?place_id=${placeId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("詳細APIリクエストが失敗しました");
      }
      return response.json();
    })
    .then((data) => {
      console.log("サーバーから取得した詳細情報:", data);

      if (!data || !data.result) {
        console.error("詳細データが不完全です:", data);
        alert("詳細データの取得に失敗しました。");
        return;
      }

      const resultsDiv = document.getElementById("results");
      if (!resultsDiv) {
        console.error(
          "resultsDiv が見つかりません。HTMLに <div id='results'></div> を追加してください。"
        );
        return;
      }

      const reviewsHTML = data.result.reviews?.length
        ? data.result.reviews
            .map(
              (review) =>
                `<li><strong>${review.author_name}</strong>: ${review.text}</li>`
            )
            .join("")
        : "<li>レビューがありません。</li>";

      resultsDiv.innerHTML = `
          <h2>${data.result.name}</h2>
          <p>住所: ${data.result.formatted_address}</p>
          <p>距離: ${data.result.distance || "不明"}</p>
          <p>評価: ${data.result.rating || "評価なし"}</p>
          <h3>口コミ</h3>
          <ul class="reviews">${reviewsHTML}</ul>
          <button class="back-btn" onclick="location.reload()">検索に戻る</button>
        `;
    })
    .catch((error) => {
      console.error("詳細取得中にエラーが発生しました:", error);
      const resultsDiv = document.getElementById("results");
      if (resultsDiv) {
        resultsDiv.innerHTML =
          "<p>詳細情報の取得に失敗しました。再試行してください。</p>";
      }
    });
}
