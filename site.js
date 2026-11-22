const byId = (id) => document.getElementById(id);
const dialog = byId('entry-dialog');
let entryTrigger;

function appendParagraphs(container, paragraphs) {
  for (const paragraph of paragraphs ?? []) {
    const element = document.createElement('p');
    element.textContent = paragraph;
    container.append(element);
  }
}

function appendLink(container, { label, url }, className = 'button button-outline') {
  if (!url) return;

  const link = document.createElement('a');
  link.href = url;
  if (!['http:', 'https:', 'file:', 'mailto:'].includes(link.protocol)) return;
  link.className = className;
  link.textContent = label;
  container.append(link);
  return link;
}

function entryLabel(entry, ...details) {
  return [...details, entry.dateLabel ?? entry.date].filter(Boolean).join(' / ');
}

function openEntry(entry, trigger) {
  byId('dialog-label').textContent = entryLabel(entry, entry.category);
  byId('dialog-title').textContent = entry.title;
  const summary = byId('dialog-summary');
  summary.textContent = entry.summary ?? '';
  summary.hidden = !entry.summary;
  const body = byId('dialog-body');
  body.replaceChildren();
  appendParagraphs(body, entry.body);
  const links = byId('dialog-links');
  links.replaceChildren();
  for (const link of entry.links ?? []) appendLink(links, link);
  entryTrigger = trigger;
  dialog.showModal();
  dialog.scrollTop = 0;
}

dialog?.addEventListener('close', () => {
  if (!dialog.open) {
    entryTrigger?.focus({ preventScroll: true });
    entryTrigger = null;
  }
});

function fillEntry(element, entry, label) {
  const labelElement = element.querySelector('.entry-label');
  labelElement.textContent = label;
  labelElement.hidden = !label;
  element.querySelector('h3').textContent = entry.title;
  const summary = element.querySelector('.summary');
  summary.textContent = entry.summary ?? '';
  summary.hidden = !entry.summary;
}

function addEmptyState(container, message) {
  if (container.childElementCount === 0) appendParagraphs(container, [message]);
}

function renderRecords(id, entries, sourceKey, options) {
  const list = byId(id);
  if (!list) return;
  const template = byId('row-template').content.firstElementChild;
  for (const record of publishedEntries(entries)) {
    const row = template.cloneNode(true);
    fillEntry(row, record, entryLabel(record, sourceKey ? record[sourceKey] : null));
    const link = appendLink(row.querySelector('.entry-action'), { label: options.action, url: record.url }, 'text-button entry-link');
    link?.setAttribute('aria-label', `${options.action}: ${record.title}`);
    list.append(row);
  }
  addEmptyState(list, options.empty);
}

const archiveKey = item => item.id ?? item.title;
const writeupsUrl = query => `writeups.html${query ? `?${new URLSearchParams(query)}` : ''}`;

function publishedEntries(entries = []) {
  return entries.filter(item => !item.sample);
}

function latestEntries(entries) {
  // ISO dates (including year or year-month) sort in chronological order.
  const dateKey = item => /^\d{4}(?:-\d{2}(?:-\d{2})?)?$/.test(item.date ?? '') ? item.date : '';
  return publishedEntries(entries)
    .sort((a, b) => dateKey(b).localeCompare(dateKey(a)))
    .slice(0, 3);
}

function homepageWriteups() {
  const entries = publishedEntries(portfolio.writeups).map(note => ({
    ...note, url: writeupsUrl({ note: archiveKey(note) }),
  }));
  for (const event of publishedEntries(portfolio.ctfEvents)) {
    for (const category of publishedEntries(event.categories)) {
      for (const challenge of publishedEntries(category.challenges)) {
        entries.push({
          ...challenge,
          category: [event.title, category.title].join(' / '),
          url: writeupsUrl({ event: archiveKey(event), category: archiveKey(category), challenge: archiveKey(challenge) }),
        });
      }
    }
  }
  return latestEntries(entries.filter(item => item.body?.some(paragraph => paragraph.trim())));
}

