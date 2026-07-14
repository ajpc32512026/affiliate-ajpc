// global.js - Consolidated core site-wide scripts

document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Accordion Toggle Handler (With strict safety checks to prevent crashes)
  const accordionHeaders = document.querySelectorAll('.how-to-use-header');

  accordionHeaders.forEach(header => {
    const contentId = header.getAttribute('aria-controls');
    if (!contentId) return; // Safely skip if no control ID is specified

    const content = document.getElementById(contentId);
    if (!content) return; // Safely skip if target element is missing on this page

    // Ensure content starts hidden if aria-expanded is false or missing
    if (header.getAttribute('aria-expanded') !== 'true') {
      content.setAttribute('aria-hidden', 'true');
      content.style.display = 'none';
    }

    const toggleAccordion = () => {
      const isExpanded = header.getAttribute('aria-expanded') === 'true';
      header.setAttribute('aria-expanded', String(!isExpanded));
      content.setAttribute('aria-hidden', String(isExpanded));
      content.style.display = isExpanded ? 'none' : 'block';
    };

    header.addEventListener('click', toggleAccordion);

    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleAccordion();
      }
    });
  });

  // 2. Back to Top Button Logic
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