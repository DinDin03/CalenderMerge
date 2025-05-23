// public/app.js
console.log('app.js loaded');

const form      = document.getElementById('slotForm');
const container = document.getElementById('slotsContainer');
const participantsDiv = document.getElementById('participants');
const addBtn = document.getElementById('addParticipant');

flatpickr('#from', { enableTime: true, dateFormat: 'Y-m-d H:i' });
flatpickr('#to',   { enableTime: true, dateFormat: 'Y-m-d H:i' });

// Add participant email fields dynamically
addBtn.addEventListener('click', e => {
  e.preventDefault();
  const input = document.createElement('input');
  input.type = 'email';
  input.name = 'participants';
  input.placeholder = 'Participant email';
  input.required = true;
  input.classList.add('participant-email');
  participantsDiv.appendChild(input);
});

// Fade-in helper
function fadeIn(el) {
  el.style.opacity = 0;
  el.style.display = '';
  let last = +new Date();
  const tick = function() {
    el.style.opacity = +el.style.opacity + (new Date() - last) / 400;
    last = +new Date();
    if (+el.style.opacity < 1) {
      requestAnimationFrame(tick);
    }
  };
  tick();
}

// Loading spinner
function showSpinner() {
  container.innerHTML = `<div class="spinner"></div>`;
}

// Click-to-copy helper
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('Slot copied to clipboard!');
  });
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  showSpinner();

  const data   = new FormData(form);
  const params = new URLSearchParams();

  for (const [k, v] of data) {
    if ((k === 'from' || k === 'to') && v) {
      params.append(k, `${v}:00Z`);
    } else {
      params.append(k, v);
    }
  }

  try {
    const res = await fetch(`/slots?${params.toString()}`);
    if (!res.ok) throw new Error(await res.text());

    const { common } = await res.json();

    container.innerHTML = '';
    if (!common.length) {
      const msg = document.createElement('div');
      msg.textContent = 'No common free slots found.';
      msg.className = 'fade-in';
      container.appendChild(msg);
      fadeIn(msg);
    } else {
      const ul = document.createElement('ul');
      ul.classList.add('slot-list');
      common.forEach(slot => {
        const li    = document.createElement('li');
        const start = new Date(slot.start).toLocaleString();
        const end   = new Date(slot.end)  .toLocaleString();
        li.textContent = `${start} — ${end}`;
        li.title = 'Click to copy';
        li.style.cursor = 'pointer';
        li.onclick = () => copyToClipboard(`${start} — ${end}`);
        ul.appendChild(li);
      });
      container.appendChild(ul);
      fadeIn(ul);
    }
  } catch (err) {
    console.error(err);
    const msg = document.createElement('div');
    msg.textContent = 'Error: ' + err.message;
    msg.className = 'fade-in error';
    container.appendChild(msg);
    fadeIn(msg);
  }
});