function renderFieldNotes() {
  const list = byId('field-note-list');
  for (const note of publishedEntries(portfolio.fieldNotes)) {
    const entry = document.createElement('article');
    entry.className = 'field-note';
    if (note.image) {
      const frame = document.createElement('figure');
      frame.className = 'field-note-photo';
      const photo = document.createElement('img');
      photo.src = note.image;
      photo.alt = note.imageAlt ?? '';
      photo.loading = 'lazy';
      photo.decoding = 'async';
      if (note.imageWidth && note.imageHeight) {
        photo.width = note.imageWidth;
        photo.height = note.imageHeight;
      }
      frame.append(photo);
      entry.append(frame);
    }
    const text = document.createElement('div');
    text.className = 'field-note-copy';
    const meta = entryLabel(note, note.location);
    if (meta) {
      const label = document.createElement('p');
      label.className = 'entry-label';
      label.textContent = meta;
      text.append(label);
    }
    const title = document.createElement('h3');
    title.textContent = note.title;
    text.append(title);
    appendParagraphs(text, note.body);
    entry.append(text);
    list.append(entry);
  }
  addEmptyState(list, 'No field notes yet.');
}

function setupFieldCarousel() {
  const track = byId('field-note-list');
  const slides = [...track.querySelectorAll('.field-note')];
  if (slides.length < 2) return;

  const carousel = byId('field-carousel');
  const controls = byId('field-controls');
  const counter = byId('field-count');
  const play = byId('field-play');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const canHover = matchMedia('(hover: hover) and (pointer: fine)');
  const delay = 6000;
  let index = 0;
  let pending = null;
  let timer = 0;
  let settleTimer = 0;
  let paused = false;
  let inView = false;
  let hovered = false;
  let pointerDown = false;

  track.classList.add('is-carousel');
  track.tabIndex = 0;
  track.setAttribute('role', 'group');
  track.setAttribute('aria-label', 'Field note slides. Use the left and right arrow keys to navigate.');
  controls.hidden = false;

  function showCount() {
    counter.textContent = `${index + 1} / ${slides.length}`;
  }

  function schedule() {
    clearTimeout(timer);
    const focused = carousel.contains(document.activeElement) && document.activeElement !== play;
    if (!paused && !reduced.matches && inView && !document.hidden && !hovered && !pointerDown && !focused) {
      timer = setTimeout(() => go(1), delay);
    }
  }

  function syncScroll() {
    index = slides.reduce((nearest, slide, i) => Math.abs(slide.offsetLeft - track.scrollLeft) <
      Math.abs(slides[nearest].offsetLeft - track.scrollLeft) ? i : nearest, 0);
    if (pending === index) pending = null;
    showCount();
    schedule();
  }

  function go(step) {
    const from = pending ?? index;
    const next = (from + step + slides.length) % slides.length;
    const wraps = Math.abs(next - from) > 1;
    pending = next;
    track.scrollTo({ left: slides[next].offsetLeft, behavior: reduced.matches || wraps ? 'instant' : 'smooth' });
    schedule();
  }

  function syncMotion() {
    play.hidden = reduced.matches || !('IntersectionObserver' in window);
    const nextLabel = paused ? 'Resume autoplay' : 'Pause autoplay';
    if (play.textContent !== nextLabel) play.textContent = nextLabel;
    schedule();
  }

  byId('field-prev').addEventListener('click', () => go(-1));
  byId('field-next').addEventListener('click', () => go(1));
  play.addEventListener('click', () => { paused = !paused; syncMotion(); });
  track.addEventListener('keydown', event => {
    if (event.target !== track || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    go(event.key === 'ArrowRight' ? 1 : -1);
  });
  track.addEventListener('scroll', () => {
    syncScroll();
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => { pending = null; }, 150);
  }, { passive: true });
  carousel.addEventListener('pointerenter', event => {
    hovered = canHover.matches && event.pointerType === 'mouse';
    schedule();
  });
  carousel.addEventListener('pointerleave', () => { hovered = false; schedule(); });
  track.addEventListener('pointerdown', () => { pointerDown = true; pending = null; schedule(); });
  for (const event of ['pointerup', 'pointercancel']) {
    window.addEventListener(event, () => {
      if (!pointerDown) return;
      pointerDown = false;
      schedule();
    });
  }
  carousel.addEventListener('focusin', schedule);
  carousel.addEventListener('focusout', () => queueMicrotask(schedule));
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', syncMotion);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting && entry.intersectionRatio >= .25;
      schedule();
    }, { threshold: .25 }).observe(track);
  }
  showCount();
  syncMotion();
}

