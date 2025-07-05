// global.js - Core site-wide scripts for A&J Personal Collections

document.addEventListener('DOMContentLoaded', () => {
  // Accordion toggle handler (supports multiple accordions by class)
  const accordionHeaders = document.querySelectorAll('.how-to-use-header');

  accordionHeaders.forEach(header => {
    const contentId = header.getAttribute('aria-controls');
    const content = document.getElementById(contentId);

    // Ensure content starts hidden if aria-expanded is false or missing
    if (header.getAttribute('aria-expanded') !== 'true') {
      content.setAttribute('aria-hidden', 'true');
      content.style.display = 'none';
    }

    function toggleAccordion() {
      const isExpanded = header.getAttribute('aria-expanded') === 'true';

      header.setAttribute('aria-expanded', String(!isExpanded));
      content.setAttribute('aria-hidden', String(isExpanded));

      content.style.display = isExpanded ? 'none' : 'block';
    }

    header.addEventListener('click', toggleAccordion);

    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleAccordion();
      }
    });
  });

  // Back to Top button logic
  const backToTopBtn = document.getElementById("backToTopBtn");
  if (backToTopBtn) {
    // Show/hide button on scroll
    window.addEventListener('scroll', () => {
      if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        backToTopBtn.style.display = "block";
      } else {
        backToTopBtn.style.display = "none";
      }
    });

    // Smooth scroll to top on click
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
});

// Make addProductAndRedirect globally available
function addProductAndRedirect(productName) {
  sessionStorage.setItem('preselectedProduct', productName);
  window.location.href = 'health-beauty.html#orderForm';
}
window.addProductAndRedirect = addProductAndRedirect;
