// public/app.js
console.log('app.js loaded');

const form      = document.getElementById('slotForm');
const container = document.getElementById('slotsContainer');

flatpickr('#from', { enableTime: true, dateFormat: 'Y-m-d H:i' });
flatpickr('#to',   { enableTime: true, dateFormat: 'Y-m-d H:i' });


form.addEventListener('submit', async e => {
  e.preventDefault();
  console.log('Form submitted');

  const data   = new FormData(form);
  const params = new URLSearchParams();

  // Build query params, normalizing the datetime-local inputs
  for (const [k, v] of data) {
    if ((k === 'from' || k === 'to') && v) {
      // v looks like "2025-05-23T09:00" → turn into full ISO
      params.append(k, `${v}:00Z`);
    } else {
      params.append(k, v);
    }
  }

  // Show loading state
  container.innerHTML = '<p>Loading…</p>';

  try {
    const res = await fetch(`/slots?${params.toString()}`);
    if (!res.ok) throw new Error(await res.text());

    const { common } = await res.json();

    // Clear and render results
    container.innerHTML = '';
    if (!common.length) {
      container.textContent = 'No common free slots found.';
    } else {
      const ul = document.createElement('ul');
      ul.classList.add('slot-list');
      common.forEach(slot => {
        const li    = document.createElement('li');
        const start = new Date(slot.start).toLocaleString();
        const end   = new Date(slot.end)  .toLocaleString();
        li.textContent = `${start} — ${end}`;
        ul.appendChild(li);
      });
      container.appendChild(ul);
    }
  } catch (err) {
    console.error(err);
    container.textContent = 'Error: ' + err.message;
  }
});