function renderProjects(records) {
  const projects = byId('projects');
  for (const project of publishedEntries(records)) {
    const card = byId('project-template').content.firstElementChild.cloneNode(true);
    fillEntry(card, project, entryLabel(project, project.category));
    const cover = card.querySelector('.project-cover');
    if (project.image) {
      cover.removeAttribute('aria-hidden');
      const image = document.createElement('img');
      image.src = project.image;
      image.alt = project.imageAlt ?? '';
      image.loading = 'lazy';
      image.decoding = 'async';
      cover.append(image);
    } else {
      const art = byId(`art-${project.cover}`);
      if (art instanceof HTMLTemplateElement) cover.append(art.content.cloneNode(true));
      else cover.remove();
    }
    const button = card.querySelector('button');
    button.setAttribute('aria-label', `View project: ${project.title}`);
    button.addEventListener('click', () => openEntry(project, button));
    projects.append(card);
  }
  addEmptyState(projects, 'Projects coming soon.');
}

for (const element of document.querySelectorAll('[data-name]')) element.textContent = portfolio.name;

function renderHome() {
  byId('intro').textContent = portfolio.intro;
  appendParagraphs(byId('bio'), portfolio.bio);

  const skills = byId('skills');
  for (const skill of portfolio.skills) {
    const item = document.createElement('li');
    item.textContent = skill;
    skills.append(item);
  }
  skills.hidden = skills.childElementCount === 0;

  if (portfolio.resume) {
    const resume = byId('resume');
    resume.href = portfolio.resume;
    resume.hidden = false;
  }

  renderProjects(publishedEntries(portfolio.projects).slice(0, 3));

  const contactLinks = byId('contact-links');
  if (portfolio.contact.email) {
    appendLink(contactLinks, { label: 'Email', url: `mailto:${portfolio.contact.email}` }, 'button button-primary');
  }
  for (const profile of portfolio.contact.profiles) appendLink(contactLinks, profile);
  const contactNote = byId('contact-note');
  if (portfolio.contact.description) contactNote.textContent = portfolio.contact.description;
  else contactNote.hidden = contactLinks.childElementCount > 0;
}

const experienceRecords = { action: 'View experience', empty: 'Experience entries have not been added yet.' };
const achievementRecords = { action: 'View achievement', empty: 'Achievements have not been added yet.' };

const page = byId('main').dataset.page;
if (!page) {
  renderHome();
  renderFieldNotes();
  setupFieldCarousel();
  const activities = publishedEntries(portfolio.activities);
  if (activities.length) {
    renderRecords('activities-list', activities, null, { action: 'View activity' });
    byId('activities-list').closest('section').hidden = false;
  }
  renderRecords('recent-writeups', homepageWriteups(), 'category', { action: 'Read writeup', empty: 'Writeups coming soon' });
  renderRecords('recent-certifications', latestEntries(portfolio.certifications ?? []), 'issuer', { action: 'View credential', empty: 'No certifications listed yet.' });
  renderRecords('experience-list', latestEntries(portfolio.experience ?? []), 'organization', experienceRecords);
  renderRecords('achievement-list', latestEntries(portfolio.achievements ?? []), 'issuer', achievementRecords);
}
if (page === 'certifications') {
  renderRecords('credentials', portfolio.certifications, 'issuer', { action: 'View credential', empty: 'No certifications have been listed yet.' });
}

if (page === 'experience') {
  renderRecords('all-experience', portfolio.experience, 'organization', experienceRecords);
}
if (page === 'projects') {
  renderProjects(portfolio.projects ?? []);
}
if (page === 'achievements') {
  renderRecords('all-achievements', portfolio.achievements, 'issuer', achievementRecords);
}

const motion = matchMedia('(prefers-reduced-motion: reduce)');
const sidebar = document.querySelector('.section-dock');
const dockList = sidebar.querySelector('.dock-links');
let dockAnimations = [];
let dockWasOpen = false;

function stopDockAnimation() {
  for (const animation of dockAnimations) animation.cancel();
  dockAnimations = [];
}

function animateDockLinks() {
  if (sidebar.open === dockWasOpen) return;
  dockWasOpen = sidebar.open;
  stopDockAnimation();
  if (!sidebar.open || !dockList.childElementCount || motion.matches || !Element.prototype.animate) return;
  dockAnimations = [...dockList.querySelectorAll('a')].map((link, index) => link.animate(
    [{ opacity: 0, transform: 'translateX(-5px)' }, { opacity: 1, transform: 'none' }],
    { delay: 65 + Math.min(index, 10) * 42, duration: 155, easing: 'ease-out', fill: 'backwards' }
  ));
}

sidebar.addEventListener('toggle', animateDockLinks);
sidebar.addEventListener('focusin', event => {
  if (event.target.closest('.dock-links a')) stopDockAnimation();
});
motion.addEventListener('change', () => {
  if (motion.matches) stopDockAnimation();
});

