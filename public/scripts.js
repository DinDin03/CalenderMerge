// public/scripts.js
document.addEventListener('DOMContentLoaded', () => {
  // Initialize flatpickr on the two date inputs
  flatpickr('#from', { enableTime: true, dateFormat: 'Y-m-d H:i' });
  flatpickr('#to',   { enableTime: true, dateFormat: 'Y-m-d H:i' });

  const form      = document.getElementById('slotForm');
  const container = document.getElementById('slotsContainer');

  form.onsubmit = async e => {
    e.preventDefault();
    container.innerHTML = '<div class="spinner"></div>';

    const data = new FormData(form);
    const params = new URLSearchParams();
    for (const [k, v] of data.entries()) {
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

      container.innerHTML = common.length
        ? `<ul class="slot-list">${
            common.map(s => {
              const from = new Date(s.start).toLocaleString();
              const to   = new Date(s.end).toLocaleString();
              return `<li>${from} → ${to}</li>`;
            }).join('')
          }</ul>`
        : '<p class="msg">No common free slots found.</p>';
    } catch (err) {
      container.innerHTML = `<p class="error">${err.message}</p>`;
    }
  };
});
