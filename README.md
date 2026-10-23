# Resident Evil — Series Archive

A multi-page fan website about the **Resident Evil** survival horror series, built with plain HTML5, CSS3 and vanilla JavaScript, plus a small Python backend that stores the results of an interactive personnel assessment form.

The site covers the main characters, the iconic weapons, the mainline games, a complete chronology of games, remakes, spin-offs and films (1996–2026), and a quiz-style form that matches the visitor with a character from the series.

---

## Features

- **Six themed pages** with a shared sticky navigation bar and a dark "Umbrella Corporation" look.
- **Clickable image map** on the home page — five zones (four quadrants plus a central circle) link to every section, with labels that appear on hover. The map coordinates scale automatically on small screens.
- **Character and weapon cards** in alternating left/right layout.
- **Release table** of all ten mainline games and a **26-entry chronology** grouped by decade.
- **Personnel Assessment form** with:
  - client-side and server-side validation (Unicode names are accepted, e.g. "Ștefan");
  - inline error messages for every field, including radio-button groups;
  - a live completion progress bar;
  - an animated result panel showing the matched character, clearance level and psychological profile;
  - automatic fallback to local processing when the backend is not running.
- **Visual effects**: scroll reveal, typewriter text, red cursor trail, scroll glitch, animated dividers, counting year numbers and a glitching title. Effects are disabled for users who prefer reduced motion, and the cursor trail is disabled on touch screens.
- **Responsive layout** for desktop, tablet and phone widths.

---

## Project structure

```
LAB_4_TWEB/
├── index.html            Home page (hero, image map, contents, quick links)
├── style.css             All styles for the website
├── effects.js            Visual effects and responsive image map
├── form-script.js        Assessment form logic (validation, progress, results)
├── start_server.py       Local web server with the form backend
├── cgi-bin/
│   └── submit.py         Form validation, character matching and data storage
├── pages/
│   ├── page2.html        Characters
│   ├── page3.html        Weapons
│   ├── page4.html        Games and release timeline
│   ├── page5.html        Full chronology (games, remakes, spin-offs, films)
│   └── page6.html        Personnel Assessment form
├── images/               All images used by the site
└── data/
    └── submissions.txt   Created automatically when the first form is submitted
```

---

## Requirements

- Any modern web browser (Chrome, Edge, Firefox, Safari).
- **Python 3.8 or newer** — only needed to save form submissions. No third-party packages are required.

---

## Running the project

### Option 1 — with the backend (recommended)

1. Open a terminal in the `LAB_4_TWEB` folder.
2. Run:

   ```bash
   python start_server.py
   ```

   On macOS/Linux you may need `python3 start_server.py`.

3. The home page opens automatically at `http://localhost:8080/index.html`.
4. Press **Ctrl+C** in the terminal to stop the server.

Optional settings:

| Setting | Example | Effect |
|---|---|---|
| Custom port | `python start_server.py 9000` | Starts the server on port 9000 |
| No browser | `NO_BROWSER=1 python start_server.py` | Does not open the browser automatically |

### Option 2 — without the backend

Open `index.html` directly in a browser. Every page works; the assessment form still shows its result, but the submission is not saved and the result panel shows a "Local result only" notice.

---

## How the assessment works

The form has four modules: **Identity**, **Tactical Profile**, **Psychological** and **Intelligence Report**.

| Field | Rule |
|---|---|
| Full legal name | Required, 2–60 characters, letters (any alphabet), spaces, apostrophes, hyphens |
| Field codename | Required, 2–30 characters, Latin letters, digits, `_`, `-`, spaces |
| Email | Required, valid email format, up to 100 characters |
| Weapon, favourite entry | Required, must be one of the listed options |
| Threat response, priority | Required, one radio option each |
| Field report | Optional, up to 800 characters |

Each answer adds points to a score. The total decides the character match:

| Score | Character | Clearance |
|---|---|---|
| 9 or more | Albert Wesker | CLASSIFIED |
| 4 – 8 | Chris Redfield | ALPHA |
| 2 – 3 | Leon S. Kennedy | DELTA |
| 0 – 1 | Claire Redfield | GAMMA |
| below 0 | Jill Valentine | OMEGA |

The same rules are applied in the browser (`form-script.js`) and on the server (`cgi-bin/submit.py`), so the result is identical in both modes.

### Backend API

`POST /cgi-bin/submit.py` with an `application/x-www-form-urlencoded` body.

Successful response:

```json
{
  "success": true,
  "character": { "name": "Chris Redfield", "role": "...", "clearance": "ALPHA", "color": "#4a9fd4", "bio": "..." },
  "codename": "STAR-01",
  "message": "All clear."
}
```

Validation failure:

```json
{ "success": false, "errors": { "email": "Invalid email address." } }
```

Each accepted submission is appended to `data/submissions.txt`. Direct browser access to `/cgi-bin/` and `/data/` is blocked by the server. `submit.py` can also be used as a standard CGI script on any CGI-capable web server.

---

## Technologies

- HTML5 (semantic layout, image maps, forms, tables)
- CSS3 (custom properties, Flexbox, Grid, animations, `:has()`, media queries)
- JavaScript ES6 (IntersectionObserver, Fetch API, requestAnimationFrame)
- Python 3 standard library (`http.server`, `urllib.parse`, `json`, `re`)
- Google Fonts: Share Tech Mono, Oswald, Rajdhani

---

## Credits

Educational laboratory project (Web Technologies, Lab 4). Resident Evil and all related names, characters and images are trademarks and property of Capcom. This is a non-commercial fan project.
