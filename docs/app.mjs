import { feedUrl } from './config.mjs';

const routes = {
  purple: ['PCMC', 'Sant Tukaram Nagar', 'Bhosari (Nashik Phata)', 'Kasarwadi', 'Phugewadi', 'Dapodi', 'Bopodi', 'Khadki', 'Range Hill', 'Shivaji Nagar', 'District Court', 'Kasba Peth', 'Mahatma Phule Mandai', 'Swargate'],
  aqua: ['Vanaz', 'Anand Nagar', 'Ideal Colony', 'Nal Stop', 'Garware College', 'Deccan Gymkhana', 'Chhatrapati Sambhaji Udyan', 'PMC', 'District Court', 'Mangalwar Peth', 'Pune Railway Station', 'Ruby Hall Clinic', 'Bund Garden', 'Yerawada', 'Kalyani Nagar', 'Ramwadi'],
};
const line = document.querySelector('#line');
const demo = document.querySelector('#demo');
const stations = document.querySelector('#stations');
const status = document.querySelector('#status');
const positions = document.querySelector('#positions');
const clock = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', timeStyle: 'medium' });
const fresh = (timestamp, now) => Number.isFinite(timestamp) && now - timestamp <= 90000 && timestamp <= now + 15000;
let vehicles = [];
let feedState = feedUrl ? 'Connecting to the vehicle feed…' : 'Live feed unavailable. Enable simulation to preview the tracker.';

function render() {
  const route = routes[line.value];
  const now = Date.now();
  document.documentElement.style.setProperty('--line', line.value === 'purple' ? '#7345a5' : '#00817f');
  stations.replaceChildren(...route.map(name => {
    const stop = document.createElement('li');
    stop.textContent = name;
    if (name === 'District Court') {
      const interchange = document.createElement('small');
      interchange.textContent = 'Purple / Aqua interchange';
      stop.append(interchange);
    }
    return stop;
  }));
  status.textContent = demo.checked ? 'Simulation · illustrative movements only' : feedState;
  const displayed = demo.checked ? [0, 1].map(direction => {
    const step = (Math.floor(now / 12000) + direction * 5) % (route.length - 1);
    const from = direction ? route.length - 1 - step : step;
    const to = from + (direction ? -1 : 1);
    return { id: 'Demo train ' + (direction + 1), detail: route[from] + ' → ' + route[to] };
  }) : vehicles.filter(v => v.line === line.value && fresh(v.timestamp, now)).map(v => ({
    id: v.id,
    detail: v.latitude.toFixed(5) + ', ' + v.longitude.toFixed(5) + ' · ' + clock.format(v.timestamp) + ' IST',
    url: 'https://www.openstreetmap.org/?mlat=' + v.latitude + '&mlon=' + v.longitude + '#map=17/' + v.latitude + '/' + v.longitude,
  }));
  positions.replaceChildren(...displayed.map(train => {
    const card = document.createElement('article');
    const label = document.createElement(train.url ? 'a' : 'strong');
    if (train.url) label.href = train.url;
    label.textContent = train.id;
    const detail = document.createElement('small');
    detail.textContent = train.detail;
    card.append(label, detail);
    return card;
  }));
  if (!displayed.length) positions.textContent = 'No current positions for this line.';
}

async function refresh() {
  try {
    const response = await fetch(feedUrl, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error('Feed HTTP ' + response.status);
    const data = await response.json();
    vehicles = data.vehicles.filter(v => v && Object.hasOwn(routes, v.line) &&
      typeof v.id === 'string' && Number.isFinite(v.latitude) && Math.abs(v.latitude) <= 90 &&
      Number.isFinite(v.longitude) && Math.abs(v.longitude) <= 180);
    feedState = 'Vehicle feed refreshed at ' + clock.format(Date.now()) + ' IST';
  } catch {
    vehicles = [];
    feedState = 'Vehicle feed temporarily unavailable. Retrying automatically.';
  }
  render();
  setTimeout(refresh, 15000);
}
line.addEventListener('change', render);
demo.addEventListener('change', render);
render();
setInterval(() => { if (demo.checked) render(); }, 2000);
if (feedUrl) refresh();
