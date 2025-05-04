# Padel Team Generator

A Next.js application for generating balanced padel teams and matches.

## Features

- Two side-by-side text boxes for entering player names (Left and Right players)
- Sample data buttons to quickly populate player lists
- Intelligent team generation algorithm that respects player side preferences
- Match generation for pairing teams against each other
- Support for "Subs" - players who couldn't be assigned to teams

## Deployment

This application is configured for deployment on GitHub Pages.

### Manual Deployment

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the application: `npm run build`
4. The static export will be generated in the `out` directory

### Automatic Deployment

This repository is configured with GitHub Actions to automatically deploy to GitHub Pages whenever changes are pushed to the main branch.

To set up automatic deployment:

1. Push this repository to GitHub
2. Go to your repository settings
3. Navigate to "Pages" in the sidebar
4. Under "Build and deployment", select "GitHub Actions" as the source
5. The application will be automatically deployed when changes are pushed to the main branch

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## License

MIT
