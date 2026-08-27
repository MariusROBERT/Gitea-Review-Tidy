# Gitea Mark Files Read

Cross-browser WebExtension for marking matching Gitea pull request files as viewed.

## Development

```sh
npm install
npm run check
npm run build
```

For Chrome, load the `dist` directory as an unpacked extension from `chrome://extensions`.

For Firefox, open `about:debugging#/runtime/this-firefox`, choose **Load Temporary Add-on**, and select `dist/manifest.json`.

Open the extension options, add a Gitea origin such as `https://git.example.com`, and configure a full-path regular expression.
