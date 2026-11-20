(() => {
  const art = document.getElementById('earth-art');
  const toggle = document.getElementById('earth-toggle');
  if (!art || !toggle) return;

  // Public-domain Natural Earth 1:110m land polygons, rasterized to a 1-bit map.
  const map = atob('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAF//gD//+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP////////8AAAAAAAAAAAMAAAAAAAAAAAAAAAAAAf////////wAA//gB+AAAA/gAAAAAAAAAAAAAAAOf/////////AAAf8AAAAAAAP+AAAAAAAAAAAAAAHvB+/4//////AAAH+AAAAMAAA/4AAAAAAAAAAAAAP/3//gf////+AAAAAAAAf8AD//+AAf+AAAAAAAAA/ux//wAH////AAAAAAAB4AB////zgPsAAAAAAAAA/////8AB///+AAAAAAADwD//////4P8AAAwAfoAA//5+//4D///8AAAADgAD4P/////////8ABAB//9///////8B///8AAAA//gAD///////////9/wP/////////P+A///AAAAH//7////////////////P/////////P/g//wNYAAH////////////////////////////+f/Af/Af4AAP7/////////////////Dz/////////v+Af4AP4AB///////////////////An////////D/+APwAAAAH/P/////////////////AP///////8APyAHwAAAAH/v//////////////7/gAP/8v////8Af/AAAAAAMH/H//////////////z5AAAfgD/////AP/gAAAAAOD+P////////////4APgAAA/AAf////4P/wAAAAAeB+P////////////wAfgAADgAAf///////8AAAAA/B///////////////AfgAAAAAAX/////f/+AAAAB/3///////////////AeAAAAAAAL////////AAAAB/////////////////AMAAAAAAAD///////3AAAAAP////////////////AAAAAAAAAA///////vgAAAAP////////////////gAAAAAAAAAf//////fgAAAAH/////4/////////7AAAAAAAAAAf//////4AAAAAB/////g/////////7AAAAAAAAAAf//////AAAAAA5///zfh/////////jgAAAAAAAAA//////wAAAAAB//9/jPg/////////HwAAAAAAAAAf/////wAAAAAB/5v///wf///////4HAAAAAAAAAAf////+AAAAAAB/hn///w////////4GAAAAAAAAAAf////+AAAAAAB/hPf//w///////5wMAAAAAAAAAAP////8AAAAAAA//2M//4///////84cAAAAAAAAAAH////8AAAAAAAf/wHH/////////w/8AAAAAAAAAAH////wAAAAAAA//wAB/////////4vgAAAAAAAAAAB////gAAAAAAB//+fL/////////8OAAAAAAAAAAAA////AAAAAAAB//////////////8MAAAAAAAAAAAA///ngAAAAAAD//////////////8AAAAAAAAAAAAAf/wDoAAAAAAH//////7///////8AAAAAAAAAAAAAP/wB4AAAAAAP////+/////////wAAAAAAAAAAAAAH/gB4AAAAAAf///////3//////8AAAAAAAAAAAAAD/gH4AAAAAAf/////f/8P/////oAAAAAAAAcAAAAAfw/8AAAAAA//////v/8D////+IAAAAAAAAGAAAAAfx4fwAAAAA//////v/4D/+f/4AAAAAAAAACAAAAAP/wf+AAAAAf/////3/4A/4P+wMAAAAAAAAAAAAAAH/wMmAAAAA//////3/wA/wH/AMAAAAAAAAAAAAAAA/+AAAAAAA//////7+AAfgP/gcAAAAAAAAAAAAAAAD+AAAAAAA///////8AAfAB/gOAAAAAAAAAAAAAAAA+AwAAAAA///////2AAfAB/gPAAAAAAAAAAAAAAAAOH9wAAAAf//////+AAPABvgXAAAAAAAAAAAAAAAAP3/wAAAAP//////8AAPABnA3gAAAAAAAAAAAAAAAD//4AAAAH//////8AAHgBiAngAAAAAAAAAAAAAAAAv/9AAAAH//////4AABgA4BngAAAAAAAAAAAAAAAAP//wAAAB/n////4AABAG4DxAAAAAAAAAAAAAAAAAP//wAAAAgH////wAAAAD4HwAAAAAAAAAAAAAAAAAf//4AAAAAA////wAAAAB8fhQAAAAAAAAAAAAAAAA///4AAAAAA////AAAAAB8//wAAAAAAAAAAAAAAAA///+AAAAAB///+AAAAAA8/+XAAAAAAAAAAAAAAAA////8AAAAA///8AAAAAAefcf+DAAAAAAAAAAAAAB////+AAAAAf//4AAAAAAOPd//jgAAAAAAAAAAAAB/////gAAAAf//4AAAAAAHAeB//QAAAAAAAAAAAAB/////gAAAAP//4AAAAAAD8ABP+cAAAAAAAAAAAAAf////gAAAAP//4AAAAAAA/9gf4HAAAAAAAAAAAAAf////gAAAAP//4AAAAAAAB7ADODgAAAAAAAAAAAAP////AAAAAH//4AAAAAAAAAHjCBgAAAAAAAAAAAAP///+AAAAAP//8MAAAAAAAAPzAAAAAAAAAAAAAAAH///+AAAAAP//8cAAAAAAAB/jgAEAgAAAAAAAAAAH///+AAAAAf//58AAAAAAAD/zgAEBgAAAAAAAAAAA///8AAAAAf//58AAAAAAAH//wAEDAAAAAAAAAAAAf//8AAAAAf//h4AAAAAAAP//4AADAAAAAAAAAAAAf//8AAAAAP//B4AAAAAAB///8AYAAAAAAAAAAAAAf//4AAAAAH//DwAAAAAAH///+AcAAAAAAAAAAAAAf//4AAAAAH//DwAAAAAAH///+AAAAAAAAAAAAAAAf//AAAAAAH//BwAAAAAAH////AAAAAAAAAAAAAAA//8AAAAAAH/8AgAAAAAAH////gAAAAAAAAAAAAAA//8AAAAAAD/8AAAAAAAAD////gAAAAAAAAAAAAAA//8AAAAAAD/8AAAAAAAAD////gAAAAAAAAAAAAAA//4AAAAAAB/4AAAAAAAAD////gAAAAAAAAAAAAAA//wAAAAAAB/wAAAAAAAAB/7//AAAAAAAAAAAAAAA//gAAAAAAA/gAAAAAAAAD+B//AAQAAAAAAAAAAAB//AAAAAAAAQAAAAAAAAABwA/+AAYAAAAAAAAAAAD/+AAAAAAAAAAAAAAAAAAAAAH+AAcAAAAAAAAAAAD/8AAAAAAAAAAAAAAAAAAAAAH8AAPAAAAAAAAAAAD/gAAAAAAAAAAAAAAAAAAAAAAQAAeAAAAAAAAAAAD/gAAAAAAAAAAAAAAAAAAAAAA4AA8AAAAAAAAAAAD/AAAAAAAAAAAAAAAAAAAAAAA4ABwAAAAAAAAAAAD+AAAAAAAAAAAAAAAAAAAAAAAQADwAAAAAAAAAAAD+AAAAAAAAAAAAAAAAAAAAAAAAAHAAAAAAAAAAAAH+AAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAH+AAAAAAAAAAAAAAHAAAAAAAAAAAAAAAAAAAAAAAH4AAAAAAAAAAAAAAGAAAAAAAAAAAAAAAAAAAAAAAH4cAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwAAAAAAAAAAABwAAAAMEAAgAAAAAAAAAAAAAAAAPgAAAAAAAAAAAP8gA///////wAAAAAAAAAAAAAAAfAAAAAAAAAADH//+D////////wAAAAAAAAAAAAAA/gAAAAAADv7////+//////////AAAAAAAAAAHwAH/gAAAAD////////////////////gAAAAABqAP/8r/wAAAAf////////////////////gAAAAH///P////wAAAA////////////////////+AAAAD/////////AAAB/////////////////////wAAAP/////////gACAf/////////////////////wAAD/////////+AAPw//////////////////////8AAAgH////////n5/wf/////////////////////AAAAH//////////4////////////////////////wAAgB///////////////////////////////////+A////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////');
  const mapWidth = 240;
  const mapHeight = 120;
  const columns = 76;
  const rows = 33;
  const sinTilt = Math.sin(24 * Math.PI / 180);
  const cosTilt = Math.cos(24 * Math.PI / 180);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const frame = art.textContent.split('\n').map(row => row.split(''));
  const sphere = [];
  let offset = 124;
  let running = 0;
  let paused = false;
  let inView = !('IntersectionObserver' in window);

  // The view and lighting stay fixed, so project the character cells only once.
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      const vx = (x - (columns - 1) / 2) / 33;
      const vy = ((rows - 1) / 2 - y) / 15;
      const radiusSquared = vx * vx + vy * vy;
      if (radiusSquared > 1) continue;
      const z = Math.sqrt(1 - radiusSquared);
      const lat = Math.asin(vy * cosTilt + z * sinTilt);
      const lon = Math.atan2(vx, z * cosTilt - vy * sinTilt);
      const mapRow = Math.max(0, Math.min(mapHeight - 1, Math.floor((.5 - lat / Math.PI) * mapHeight)));
      const light = Math.max(0, Math.min(.999, .55 * z - .42 * vx + .31 * vy + .20));
      sphere.push({ x, y, col: Math.round(lon * mapWidth / (2 * Math.PI)), row: mapRow * mapWidth, shade: Math.floor(light * 6) });
    }
  }

  function draw() {
    for (const { x, y, col, row, shade } of sphere) {
      const bit = row + (col + offset + mapWidth) % mapWidth;
      const land = map.charCodeAt(bit >> 3) & (128 >> (bit & 7));
      frame[y][x] = (land ? ':-+*#@' : '..:--=')[shade];
    }
    art.textContent = frame.map(row => row.join('')).join('\n');
    offset = (offset + 1) % mapWidth;
  }

  function updatePlayback() {
    if (!paused && !motion.matches && inView && !document.hidden) {
      if (!running) running = window.setInterval(draw, 95);
    } else if (running) {
      window.clearInterval(running);
      running = 0;
    }
    toggle.hidden = motion.matches;
    toggle.textContent = paused ? 'Resume rotation' : 'Pause rotation';
  }

  toggle.addEventListener('click', () => {
    paused = !paused;
    updatePlayback();
  });
  document.addEventListener('visibilitychange', updatePlayback);
  motion.addEventListener('change', updatePlayback);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      updatePlayback();
    });
    observer.observe(art);
  }
  updatePlayback();
})();
