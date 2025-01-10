// 検索結果を表示
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

      const distanceInfo = place.distanceText === "不明" || place.distanceText === "取得エラー"
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

// 詳細情報を表示する関数
function showDetails(placeId) {
  console.log("詳細を見るボタンがクリックされました");
  console.log("取得したplaceId:", placeId);

  fetch(`/place-details?place_id=${placeId}`)
      .then(response => {
          console.log("詳細APIリクエストが成功しました:", response);
          return response.json();
      })
      .then(data => {
          console.log("サーバーから取得した詳細情報:", data);

          if (!data.name || !data.address) {
              console.error("詳細データが不完全です:", data);
              alert("詳細情報の取得に失敗しました。");
              return;
          }

          const resultsDiv = document.getElementById("results");
          if (!resultsDiv) {
              console.error("resultsDiv が見つかりません。HTMLに <div id='results'></div> を追加してください。");
              return;
          }

          console.log("詳細情報を画面に反映します:", data);

          const reviewsHTML = data.reviews?.length
              ? data.reviews.map(review => `<li><strong>${review.author_name}</strong>: ${review.text}</li>`).join("")
              : "<li>レビューがありません。</li>";

          resultsDiv.innerHTML = `
              <h2>${data.name}</h2>
              <p>住所: ${data.address}</p>
              <p>距離: ${data.distance}</p>
              <p>評価: ${data.rating}</p>
              <h3>口コミ:</h3>
              <ul class="reviews">${reviewsHTML}</ul>
              <button class="back-btn" onclick="location.reload()">検索に戻る</button>
          `;
      })
      .catch(error => {
          console.error("詳細取得中にエラーが発生しました:", error);
          const resultsDiv = document.getElementById("results");
          if (resultsDiv) {
              resultsDiv.innerHTML = `<p>詳細情報の取得に失敗しました。再試行してください。</p>`;
          }
      });
}
