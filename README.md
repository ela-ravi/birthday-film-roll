> 🚀 **Live app: https://YOUR-SITE.netlify.app** (replace with your Netlify site URL; it never changes between deploys)

# Birthday Film Roll

Turn your photos into **one password-protected HTML file** that plays as a slideshow with captions. Send the file, or host it anywhere (Netlify Drop, GitHub Pages). Without the password, nobody can see the photos.

## Option A: No install (for everyone)

1. Double-click **`film-roll-maker.html`** (or open it from a hosted link, see below).
2. Enter the name, add photos, type optional captions, and choose a password.
3. Click **Create my film roll**. You get `<name>_Birthday_Protected.html` in your Downloads folder.

Everything runs in your browser and your photos are never uploaded. It works in Chrome, Safari and Edge.

**Hosting the maker as a link:** `film-roll-maker.html` is a single static file. Upload it to GitHub Pages or Netlify Drop and share the link. Non-technical friends can then use it without downloading anything.

## Option B: Command line (for developers)

1. Install [Node.js](https://nodejs.org) 18 or newer.
2. Put your photos (`.jpg`, `.jpeg`, `.png`, `.webp`) in the `photos/` folder. They play in filename order, so name them `01_...`, `02_...` to control the order.
3. Copy `config.example.json` to `config.json` and set the person's name. Optionally copy `captions.example.json` to `captions.json` and add captions keyed by filename. Both are git-ignored, so they stay private:
   ```json
   { "name": "Anitha", "photoSeconds": 2.5, "maxPixels": 1280, "jpegQuality": 70 }
   ```
4. Build:
   ```bash
   npm install        # first time only
   npm run build      # asks for a password (empty = generates one)
   ```
   To skip the prompt: `PASSWORD='your password' npm run build`

The result is `dist/<name>_Birthday_Protected.html`, for example `dist/Anitha_Birthday_Protected.html`.

## Notes

- **Password:** it is not stored anywhere. If you lose it, create the file again with a new one.
- **Encryption:** the slideshow is encrypted with AES-256-GCM, with the key derived from your password using PBKDF2 (600,000 rounds). A long password is safer than a short one if the link is public. Both options produce the same file format.
- **Browsers:** the finished file must be opened in a modern browser. Some in-app browsers (WhatsApp, Instagram) fail, so tell people to open it in Chrome or Safari.
- **Photo quality:** photos are resized to 1280 px on the longest edge and re-compressed, which keeps the file small. For the command line, raise `maxPixels` or `jpegQuality` for sharper images and a bigger file.
- **Privacy:** `photos/`, `dist/`, `config.json` and `captions.json` are in `.gitignore`, so personal content is not committed.

## Customising

`src/slideshow.html` is the player, `src/gate.html` is the password screen, and `src/builder.html` is the maker page. After editing anything in `src/`, regenerate the single-file maker:

```bash
npm run build:ui
```

## Automatic deploys (Netlify)

Every push to `main` that changes `src/` (or the workflow) rebuilds `film-roll-maker.html` and deploys it to Netlify as `index.html`. The site URL stays the same, so the link at the top of this README is set once by hand. Only the maker app is deployed. Your photos never are.

One-time setup:

1. In Netlify, create a site (for example "Add new site > Deploy manually" with any file). Copy its **Site ID** from *Site configuration > Site details*.
2. Create a **personal access token** at *User settings > Applications > Personal access tokens*.
3. In GitHub, open *Settings > Secrets and variables > Actions* and add two repository secrets: `NETLIFY_AUTH_TOKEN` (the token) and `NETLIFY_SITE_ID` (the Site ID).
4. Push to `main`, or run the workflow by hand from the *Actions* tab.
