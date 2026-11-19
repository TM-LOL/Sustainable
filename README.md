# Sustainable Energy Center of Excellence website (GitHub Pages)

A static site: no server, no database, nothing to install.

## Publish on GitHub Pages
1. Create a repository on github.com. Upload every file in this folder, including the hidden `.nojekyll` file.
2. Open **Settings > Pages**. Under **Build and deployment**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`, then **Save**.
3. After about a minute the site is live at `https://YOUR-USERNAME.github.io/REPO-NAME/`.

## Update content (edit files on github.com with the pencil icon)
- **Logo:** upload the AASTU logo as `assets/logo.png`. Until then a text mark shows.
- **Documents:** upload the file into `files/`, then add an entry to `data/documents.json`:
  `{"title":"Budget template","description":"...","category":"budgeting-finance","file":"files/budget-template.xlsx","version":"1.0","date":"2026-11-18","size":"120 KB"}`
- **News, projects, people, publications:** add objects to the matching JSON file in `data/`. Fields:
  - news: `title, category, summary, date`
  - projects: `title, category (internal|external|consultancy|transfer|community), themes (e.g. ["hydrogen"]), description, pi, year, status`
  - people: `name, category (e.g. "Center Leadership"), position, interests, email`
  - publications: `title, authors, year, type, venue, doi, themes`
- Colors are the `--navy`, `--gold` and `--silver` values at the top of `assets/style.css`.

## Important: everything here is public
GitHub Pages cannot password-protect files. Never upload confidential grant applications, financial records or personal data. Only publish documents you are happy for anyone to download.

## Members: login, private documents, admin uploads (optional)
Without this, the site is fully public. To switch member login on you need a free Supabase project (database + file storage + login):
1. Create a project at supabase.com. In **SQL Editor**, run `supabase/setup.sql`.
2. **Authentication > Providers > Email**: turn OFF "Allow new users to sign up". Add members under **Authentication > Users > Add user** (tick auto-confirm).
3. Make yourself administrator by running the last (commented) line of `setup.sql` with your email.
4. **Project Settings > API**: copy the Project URL and the `anon` public key into `assets/config.js`. Never use the `service_role` key.
5. Commit. Log in at #login; administrators then see an Upload form on the Resources page.
Files are stored in a private bucket; Supabase checks permissions on its servers for every download.
