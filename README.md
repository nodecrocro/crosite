# Personal portfolio

Open `index.html` in a browser. The site runs from the folder with no installation or build step.

## Add your information

Edit `portfolio.js` to change the content. Records marked `sample: true` are excluded from the rendered site.

| Field | What to enter |
| --- | --- |
| `name`, `intro`, `bio`, `skills` | Your brand name, opening paragraph, bio paragraphs, and skills. Put your full name in `bio` if it differs from the brand. |
| `projects` | A short summary and any number of `body` paragraphs. Use `links` for a demo or repository. Add `image` and `imageAlt` to show a screenshot. |
| `fieldNotes` | Photos with a story: `title`, `location`, `date`, `image`, `imageAlt`, `imageWidth`, `imageHeight`, and `body` (paragraphs). See the Digital Dragons entry. |
| `activities` | Competition participation and event crew roles shown under Field notes: `title`, `date`, `summary`, and optional `url`. |
| `ctfEvents` | Events, with categories and challenge writeups. See the data shape below. |
| `writeupsIntro` | The opening paragraph on the Writeups page. |
| `writeups` | General notes apart from CTF events. Use an `id`, title, category, optional date, summary, `body` paragraphs, and optional `links`. |
| `experience` | Homepage entries: `title`, `organization`, `date`, `summary`, and optional `url`. |
| `achievements` | Homepage entries: `title`, `issuer`, `date`, `summary`, and optional `url`. |
| `certifications` | The credential title, issuer, date, and optional verification URL or certificate PDF. |
| `resume` | A path to your résumé, such as `assets/resume.pdf`, or a public URL. |
| `contact` | A short `description`, your email address, and links to public profiles. |

The Field notes gallery follows the order in `fieldNotes`. When it has more than one entry, readers can swipe, use the previous/next controls, or focus the gallery and press the arrow keys. It advances every six seconds while visible and not being interacted with; readers can pause it, and reduced-motion mode disables autoplay.

### CTF archive data

In `portfolio.js`, add entries to `ctfEvents`. Each event contains a `categories` array, and each category contains a `challenges` array. Give each item a stable `id` (unique within its parent) so bookmarked links keep working after you rename titles.

```js
ctfEvents: [{
  id: 'event-id', title: 'Event name', date: '', summary: '',
  categories: [{
    id: 'category-id', title: 'Category name',
    challenges: [{
      id: 'challenge-id', title: 'Challenge name',
      summary: '', body: ['Your writeup paragraphs go here.'], links: [],
    }],
  }],
}],
```

`writeups.html` lists your CTF events and general notes. Each event, category, and challenge has its own bookmarkable address. `certifications.html` lists your credentials separately. The homepage shows up to three recent published writeups (CTF challenges and general notes) and three recent certifications. Use the writeup’s publication date and the certification’s earned date in `date`, preferably as `YYYY-MM-DD` (or `YYYY-MM` or `YYYY`). The homepage places undated entries after dated ones. Use `dateLabel` for a reader-facing date or range while keeping `date` sortable. To keep drafts private, leave them out of files you upload; `sample: true` hides them from the rendered site, not the source.

Put local images and PDFs in `assets/`. Use browser paths such as `assets/my-certificate.pdf`. Each button in a `links` or `profiles` list uses an object with `label` and `url` fields.

The hero globe is rendered as ASCII by `earth.js`, using a small local land mask derived from [Natural Earth](https://www.naturalearthdata.com/) public-domain data. Pause it with the control above the art; it also stops offscreen or when reduced motion is enabled. WebTect uses the supplied logo artwork; the contact illustration is ASCII. Set `image` and `imageAlt` in `portfolio.js` to change a project image.

On desktop, the **Depth** ruler sits flush against the right edge. Move the pointer near it or focus one of its controls to expand the scale and see tenths of a percent. The wheel scrolls more slowly over the ruler. Click a section label to jump to it, click or drag the scale, or focus the slider and use the arrow keys, Home, and End. Section labels travel from the ruler to their headings when active and return when you leave the section. Reduced-motion mode updates labels instantly. Touch devices, smaller windows, and forced-colors mode keep native scrolling and the browser’s scrollbar behavior. Use the floating **Back to top** arrow after scrolling past the intro, or the link in the footer.

Use the browser-style tabs to switch between Home, Writeups, Certifications, Achievements, Projects, and Work experience. Explorer lists only shortcuts within the current page. It stays visible with a short empty-state message when there is nothing to index. Collapse it to `[+]`; its open or closed state is remembered during navigation in the same browser tab. The homepage previews up to three work experience entries, achievements, and projects; their dedicated pages list the full set. Below the hero, headings and body text type in once as they enter the viewport, with cards fading and sliding into place. Unsupported browsers show the text normally. These effects are disabled when reduced motion is enabled.

If you host the site, upload `index.html`, `writeups.html`, `certifications.html`, `achievements.html`, `experience.html`, `projects.html`, `styles.css`, `site.js`, `writeups.js`, `earth.js`, `portfolio.js`, and `assets/` together. Only include files you want visitors to be able to download. Leave the backup ZIPs out of your public upload.