const wideSidebar = matchMedia('(min-width: 78rem)');
// Remember an explicit choice across pages in this browser tab.
const sidebarKey = 'crosite.sidebar';
let sidebarChoice = null;
function restoreSidebar() {
  sidebar.classList.remove('dock-interacted');
  try { sidebarChoice = sessionStorage.getItem(sidebarKey); } catch { /* Storage can be disabled. */ }
  sidebar.open = sidebarChoice === null ? wideSidebar.matches : sidebarChoice === 'open';
}
restoreSidebar();
animateDockLinks();
wideSidebar.addEventListener('change', restoreSidebar);
window.addEventListener('pageshow', event => {
  if (event.persisted) restoreSidebar();
});
sidebar.querySelector('summary').addEventListener('click', event => {
  if (event.defaultPrevented) return;
  sidebar.classList.add('dock-interacted');
  sidebarChoice = sidebar.open ? 'closed' : 'open';
  try { sessionStorage.setItem(sidebarKey, sidebarChoice); } catch { /* The menu still toggles. */ }
});
sidebar.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (!link || wideSidebar.matches || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const section = byId(decodeURIComponent(link.hash.slice(1)));
  if (!section) return;
  sidebar.classList.remove('dock-interacted');
  sidebar.open = false;
  section.focus({ preventScroll: true });
});

// Short pages and viewport changes can cause the browser to skip a native transition.
function settlePage() {
  const from = window.navigation?.activation?.from?.url;
  if (!from || motion.matches) return;
  if (new URL('.', from).href !== new URL('.', location.href).href) return;
  document.documentElement.classList.add('page-arriving');
}
let pageRevealed = false;
window.addEventListener('pagereveal', ({ viewTransition }) => {
  pageRevealed = true;
  if (viewTransition) viewTransition.ready.catch(settlePage);
  else settlePage();
});
// A deferred script can run after the browser has already dispatched pagereveal.
requestAnimationFrame(() => {
  if (pageRevealed || document.activeViewTransition) return;
  if (!document.getAnimations().some(a => a.effect?.pseudoElement?.startsWith('::view-transition'))) settlePage();
});
window.addEventListener('pagehide', () => document.documentElement.classList.remove('page-arriving'));

const topBar = byId('top');
const ruler = byId('scroll-ruler');
const position = byId('scroll-position');
const readout = byId('scroll-readout');
const rulerMedia = matchMedia('(min-width: 54rem) and (min-height: 25rem) and (hover: hover) and (pointer: fine) and (forced-colors: none)');

