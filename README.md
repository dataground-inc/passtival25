# PASSTIVAL 2026

Responsive PASSTIVAL ranking experience built with React, Vite, React Router,
and Framer Motion.

## Setup

Install dependencies:

```powershell
npm install
```

Start the Vite development server with either command:

```powershell
npm run dev
npm start
```

Run the automated test suite:

```powershell
npm test
```

Create a production build:

```powershell
npm run build
```

The production output is written to `dist/`.

## Configuration

Set `VITE_API_BASE` in a local `.env` file to override the default Google Apps
Script endpoint:

```dotenv
VITE_API_BASE=https://example.com/passtival-api
```

Restart the development server after changing environment variables.

## Apps Script API

The deployable spreadsheet-bound API source is
[`appscript/Code.gs`](appscript/Code.gs). It reads the `passtival_raw` sheet.

To update the deployed API:

1. Open the Apps Script project bound to the PASSTIVAL spreadsheet.
2. Replace the project's `Code.gs` with `appscript/Code.gs`.
3. Select **Deploy > Manage deployments**, edit the web app deployment, and
   choose **New version**.
4. Deploy it with access configured for the application audience.
5. Verify the `/exec` URL with both `mode=exam` and `mode=top5`.

Editing or saving Apps Script source does not update the live web app by
itself. A new deployment version must be created after every API source
change. The frontend uses the current production `/exec` URL by default;
`VITE_API_BASE` remains available to target another deployment.

## Routes

The application uses `HashRouter`, so routes remain compatible with static
GitHub Pages hosting:

- `/#/` - onboarding and participant lookup
- `/#/my-ranking` - saved participant result
- `/#/top5` - exact-group TOP 5 rankings

A refreshed personal-result route without a saved exam number redirects to the
onboarding lookup sheet.

## GitHub Pages

`vite.config.js` sets the production base to `/passtival25/`. Run
`npm run build`, then publish the generated `dist/` directory to the
`dataground-inc.github.io/passtival25` GitHub Pages project. Configure the
deployment workflow to upload `dist/` as the Pages artifact.
