// public/app.js
console.log('app.js loaded');

const form = document.getElementById('slotForm');
const output = document.getElementById('output');

form.addEventListener('submit', async e => {
  e.preventDefault();
  console.log('Form submitted');

  const data = new FormData(form);
  const params = new URLSearchParams();

  for (const [k, v] of data) {
    if ((k === 'from' || k === 'to') && v) {
      // v is like "2025-05-23T09:00"
      // append seconds and Z for UTC
      params.append(k, `${v}:00Z`);
    } else {
      params.append(k, v);
    }
  }

  console.log('Query params:', params.toString());

  output.textContent = 'Loading...';
  try {
    const res = await fetch(`/slots?${params.toString()}`);
    if (!res.ok) throw new Error(await res.text());
    const { common } = await res.json();
    output.textContent = JSON.stringify(common, null, 2);
  } catch (err) {
    console.error(err);
    output.textContent = 'Error: ' + err.message;
  }
});
