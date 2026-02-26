# Nathan West — Portfolio

## Development

```bash
npm install
npm run dev
```

- `npm run build` — production build to `dist`
- `npm run preview` — preview the build locally
- `npm run lint` — run ESLint

## Deploying to GitHub Pages

1. Make sure the `base` setting in `vite.config.js` matches your repository name (e.g. `/portfolio/`).
2. Commit your changes and push to GitHub.
3. Run `npm run deploy` to publish the `dist` folder to the `gh-pages` branch.
4. Enable GitHub Pages on the repository (`Settings → Pages → Build and deployment → Deploy from branch → gh-pages / root`).

Once Pages is enabled, subsequent `npm run deploy` commands will update the live site.