function setupDepthRuler() {
  if (!CSS.supports('scrollbar-width', 'none') || !CSS.supports('writing-mode', 'vertical-lr')) return;
  const root = document.documentElement;
  const scrollport = document.scrollingElement;
  const body = ruler.querySelector('.ruler-body');
  const scale = ruler.querySelector('.ruler-scale');
  const navigation = document.createElement('nav');
  navigation.className = 'ruler-markers';
  navigation.setAttribute('aria-label', 'Page sections on depth ruler');
  body.prepend(navigation);

  // Reuse the Explorer destinations so both controls track the content on this page.
  const markers = [...dockList.querySelectorAll('a[href^="#"]')].flatMap(shortcut => {
    const target = byId(shortcut.hash.slice(1));
    const heading = target?.matches('h2, h3') ? target : target?.querySelector('h2, h3');
    if (!heading || !heading.getClientRects().length) return [];
    const link = document.createElement('a');
    const label = document.createElement('span');
    link.href = shortcut.hash;
    label.textContent = heading.textContent.trim();
    link.append(label);
    navigation.append(link);
    return [{ heading, link, label }];
  });
  for (let percent = 0; percent <= 100; percent += 5) {
    const label = document.createElement('span');
    label.className = `ruler-fine-label${percent % 10 ? ' ruler-fine-intermediate' : ''}`;
    label.style.setProperty('--at', `${percent}%`);
    label.textContent = percent;
    scale.append(label);
  }
  position.step = '.1';

  let frame = 0;
  let scrollRange = 0;
  let topBarHeight;
  let near = false;
  let fine = false;
  let positioned = false;

  function renderPosition(percent) {
    position.value = percent;
    const value = fine ? percent.toFixed(1) : String(Math.round(percent));
    position.setAttribute('aria-valuetext', `${value} percent`);
    readout.textContent = `${value}%`;
  }

  function refreshPrecision() {
    const next = near || ruler.contains(document.activeElement);
    if (next === fine) return;
    fine = next;
    ruler.classList.toggle('is-precise', fine);
    renderPosition(Number(position.value));
  }

  function moveLabel(marker, active, animate) {
    marker.flight?.cancel();
    marker.link.classList.toggle('is-current', active);
    if (active) marker.link.setAttribute('aria-current', 'location');
    else marker.link.removeAttribute('aria-current');
    const heading = marker.heading.getBoundingClientRect();
    if (!animate || heading.bottom < 0 || heading.top > innerHeight || marker.link.matches(':focus-visible')) return;

    const origin = marker.label.getBoundingClientRect();
    const offsetX = heading.left - origin.left;
    const offsetY = heading.top + (heading.height - origin.height) / 2 - origin.top;
    const copy = document.createElement('span');
    copy.className = 'ruler-flight';
    copy.setAttribute('aria-hidden', 'true');
    copy.textContent = marker.label.textContent;
    copy.style.left = `${origin.left}px`;
    copy.style.top = `${origin.top}px`;
    document.body.append(copy);
    marker.link.classList.add('is-moving');

    const flight = copy.animate([
      { transform: 'translate(0, 0)', opacity: 1 },
      { transform: `translate(${offsetX}px, ${offsetY}px) scale(1.3)`, opacity: .18 },
    ], { duration: 330, direction: active ? 'normal' : 'reverse', easing: 'cubic-bezier(.25, .7, .3, 1)' });
    marker.flight = flight;
    flight.onfinish = flight.oncancel = () => {
      copy.remove();
      if (marker.flight !== flight) return;
      marker.flight = undefined;
      marker.link.classList.remove('is-moving');
    };
  }

  function updateMarkers(scrollTop) {
    const height = body.clientHeight;
    const cue = Math.min(innerHeight * .28, 220);
    const spacing = Math.min(24, Math.max(12, (height - 92) / Math.max(1, markers.length - 1)));
    const lowest = height - 48;
    const offsets = markers.map(marker => {
      const bounds = marker.heading.getBoundingClientRect();
      return Math.min(scrollRange, Math.max(0, scrollTop + bounds.top - cue));
    });
    const ordered = markers.map((marker, index) => ({ marker, offset: offsets[index] }))
      .sort((left, right) => left.offset - right.offset);
    const currentOffset = ordered.findLast(item => item.offset <= scrollTop + 1)?.offset;
    let previous = 42 - spacing;
    for (const [index, { marker, offset }] of ordered.entries()) {
      const ideal = 6 + offset / scrollRange * (height - 12);
      const top = Math.min(lowest - (ordered.length - 1 - index) * spacing, Math.max(previous + spacing, ideal));
      marker.link.style.setProperty('--marker-top', `${top}px`);
      previous = top;
      const active = currentOffset !== undefined && Math.abs(currentOffset - offset) < 2;
      if (active !== marker.active) {
        marker.active = active;
        moveLabel(marker, active, positioned && !motion.matches && typeof marker.label.animate === 'function');
      }
    }
    positioned = true;
  }

  function syncRuler() {
    frame = 0;
    scrollRange = Math.max(0, scrollport.scrollHeight - scrollport.clientHeight);
    const supported = rulerMedia.matches && scrollRange > 0;
    if (supported) {
      const height = topBar.getBoundingClientRect().height;
      if (height !== topBarHeight) {
        topBarHeight = height;
        ruler.style.setProperty('--ruler-top', `${height}px`);
      }
    }
    ruler.hidden = !supported;
    root.classList.toggle('has-ruler', supported);
    if (!supported) {
      positioned = false;
      return;
    }
    const scrollTop = scrollport.scrollTop;
    const next = Math.max(0, Math.min(100, Math.round(1000 * scrollTop / scrollRange) / 10));
    renderPosition(next);
    updateMarkers(scrollTop);
  }

  function queueRulerSync() {
    if (!frame) frame = requestAnimationFrame(syncRuler);
  }

  position.addEventListener('input', () => {
    const percent = Number(position.value);
    renderPosition(percent);
    window.scrollTo({ top: scrollRange * percent / 100, behavior: 'instant' });
  });

  function checkPointer(event) {
    const bounds = ruler.getBoundingClientRect();
    const edge = bounds.right - event.clientX;
    near = !ruler.hidden && bounds.height > 0 && event.clientY >= bounds.top
      && event.clientY <= bounds.bottom && edge >= 0
      && edge <= (near || navigation.contains(event.target) ? bounds.width : position.clientWidth + 12);
    refreshPrecision();
  }

  window.addEventListener('pointermove', checkPointer, { passive: true });
  root.addEventListener('pointerleave', () => {
    near = false;
    refreshPrecision();
  });
  ruler.addEventListener('focusin', refreshPrecision);
  ruler.addEventListener('focusout', () => queueMicrotask(refreshPrecision));
  ruler.addEventListener('wheel', event => {
    if (!near || event.ctrlKey || !event.cancelable || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
    const multiplier = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1;
    event.preventDefault();
    window.scrollBy({ top: event.deltaY * multiplier * .32, behavior: 'instant' });
  }, { passive: false });
  motion.addEventListener('change', () => {
    if (motion.matches) for (const marker of markers) marker.flight?.cancel();
  });
  rulerMedia.addEventListener('change', queueRulerSync);
  window.addEventListener('scroll', queueRulerSync, { passive: true });
  window.addEventListener('resize', queueRulerSync);
  window.addEventListener('pageshow', queueRulerSync);
  if ('ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver(queueRulerSync);
    resizeObserver.observe(document.body);
    resizeObserver.observe(topBar);
  }
  syncRuler();
}

function setupExplorer() {
  if (page) {
    const headings = byId('main').querySelectorAll(page === 'writeups'
      ? '.archive-group > h2'
      : '.entry-row h3, .project h3');
    for (const [index, heading] of [...headings].entries()) {
      const label = heading.textContent.trim();
      if (!label) continue;
      const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `item-${index + 1}`;
      const base = `jump-${slug}`;
      let id = base;
      for (let suffix = 2; byId(id); suffix += 1) id = `${base}-${suffix}`;
      heading.id = id;
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.textContent = label;
      link.href = `#${heading.id}`;
      item.append(link);
      dockList.append(item);
    }
    if (!dockList.childElementCount) return;
    sidebar.querySelector('.dock-empty').hidden = true;
    dockList.closest('nav').hidden = false;
    dockWasOpen = false;
    animateDockLinks();
  }

  const shortcuts = [...dockList.querySelectorAll('a')];
  for (const link of shortcuts) byId(link.hash.slice(1)).tabIndex = -1;
  function markSectionShortcut() {
    for (const link of shortcuts) {
      if (link.hash === location.hash) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }
  markSectionShortcut();
  window.addEventListener('hashchange', markSectionShortcut);
}

function setupBackToTop() {
  const button = document.querySelector('.back-to-top');
  const lead = document.querySelector('.hero, .page-lead') || topBar;
  const footer = document.querySelector('.site-footer');
  const controls = [...document.querySelectorAll('main :is(a[href], button, input, select, textarea, summary)')];
  let frame = 0;

  function sync() {
    frame = 0;
    let visible = lead.getBoundingClientRect().bottom <= 0;
    if (visible) {
      const buttonRect = button.getBoundingClientRect();
      // Leave footer controls and any action passing behind the fixed button clear.
      visible = footer.getBoundingClientRect().top > buttonRect.bottom && !controls.some(control => {
        const rect = control.getBoundingClientRect();
        return rect.width && rect.height && rect.left < buttonRect.right && rect.right > buttonRect.left
          && rect.top < buttonRect.bottom && rect.bottom > buttonRect.top;
      });
    }
    button.classList.toggle('is-visible', visible);
  }

  function queueSync() {
    if (!frame) frame = requestAnimationFrame(sync);
  }

  button.addEventListener('click', () => {
    topBar.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: motion.matches ? 'instant' : 'smooth' });
  });
  window.addEventListener('scroll', queueSync, { passive: true });
  window.addEventListener('resize', queueSync);
  window.addEventListener('pageshow', queueSync);
  if ('ResizeObserver' in window) new ResizeObserver(queueSync).observe(document.body);
  button.hidden = false;
  sync();
}

