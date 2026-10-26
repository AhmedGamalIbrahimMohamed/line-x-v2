# X-Line documentation

| Document | For | What it is |
| --- | --- | --- |
| [admin-guide/Admin-Dashboard-User-Guide.html](admin-guide/Admin-Dashboard-User-Guide.html) | Staff who manage projects | Step-by-step guide with screenshots. One self-contained file: open it in any browser, email it, or print it to PDF. |
| [admin-guide/Admin-Dashboard-User-Guide.md](admin-guide/Admin-Dashboard-User-Guide.md) | Staff / editors of the guide | The same guide as Markdown (images in `admin-guide/images/`). Edit this, then rebuild the HTML. |
| [admin-guide/Admin-Dashboard-Walkthrough.mp4](admin-guide/Admin-Dashboard-Walkthrough.mp4) | Staff | ≈ 4-minute captioned video tour: sign in, add a project with images, show/hide sections, publish, draft preview, reorder, delete, change password. |
| [DEVELOPER-GUIDE.md](DEVELOPER-GUIDE.md) | Developers | Setup, architecture, data model, API, conventions, recipes, testing, deployment, troubleshooting. **Start here.** |
| [PROJECT-REPORT.md](PROJECT-REPORT.md) | Owners / developers | How the project is built, its structure, and everything that was changed (bugs fixed, enhancements, test results, open items). |
| [../backend/README.md](../backend/README.md) | Developers | API setup, authentication and endpoints. |
| [../CLAUDE.md](../CLAUDE.md) | AI assistants | Short architecture summary loaded automatically by Claude Code. |

## Keeping the user guide up to date

The screenshots and video were produced from the real dashboard with a demo project ("Demo Tower"), which was deleted afterwards. When the dashboard's screens change:

1. Update `admin-guide/Admin-Dashboard-User-Guide.md` (and replace any outdated image in `admin-guide/images/`).
2. Regenerate `Admin-Dashboard-User-Guide.html` from the Markdown (it embeds the images so the file stands alone). Any Markdown-to-HTML tool works; the current file was built with the `marked` library and a small print-friendly stylesheet.
3. Re-record the video if the steps changed.
