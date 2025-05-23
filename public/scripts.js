// public/scripts.js
document.addEventListener('DOMContentLoaded', () => {
  const form      = document.getElementById('slotForm');
  const slotsCont = document.getElementById('slotsContainer');
  const partDiv   = document.getElementById('participants');
  document.getElementById('addParticipant').onclick = () => {
    const inp = document.createElement('input');
    inp.type = 'email';
    inp.name = 'participants';
    inp.placeholder = 'Participant email';
    inp.required = true;
    inp.className = 'participant-input';
    partDiv.appendChild(inp);
  };

  flatpickr('#from', { enableTime:true, dateFormat:'Y-m-d H:i' });
  flatpickr('#to',   { enableTime:true, dateFormat:'Y-m-d H:i' });

  form.onsubmit = async e => {
    e.preventDefault();
    slotsCont.innerHTML = '<div class="spinner"></div>';

    const data = new FormData(form);
    const params = new URLSearchParams();
    for (let [k,v] of data) {
      if ((k==='from'||k==='to') && v) v += ':00Z';
      params.append(k,v);
    }

    try {
      const res = await fetch('/slots?'+params);
      if (!res.ok) throw new Error(await res.text());
      const { common } = await res.json();

      slotsCont.innerHTML = '';
      if (!common.length) {
        slotsCont.innerHTML = '<p class="msg">No common free slots found.</p>';
      } else {
        const ul = document.createElement('ul');
        ul.className = 'slot-list';
        common.forEach(s => {
          const li = document.createElement('li');
          const from = new Date(s.start).toLocaleString();
          const to   = new Date(s.end).toLocaleString();
          li.textContent = `${from} → ${to}`;
          li.onclick = () => navigator.clipboard.writeText(li.textContent);
          ul.appendChild(li);
        });
        slotsCont.appendChild(ul);
      }
    } catch (err) {
      slotsCont.innerHTML = `<p class="error">${err.message}</p>`;
    }
  };
});