// Animate cells in the existing drawing so the layout and unenhanced frame stay intact.
function setupArchiveArt() {
  const plate = document.querySelector('.archive-plate');
  if (!plate) return;
  const art = plate.querySelector('.archive-art');
  const caption = plate.querySelector('figcaption');
  art.id = 'live-archive-art';
  art.setAttribute('aria-hidden', 'true');
  for (const label of caption.children) label.setAttribute('aria-hidden', 'true');
  plate.removeAttribute('aria-hidden');

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'earth-toggle archive-toggle';
  toggle.setAttribute('aria-controls', art.id);
  toggle.hidden = true;
  caption.append(toggle);

  const ramp = '.,:-=+*#%@';
  const wrap = (value, period) => ((value % period) + period) % period;
  const cells = [];
  const source = document.createTreeWalker(art, NodeFilter.SHOW_TEXT);
  const runs = [];
  let x = 0;
  let y = 0;
  for (let node; (node = source.nextNode());) runs.push(node);
  for (const node of runs) {
    const fragment = document.createDocumentFragment();
    let plain = '';
    for (const glyph of node.data) {
      if (glyph === '\n') {
        plain += glyph;
        x = 0;
        y++;
        continue;
      }
      const column = x++;
      const sample = effectFor(glyph, column, y);
      if (!sample) {
        plain += glyph;
        continue;
      }
      if (plain) fragment.append(plain);
      plain = '';
      const cell = document.createElement('span');
      const text = document.createTextNode(glyph);
      cell.append(text);
      fragment.append(cell);
      cells.push({ cell, text, glyph, sample });
    }
    if (fragment.childNodes.length) {
      if (plain) fragment.append(plain);
      node.replaceWith(fragment);
    }
  }

  function effectFor(glyph, x, y) {
    if (page === 'achievements' && ramp.includes(glyph)) {
      const u = (x - 26) / 22;
      const v = (y - 8) / 7;
      const angle = Math.atan2(v, u);
      const shade = ramp.indexOf(glyph);
      return time => {
        const wave = Math.sin(3 * angle - time * .26 + Math.hypot(u, v) * 9);
        const flow = y >= 8 ? Math.sin(x * .28 - time * .42 + y) : 0;
        const next = Math.max(0, Math.min(ramp.length - 1, shade + Math.round(wave * 1.45 + flow)));
        return { glyph: ramp[next], hot: next >= 7 && wave > .65 };
      };
    }
    if (page === 'writeups') {
      const route = (y === 6 && x <= 36) || ((y === 1 || y === 11) && x >= 28 && x <= 36)
        || (x === 28 && y >= 1 && y <= 11);
      if (route && '=>-|+:'.includes(glyph)) {
        const distance = x + Math.abs(y - 6);
        return time => ({ glyph, hot: wrap(time * 2 - distance, 50) < 6 });
      }
      if (y === 14 && '_/\\^'.includes(glyph)) {
        return time => ({ glyph: glyph === '_' && wrap(x - time, 19) < 3 ? '~' : glyph,
          hot: wrap(x - time, 19) < 3 });
      }
    }
    if (page === 'projects' && '@*o+./\\-'.includes(glyph)) {
      const star = '@*o+.'.includes(glyph);
      const offset = x * 7 + y * 3;
      return time => {
        const hot = star ? (time + offset) % 31 < 6 : wrap(x - time + y * 3, 31) < 3;
        return { glyph: hot && '.o'.includes(glyph) ? '*' : glyph, hot };
      };
    }
    if (page === 'certifications' && x >= 7 && x <= 45 && y >= 2 && y <= 13) {
      return time => {
        const head = (time + 7) % 55;
        const hot = Math.abs(head - x) <= 1;
        return { glyph: hot && glyph === ' ' ? ':' : glyph, hot };
      };
    }
    if (page === 'experience') {
      if (y === 13 && glyph === '_') return time => ({ glyph: Math.floor(time / 5) % 2 ? ' ' : '_', hot: true });
      const row = [5, 8, 11].indexOf(y);
      if (row >= 0 && x >= 5 && glyph !== ' ') {
        return time => ({ glyph: glyph === '@' && (Math.floor(time / 10) % 3 === row) ? '*' : glyph,
          hot: Math.floor(time / 10) % 3 === row });
      }
      if (y === 2 && '/->'.includes(glyph)) {
        return time => ({ glyph, hot: wrap(Math.floor(time / 2) - x, 27) < 5 });
      }
    }
    return null;
  }

  let time = 0;
  let timer = 0;
  let paused = false;
  let inView = !('IntersectionObserver' in window);
  function draw() {
    for (const { cell, text, sample } of cells) {
      const next = sample(time);
      if (text.data !== next.glyph) text.data = next.glyph;
      cell.classList.toggle('art-signal', next.hot);
    }
    time++;
  }
  function stop() {
    clearInterval(timer);
    timer = 0;
  }
  function syncPlayback() {
    toggle.hidden = motion.matches;
    toggle.textContent = paused ? 'Resume' : 'Pause';
    toggle.setAttribute('aria-label', `${toggle.textContent} ASCII animation`);
    if (motion.matches) {
      for (const { cell, text, glyph } of cells) {
        text.data = glyph;
        cell.classList.remove('art-signal');
      }
    }
    if (paused || motion.matches || !inView || document.hidden) stop();
    else if (!timer) timer = setInterval(draw, page === 'experience' ? 130 : 105);
  }
  toggle.addEventListener('click', () => {
    paused = !paused;
    syncPlayback();
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncPlayback();
    }).observe(art);
  }
  document.addEventListener('visibilitychange', syncPlayback);
  motion.addEventListener('change', syncPlayback);
  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', syncPlayback);
  syncPlayback();
}

