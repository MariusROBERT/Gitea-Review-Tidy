import { extensionApi } from "$lib/extension";
import { getSettings, hostMatchPattern } from "$lib/settings";

const contentScriptId = "gitea-mark-files-read";

async function syncContentScripts() {
  const settings = await getSettings();
  const permittedHosts: string[] = [];

  for (const host of settings.hosts) {
    const pattern = hostMatchPattern(host);
    if (await extensionApi.permissions.contains({ origins: [pattern] })) {
      permittedHosts.push(pattern);
    }
  }

  try {
    await extensionApi.scripting.unregisterContentScripts({ ids: [contentScriptId] });
  } catch {
    // No registration exists on first install.
  }

  if (!permittedHosts.length) return;

  await extensionApi.scripting.registerContentScripts([
    {
      id: contentScriptId,
      matches: permittedHosts,
      js: ["content.js"],
      runAt: "document_idle",
      persistAcrossSessions: true,
    },
  ]);
}

async function openSettings() {
  try {
    const settings = await getSettings();
    const origins = settings.hosts.map(hostMatchPattern);

    if (origins.length && !(await extensionApi.permissions.contains({ origins }))) {
      await extensionApi.permissions.request({ origins });
    }
  } catch (cause) {
    console.error("Unable to request host permissions:", cause);
  }

  await extensionApi.windows.create({
    url: extensionApi.runtime.getURL("index.html"),
    type: "popup",
    width: 520,
    height: 420,
  });
}

extensionApi.runtime.onInstalled.addListener(() => void syncContentScripts());
extensionApi.runtime.onStartup.addListener(() => void syncContentScripts());
extensionApi.action.onClicked.addListener(() => void openSettings());
extensionApi.storage.onChanged.addListener(() => void syncContentScripts());
extensionApi.runtime.onMessage.addListener((message) => {
  if (message?.type === "sync-content-scripts") void syncContentScripts();
});
