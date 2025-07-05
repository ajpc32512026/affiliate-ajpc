(function () {
  const bodyClass = document.body.className;

  // 🔒 Exit warning logic for checkout
  if (bodyClass.includes('lockdown-checkout')) {
    const form = document.querySelector('form');
    let formSubmitted = false;

    if (form) {
      form.addEventListener('submit', () => {
        formSubmitted = true;
        window.onbeforeunload = null;
      });

      window.onbeforeunload = () => {
        return formSubmitted ? undefined : 'No information will be saved if you leave this page now.';
      };

      window.addEventListener('keydown', (e) => {
        if (e.key === 'F5' || (e.ctrlKey && e.key.toLowerCase() === 'r')) {
          e.preventDefault();
        }
      });
    }
  }

  // 📝 Exit warning logic for feedback/contact forms
  if (bodyClass.includes('lockdown-feedback')) {
    const form = document.querySelector('form');
    let formTouched = false;

    if (form) {
      form.addEventListener('input', () => {
        formTouched = true;
      });

      form.addEventListener('submit', () => {
        formTouched = false;
        window.onbeforeunload = null;
      });

      window.onbeforeunload = () => {
        return formTouched ? 'No information will be saved if you leave this page now.' : undefined;
      };

      window.addEventListener('keydown', (e) => {
        if (e.key === 'F5' || (e.ctrlKey && e.key.toLowerCase() === 'r')) {
          e.preventDefault();
        }
      });
    }
  }

  // 🧑‍💼 Hard lockdown pages – disable refresh, unloads, and right-click
  const hardLockClasses = [
    'lockdown-admin',
    'lockdown-success',
    'lockdown-thank-order',
    'lockdown-thank-paid',
    'lockdown-receipt'
  ];

  if (hardLockClasses.some(cls => bodyClass.includes(cls))) {
    // Block F5 and Ctrl+R
    window.addEventListener('keydown', (e) => {
      if (e.key === 'F5' || (e.ctrlKey && e.key.toLowerCase() === 'r')) {
        e.preventDefault();
      }
    });

    // Disable context menu
    window.addEventListener('contextmenu', (e) => e.preventDefault());

    // No unload prompt
    window.onbeforeunload = null;
  }
})();
