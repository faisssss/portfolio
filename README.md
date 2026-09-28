# Mohammed Faisal — Portfolio

A personal portfolio site written in plain HTML, CSS and JavaScript. It has no build step and no dependencies.

## Features
- An intro "boot" loader, a hero name that animates in letter by letter, and a typing role line
- An interactive network canvas in the hero that reacts to the mouse
- An **interactive terminal** in the About section (`help`, `whoami`, `skills`, `projects`, `sudo hire faisal`, …)
- Scroll-reveal animations, count-up stats and an experience timeline that fills as you scroll
- Project cards with 3D tilt, a cursor spotlight and an animated illustration for each project
- A custom cursor, magnetic buttons and a click-to-copy email button
- A responsive layout with a mobile menu. If the visitor's device asks for reduced motion, the animations are turned off.

## Run locally
Open `index.html` in a browser, or run:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Deploy free on GitHub Pages
1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Under **Source**, choose *Deploy from a branch*. Pick your branch and the `/ (root)` folder, then click **Save**.
4. After a minute or so, the site is live at `https://<username>.github.io/<repo>/`.

Tip: if you name the repo `<username>.github.io`, the site is served at `https://<username>.github.io`.

## Editing content
- Text, projects and links are in `index.html`.
- Colours are set as CSS variables at the top of `styles.css` (`--accent`, `--accent-2`, …).
- Terminal commands are in the `commands` object in `script.js`.
- To update the resume, replace `assets/Mohammed-Faisal-Resume.pdf`.
