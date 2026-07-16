// global.js - Consolidated core site-wide scripts

document.addEventListener('DOMContentLoaded', () => {

  // Subscribe Banner Dismiss Logic
  const subscribeBanner = document.getElementById('subscribe-banner');
  const dismissBannerBtn = document.getElementById('dismiss-banner-btn');
  if (subscribeBanner && dismissBannerBtn) {
    if (localStorage.getItem('subscribeBannerDismissed') === 'true') {
      subscribeBanner.style.display = 'none';
    }

    dismissBannerBtn.addEventListener('click', () => {
      subscribeBanner.style.display = 'none';
      localStorage.setItem('subscribeBannerDismissed', 'true');
    });
  }

  // Back to Top Button Logic
  const backToTopBtn = document.getElementById("backToTopBtn");
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        backToTopBtn.style.display = "block";
      } else {
        backToTopBtn.style.display = "none";
      }
    });

    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
});
