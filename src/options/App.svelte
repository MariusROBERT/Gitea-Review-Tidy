<script lang="ts">
  import { onMount } from "svelte";
  import { Button } from "$lib/components/ui/button";
  import { extensionApi } from "$lib/extension";
  import {
    getSettings,
    hostMatchPattern,
    normalizeOrigin,
    saveSettings,
    validPattern,
  } from "$lib/settings";

  let hostsText = $state("");
  let pattern = $state("");
  let message = $state("");
  let error = $state("");
  let saving = $state(false);

  onMount(async () => {
    try {
      const settings = await getSettings();
      hostsText = settings.hosts.join("\n");
      pattern = settings.pattern;
    } catch (cause) {
      error = cause instanceof Error ? cause.message : "Unable to load settings.";
    }
  });

  async function save() {
    message = "";
    error = "";

    const hosts = [...new Set(hostsText.split(/[\n,]/).map(normalizeOrigin).filter(Boolean))] as string[];
    if (!hosts.length) {
      error = "Add at least one valid http or https Gitea origin.";
      return;
    }
    if (!validPattern(pattern)) {
      error = "Enter a valid non-empty regular expression.";
      return;
    }

    saving = true;
    try {
      const granted = await extensionApi.permissions.request({
        origins: hosts.map(hostMatchPattern),
      });
      if (!granted) {
        error = "Host permission was not granted.";
        return;
      }

      await saveSettings({ hosts, pattern });
      await extensionApi.runtime.sendMessage({ type: "sync-content-scripts" });
      hostsText = hosts.join("\n");
      message = "Settings saved.";
    } catch (cause) {
      error = cause instanceof Error ? cause.message : "Unable to save settings.";
    } finally {
      saving = false;
    }
  }

  function submit(event: SubmitEvent) {
    event.preventDefault();
    void save();
  }
</script>

<svelte:head>
  <title>Gitea Mark Files Read</title>
</svelte:head>

<div class="mx-auto max-w-2xl p-6">
  <h1 class="text-2xl font-semibold tracking-tight">Gitea Mark Files Read</h1>
  <p class="mt-2 text-sm text-muted-foreground">
    Configure the Gitea hosts and file paths that the PR action may update.
  </p>

  <form class="mt-8 space-y-6" onsubmit={submit}>
    <label class="block space-y-2">
      <span class="text-sm font-medium">Gitea origins</span>
      <textarea
        class="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        placeholder="https://git.example.com"
        bind:value={hostsText}
        aria-describedby="hosts-help"
      ></textarea>
      <span id="hosts-help" class="text-xs text-muted-foreground">
        One origin per line. The extension will request access only for these hosts.
      </span>
    </label>

    <label class="block space-y-2">
      <span class="text-sm font-medium">Full file path regex</span>
      <input
        class="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        placeholder="^src/.*\\.ts$"
        bind:value={pattern}
        aria-describedby="pattern-help"
      />
      <span id="pattern-help" class="text-xs text-muted-foreground">
        The expression is matched against the complete repository-relative path.
      </span>
    </label>

    {#if error}
      <p class="text-sm text-destructive" role="alert">{error}</p>
    {:else if message}
      <p class="text-sm text-green-700" role="status">{message}</p>
    {/if}

    <Button type="submit" disabled={saving}>
      {saving ? "Saving..." : "Save settings"}
    </Button>
  </form>
</div>
