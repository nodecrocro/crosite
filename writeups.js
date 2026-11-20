(() => {
  const params = new URLSearchParams(location.search);
  const content = byId('archive-content');
  const path = byId('archive-path');
  const events = publishedEntries(portfolio.ctfEvents);
  const notes = publishedEntries(portfolio.writeups);
  const match = (items, id) => items.find(item => String(archiveKey(item)) === id);
  const eventId = params.get('event');
  const categoryId = params.get('category');
  const challengeId = params.get('challenge');
  const noteId = params.get('note');

  function node(tag, text, className) {
    const element = document.createElement(tag);
    element.textContent = text;
    if (className) element.className = className;
    return element;
  }

  function trail(label, url) {
    if (url) {
      appendLink(path, { label, url }, 'breadcrumb-link');
      return;
    }
    const here = node('span', label);
    here.setAttribute('aria-current', 'page');
    path.append(here);
  }

  function heading(title, description = '') {
    byId('archive-title').textContent = title;
    const note = byId('archive-note');
    note.textContent = description;
    note.hidden = !description;
    document.title = `${title} | Crosite`;
  }

  function list(title, entries, empty, describe, urlFor, action) {
    const section = node('section', '', 'archive-group');
    section.append(node('h2', title));
    const rows = node('div', '', 'rows record-list');
    if (!entries.length) rows.append(node('p', empty));
    for (const item of entries) {
      const row = node('article', '', 'entry-row');
      const copy = node('div', '', 'archive-copy');
      const meta = describe(item);
      if (meta) copy.append(node('p', meta, 'entry-label'));
      copy.append(node('h3', item.title));
      if (item.summary) copy.append(node('p', item.summary, 'summary'));
      row.append(copy);
      const link = appendLink(row, { label: action, url: urlFor(item) }, 'text-button entry-link');
      link.setAttribute('aria-label', `${action}: ${item.title}`);
      rows.append(row);
    }
    section.append(rows);
    content.append(section);
  }

  function article(item) {
    const entry = node('article', '', 'archive-article');
    const meta = entryLabel(item, item.category);
    if (meta) entry.append(node('p', meta, 'entry-label'));
    if (item.body?.length) appendParagraphs(entry, item.body);
    else entry.append(node('p', 'This writeup has not been published yet.'));
    const links = node('div', '', 'actions');
    for (const link of item.links ?? []) appendLink(links, link);
    entry.append(links);
    content.append(entry);
  }

  function missing() {
    heading('Writeup not found', 'This address does not match an item in the archive.');
    trail('Not found');
    appendLink(content, { label: 'Back to the archive', url: writeupsUrl() }, 'button button-outline');
  }

  const count = (entries, one, many = `${one}s`) => `${entries?.length ?? 0} ${entries?.length === 1 ? one : many}`;
  trail('Home', 'index.html');
  if (!params.has('event') && !params.has('category') && !params.has('challenge') && !params.has('note')) {
    trail('Writeups');
    heading('Writeups', portfolio.writeupsIntro);
    if (!events.length && !notes.length) {
      content.append(node('p', 'Writeups coming soon', 'page-note'));
      return;
    }
    list('CTF events', events, 'No CTF events have been added yet.',
      item => entryLabel(item, count(publishedEntries(item.categories), 'category', 'categories')),
      item => writeupsUrl({ event: archiveKey(item) }), 'Browse event');
    list('General notes', notes, 'No general notes have been added yet.',
      item => entryLabel(item, item.category),
      item => writeupsUrl({ note: archiveKey(item) }), 'Read note');
    return;
  }

  trail('Writeups', writeupsUrl());
  if (noteId && !eventId && !categoryId && !challengeId) {
    const note = match(notes, noteId);
    if (!note) return missing();
    trail(note.title);
    heading(note.title, note.summary);
    return article(note);
  }

  const event = eventId && match(events, eventId);
  if (!event || noteId || (challengeId && !categoryId)) return missing();
  const categories = publishedEntries(event.categories);
  if (!categoryId) {
    trail(event.title);
    heading(event.title, event.summary || 'Choose a challenge category.');
    return list('Categories', categories, 'No categories have been added for this event yet.',
      item => count(publishedEntries(item.challenges), 'challenge'),
      item => writeupsUrl({ event: eventId, category: archiveKey(item) }), 'Browse category');
  }

  trail(event.title, writeupsUrl({ event: eventId }));
  const category = match(categories, categoryId);
  if (!category) return missing();
  const challenges = publishedEntries(category.challenges);
  if (!challengeId) {
    trail(category.title);
    heading(category.title, category.summary || `Challenges from ${event.title}.`);
    return list('Challenges', challenges, 'No challenges have been added for this category yet.',
      item => entryLabel(item),
      item => writeupsUrl({ event: eventId, category: categoryId, challenge: archiveKey(item) }), 'Read writeup');
  }

  trail(category.title, writeupsUrl({ event: eventId, category: categoryId }));
  const challenge = match(challenges, challengeId);
  if (!challenge) return missing();
  trail(challenge.title);
  heading(challenge.title, challenge.summary);
  article(challenge);
})();
