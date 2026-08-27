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

extensionApi.runtime.onInstalled.addListener(() => void syncContentScripts());
extensionApi.runtime.onStartup.addListener(() => void syncContentScripts());
extensionApi.storage.onChanged.addListener(() => void syncContentScripts());
extensionApi.runtime.onMessage.addListener((message) => {
  if (message?.type === "sync-content-scripts") void syncContentScripts();
});
