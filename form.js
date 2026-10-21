// Demonstrate native validation without transmitting or storing form entries.
const form = document.querySelector('form');
if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    document.querySelector('.form-status').textContent =
      'Your entries passed the browser checks. This demonstration has not sent or saved an inquiry.';
  });
}
