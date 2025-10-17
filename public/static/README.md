Static assets for print and other pages.

Place the FIUNI logo at:

- fiuni-logo.png (referenced in code as withBase('/static/fiuni-logo.png'))

Notes:
- Files in this folder are served by Vite as-is at /static/*.
- In production, withBase keeps paths correct if the app is deployed under a base path.
- If you change the filename, update src/pages/resolutions/print-resolution-page.jsx accordingly.
