'use strict';

// Program descriptions support both the services selector and the contact form.
const programs = [
  { id: 'volunteer', title: 'Volunteer with our team', description: 'Help with animal care, approved transport, or community events. Beginners are welcome to ask about orientation.', nextStep: 'Tell us which tasks interest you and when you are available.' },
  { id: 'foster', title: 'Explore foster caregiving', description: 'Provide a temporary home and a predictable routine while a pet waits for adoption. Our team discusses supplies and veterinary arrangements before placement.', nextStep: 'Describe your space, existing pets, and the time you can offer.' },
  { id: 'adoption', title: 'Ask about adoption', description: 'Start a conversation about an animal whose care needs fit your household. An inquiry does not reserve an animal.', nextStep: 'Tell us about your household and the companion you hope to adopt.' }
];
const validationRules = [
  { id: 'full-name', label: 'your full name', min: 2, max: 100 },
  { id: 'email', label: 'your email address', min: 1, max: 254, email: true },
  { id: 'interest-type', label: 'an interest type', options: true },
  { id: 'availability', label: 'your availability', min: 5, max: 200 },
  { id: 'experience', label: 'your experience with pets', min: 10, max: 1000 },
  { id: 'message', label: 'a short message', min: 10, max: 1000 }
];
const preferenceKey = 'tcar.preferredProgram.v1';
let storageAvailable = true;

function findProgram(id) { return programs.find(program => program.id === id); }
function readPreference() {
  try { const value = localStorage.getItem(preferenceKey); return findProgram(value) ? value : ''; }
  catch { storageAvailable = false; return ''; }
}
function savePreference(value) {
  try {
    if (findProgram(value)) localStorage.setItem(preferenceKey, value);
    else localStorage.removeItem(preferenceKey);
    storageAvailable = true;
  } catch { storageAvailable = false; }
}
function renderProgram(value) {
  const panel = document.querySelector('#program-details');
  if (!panel) return;
  const program = findProgram(value);
  panel.replaceChildren();
  if (!program) {
    const prompt = document.createElement('p');
    prompt.textContent = 'Choose an interest to see how you can get involved.';
    panel.append(prompt);
    return;
  }
  const heading = document.createElement('h3'); heading.textContent = program.title;
  const description = document.createElement('p'); description.textContent = program.description;
  const nextStep = document.createElement('p'); nextStep.textContent = program.nextStep;
  panel.append(heading, description, nextStep);
  if (!document.querySelector('form')) {
    const link = document.createElement('a'); link.href = 'contact.html';
    link.textContent = 'Continue to the interest form'; panel.append(link);
  }
}
function announcePreference(message) {
  const status = document.querySelector('#preference-status');
  if (status) status.textContent = message;
}
function initializePreference() {
  const select = document.querySelector('#program-choice, #interest-type');
  if (!select) return;
  const stored = readPreference();
  if (stored) select.value = stored;
  renderProgram(select.value);
  if (stored) announcePreference('Remembered your ' + stored + ' interest from your last visit.');
  else if (!storageAvailable) announcePreference('Browser storage is unavailable. You can still choose an interest for this visit.');
  select.addEventListener('change', () => {
    savePreference(select.value); renderProgram(select.value);
    announcePreference(storageAvailable
      ? (select.value ? 'Your interest is saved on this browser. The contact form will remember it.' : 'Your saved interest has been cleared.')
      : 'Your choice works for this visit, but this browser could not save it.');
  });
  document.querySelector('#forget-preference').addEventListener('click', () => {
    savePreference(''); select.value = ''; renderProgram('');
    const submissionStatus = document.querySelector('.form-status');
    if (submissionStatus) submissionStatus.textContent = '';
    announcePreference(storageAvailable ? 'Your saved interest has been cleared.' : 'Your choice was cleared for this visit. Browser storage could not be updated.');
    if (select.getAttribute('aria-invalid') === 'true') validateField(validationRules.find(rule => rule.id === select.id));
  });
}
function fieldError(rule) {
  const field = document.getElementById(rule.id);
  const value = field.value.trim();
  if (!value) return 'Please enter ' + rule.label + (rule.id === 'experience' ? ', or say that you are a beginner.' : '.');
  if (rule.options && !findProgram(value)) return 'Please choose volunteering, fostering, or adoption information.';
  if (rule.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter an email address such as name@example.com.';
  if (rule.min && value.length < rule.min) return 'Please use at least ' + rule.min + ' characters for ' + rule.label + '.';
  if (rule.max && value.length > rule.max) return 'Please use no more than ' + rule.max + ' characters for ' + rule.label + '.';
  return '';
}
function validateField(rule) {
  const field = document.getElementById(rule.id);
  const error = fieldError(rule);
  document.getElementById(rule.id + '-error').textContent = error;
  field.setAttribute('aria-invalid', String(Boolean(error)));
  return !error;
}
function initializeValidation() {
  const form = document.querySelector('form'); if (!form) return;
  // Native required/type/minlength checks remain available if JavaScript fails.
  form.noValidate = true;
  let attempted = false;
  validationRules.forEach(rule => {
    const field = document.getElementById(rule.id);
    const error = document.createElement('span');
    error.id = rule.id + '-error'; error.className = 'field-error'; error.setAttribute('aria-live', 'polite');
    field.insertAdjacentElement('afterend', error);
    const help = field.getAttribute('aria-describedby');
    field.setAttribute('aria-describedby', [help, error.id].filter(Boolean).join(' '));
    field.addEventListener(field.tagName === 'SELECT' ? 'change' : 'input', () => {
      document.querySelector('.form-status').textContent = '';
      if (attempted) validateField(rule);
    });
  });
  form.addEventListener('submit', event => {
    event.preventDefault(); attempted = true;
    const valid = validationRules.map(validateField).every(Boolean);
    const status = document.querySelector('.form-status');
    if (!valid) {
      status.textContent = 'Please correct the marked fields. Your entries have been kept.';
      form.querySelector('[aria-invalid="true"]').focus(); return;
    }
    savePreference(document.getElementById('interest-type').value);
    status.textContent = 'Your entries passed validation. This student website has not sent an inquiry. Only your interest choice is remembered on this browser; contact details and messages are not saved.';
  });
}
initializePreference();
initializeValidation();
