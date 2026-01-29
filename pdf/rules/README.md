# Rule PDFs

PDF files for rules are **not** stored in the database. The `Rule` entity has a `downloadLink` field (path or filename); the actual files are served from this directory.

- **In DB:** `Rule.downloadLink` — string, e.g. `2021-Book-of-Rules.pdf` or `/mnt/data/2021-Book-of-Rules.pdf` (frontend uses filename only).
- **On disk:** Place PDF files here; they are served at `GET /pdf/rules/<filename>`.

Copy PDFs from the frontend repo: `app-archery/public/pdf/rules/*.pdf` → this folder.