// Hide only untyped glyphs, without changing layout or the accessible text.
function createTextTyper(motion) {
  if (!CSS.highlights || typeof Highlight !== 'function') return (_, options) => options?.delay ?? 0;
  const pending = new Highlight();
  CSS.highlights.set('crosite-untyped', pending);
  const active = new Map();
  const segmenter = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter() : null;
  let frame = 0;

  function finish(target, range) {
    pending.delete(range);
    active.delete(target);
  }

  function tick(now) {
    frame = 0;
    for (const [target, { start, duration, point, range }] of active) {
      const progress = Math.floor((now - start) / duration * point.length);
      if (progress >= point.length || target.matches(':focus-within') || !target.isConnected) {
        finish(target, range);
      } else if (progress > 0) {
        const [node, offset] = point[progress - 1];
        range.setStart(node, offset);
      }
    }
    if (active.size) frame = requestAnimationFrame(tick);
  }

  motion.addEventListener('change', () => {
    if (!motion.matches) return;
    cancelAnimationFrame(frame);
    frame = 0;
    active.clear();
    pending.clear();
  });

  return (target, { delay = 0, pace = 19, limit = 850 } = {}) => {
    if (!target?.textContent.trim() || target.matches(':focus-within')) return delay;
    const text = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
    const point = [];
    let node;
    while ((node = text.nextNode())) {
      const parts = segmenter ? segmenter.segment(node.data) : Array.from(node.data, segment => ({ segment }));
      let offset = 0;
      for (const { segment } of parts) {
        offset += segment.length;
        point.push([node, offset]);
      }
    }
    if (!point.length) return delay;
    const first = point[0][0];
    const [last, end] = point.at(-1);
    const range = document.createRange();
    range.setStart(first, 0);
    range.setEnd(last, end);
    const duration = Math.min(limit, point.length * pace);
    active.set(target, { start: performance.now() + delay, duration, point, range });
    pending.add(range);
    if (!frame) frame = requestAnimationFrame(tick);
    return delay + duration;
  };
}

