document.addEventListener("DOMContentLoaded", () => {
  const demoBtn = document.querySelector(".demo-btn");
  const iframeWrapper = document.querySelector(".iframe-wrapper");
  const iframe = document.getElementById("gameIframe");
  const closeBtn = document.getElementById("closeIframeBtn");

  if (demoBtn && iframe && closeBtn && iframeWrapper) {
    demoBtn.addEventListener("click", (event) => {
      event.preventDefault();

      const gameUrl = demoBtn.dataset.gameUrl;

      iframe.src = gameUrl;

      iframe.style.display = "block";
      closeBtn.style.display = "flex";

      iframeWrapper.classList.add("active"); // 🔥 ВКЛЮЧАЕМ КЛИКИ
    });

    closeBtn.addEventListener("click", () => {
      iframe.src = "";
      iframe.style.display = "none";
      closeBtn.style.display = "none";

      iframeWrapper.classList.remove("active"); // 🔥 ВЫКЛЮЧАЕМ
    });
  }
});
