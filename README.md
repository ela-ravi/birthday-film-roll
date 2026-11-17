# Birthday Film Roll

Turn a folder of photos into **one password-protected HTML file** that plays as a slideshow with captions. Send the file, or host it anywhere (Netlify Drop, GitHub Pages). Without the password, nobody can see the photos.

## Use it

1. Install [Node.js](https://nodejs.org) 18 or newer.
2. Put your photos (`.jpg`, `.jpeg`, `.png`, `.webp`) in the `photos/` folder. They play in filename order, so name them `01_...`, `02_...` to control the order.
3. Copy `config.example.json` to `config.json` and set the person's name (and `captions.example.json` to `captions.json` if you want captions). Both are git-ignored, so they stay private:
   ```json
   { "name": "Anitha", "photoSeconds": 2.5, "maxPixels": 1280, "jpegQuality": 70 }
   ```
4. (Optional) Add captions in `captions.json`, keyed by filename. Photos without a caption show none:
   ```json
   { "01_beach.jpg": "Our best trip ever 🌊" }
   ```
5. Build:
   ```bash
   npm install        # first time only
   npm run build      # asks for a password (empty = generates one)
   ```
   To skip the prompt: `PASSWORD='your password' npm run build`

The result is `dist/<name>_Birthday_Protected.html`, for example `dist/Anitha_Birthday_Protected.html`.

## Notes

- **Password:** it is not stored anywhere. If you lose it, rebuild with a new one.
- **Encryption:** the slideshow is encrypted with AES-256-GCM, with the key derived from your password using PBKDF2 (600,000 rounds). A long password is safer than a short one if the link is public.
- **Browsers:** the file must be opened in a modern browser. Some in-app browsers (WhatsApp, Instagram) fail, so tell people to open it in Chrome or Safari.
- **Photo quality:** photos are resized to `maxPixels` on the longest edge and re-compressed, which keeps the file small. Raise `maxPixels` or `jpegQuality` for sharper images and a bigger file.
- **Privacy:** `photos/` and `dist/` are in `.gitignore`, so personal photos are not committed.
- **Customising:** `src/slideshow.html` is the player and `src/gate.html` is the password screen. Edit them to change the look.