// Set up after all deferred scripts, including the writeup archive renderer.
document.addEventListener('DOMContentLoaded', () => {
  setupExplorer();
  setupDepthRuler();
  setupArchiveArt();
  setupBackToTop();
  if (motion.matches) return;
  const typeText = createTextTyper(motion);
  const hero = document.querySelector('.hero-copy');
  if (hero && hero.getBoundingClientRect().top < innerHeight && hero.getBoundingClientRect().bottom > 0 && !location.hash) {
    const welcomeDone = typeText(hero.querySelector('.hero-eyebrow'), { pace: 10 });
    const titleDone = typeText(hero.querySelector('h1'), { delay: welcomeDone, pace: 17 });
    typeText(hero.querySelector('.hero-description'), { delay: titleDone, pace: 7, limit: 620 });
  }
  if (!('IntersectionObserver' in window)) return;
  const textSelector = 'h2, h3, p, .tags li, .entry-link, .actions a, #resume';
  const contentSelector = '.project, .entry-row, .field-carousel, .about-content, .contact-panel, .archive-article > p, .archive-article .actions:not(:empty)';
  function clearReveal(event) {
    if (event.animationName === 'scroll-reveal') event.target.classList.remove('scroll-arriving');
  }
  document.addEventListener('animationend', clearReveal);
  document.addEventListener('animationcancel', clearReveal);

  const reveal = new IntersectionObserver((entries, observer) => {
    for (const { target, isIntersecting } of entries) {
      if (!isIntersecting) continue;
      observer.unobserve(target);
      if (motion.matches || target.matches(':focus-within')) continue;
      if (target.matches(textSelector)) typeText(target);
      if (target.matches(contentSelector)) target.classList.add('scroll-arriving');
    }
  }, { rootMargin: '0px 0px -5% 0px', threshold: 0 });

  for (const element of document.querySelector('main').querySelectorAll(`${textSelector}, ${contentSelector}`)) {
    if (!element.closest('.hero, [hidden]') && element.getBoundingClientRect().top >= innerHeight) reveal.observe(element);
  }
});
