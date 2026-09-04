import { mount } from "svelte";
import App from "./App.svelte";
import { getSettings, normalizeOrigin } from "$lib/settings";
import contentStyles from "./content.css?inline";

const fullPullFilesPath = /\/pulls\/\d+\/files\/?$/;
const pullFilesPath = /\/pulls\/\d+\/files(?:\/[^/]+\.\.[^/]+)?\/?$/;

async function start() {
  if (!pullFilesPath.test(location.pathname)) return;

  const settings = await getSettings();
  if (!settings.hosts.some((host) => normalizeOrigin(host) === location.origin)) return;

  const target = document.querySelector<HTMLElement>(".diff-detail-actions");
  if (!target || document.getElementById("gitea-mark-files-read-root")) return;

  const root = document.createElement("div");
  root.id = "gitea-mark-files-read-root";
  target.prepend(root);

  const shadowRoot = root.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = contentStyles;
  shadowRoot.append(style);

  const mountTarget = document.createElement("div");
  shadowRoot.append(mountTarget);

  mount(App, {
    target: mountTarget,
    props: { pattern: settings.pattern, canMarkFiles: fullPullFilesPath.test(location.pathname) },
  });
}

void start();
