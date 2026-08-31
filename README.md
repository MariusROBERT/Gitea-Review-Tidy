# Gitea Mark Files Read

A cross-browser WebExtension that makes Gitea pull request reviews easier to manage. Configure a file-path regular expression, then mark all matching files as viewed or hide them from the diff and file tree.

The extension works with self-hosted Gitea instances. It has no backend or separate account: settings are stored with the browser's extension storage, and access is requested only for the Gitea origins you configure.

## Features

- Mark matching pull request files as viewed in one action.
- Hide matching files from the pull request diff and file tree.
- Configure multiple Gitea origins.
- Match complete repository-relative file paths with a regular expression.
- Use the same extension build in Chrome and Firefox.

## Configure

Open the extension options and enter:

1. One Gitea origin per line, for example `https://git.example.com`.
2. A regular expression matching the complete repository-relative file path, for example `^(src|docs)/.*`.

The extension requests host access only for the configured origins. After saving, open a Gitea pull request's changed-files view. Use **Mark matching files read** to update matching files, or enable **Hide matching files** to remove them from the review view.

## Local Development

The project requires Node.js 22 or newer.

Install dependencies and run the checks:

```sh
npm ci
npm run check
```

Build the extension:

```sh
npm run build
```

The production extension is written to `dist/`. The build combines the options page, background script, and content script into a browser-loadable extension directory.

## Load Locally

### Chrome

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Choose **Load unpacked**.
4. Select the `dist/` directory.

### Firefox

1. Open `about:debugging#/runtime/this-firefox`.
2. Choose **Load Temporary Add-on**.
3. Select `dist/manifest.json`.

The local Firefox installation is temporary and is removed when Firefox restarts. The release workflow creates a signed, unlisted XPI for normal installation.

## Package Locally

The local Firefox packaging command creates an unsigned XPI in `artifacts/`:

```sh
npm run package:firefox
```

For published release packages, create a version tag such as `v0.1.0` and push it. The GitHub Actions workflow in `.github/workflows/release.yml` builds the extension, injects the tag version into the manifest, signs the Firefox package through AMO, and attaches these files to a GitHub Release:

```text
gitea-mark-files-read-<version>-chrome.zip
gitea-mark-files-read-<version>-firefox.xpi
SHA256SUMS.txt
```

The Chrome ZIP contains the extension files at its root. Chrome users must extract it before using **Load unpacked**. The same ZIP can later be submitted to the Chrome Web Store.

## UI Stack

The extension is built with Svelte 5, TypeScript, Vite, and Tailwind CSS.

UI components are locally maintained and based on [shadcn-svelte](https://www.shadcn-svelte.com/).
