# Dennis Hagemeijer Portfolio

Build the foundation of a photography portfolio and print-sales website called "Dennis Hagemeijer Fotografie" (Dutch UI language).

Core structure needed now:
- Auth: an admin account (single admin role is fine for now) that can log in and access an admin dashboard.
- Data model: Collections (e.g. Macro, Natuur, Street, Voetbal), each with a name, description, and a cover photo. Collections can contain Subcollections (e.g. within Voetbal, a subcollection per match with team names and a date). Each (sub)collection contains Photos (image file, title, upload date).
- Admin dashboard: create/edit/delete collections and subcollections, upload photos into a (sub)collection, reorder/delete photos.
- Public pages:
  1. Home — hero/intro, a showcase of recent/example photos, and a simple news feed (short posts with title, date, body) that the admin can create/edit/delete from the dashboard.
  2. Collecties — grid of the top-level collections, each showing its cover photo and the number of subcollections (or photos if it has none) inside it. Clicking a collection shows its subcollections/photos.
  3. Over de fotograaf — a simple bio/about page (static content editable later).
  4. Contact — contact details and a simple contact form.
- Keep styling clean, black/white with a dark red accent (#BD1622) for now — I'll refine branding and provide a logo later, so keep the visual design simple and easy to restyle.

Not needed yet, skip for now: payments, purchase/download flow, watermarking, screenshot protection. We'll add those in a later phase.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://dennishagemeijer.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e1bf20e3-9f2a-4fc7-8784-fd28248c3f12).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
