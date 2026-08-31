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

<div class="mx-auto w-full max-w-md p-3 sm:p-6">
  <h1 class="text-base font-semibold tracking-tight sm:text-2xl">Gitea Mark Files Read</h1>
  <p class="mt-1 text-xs text-muted-foreground sm:mt-2 sm:text-sm">
    Configure the Gitea hosts and file paths that the PR action may update.
  </p>

  <form class="mt-4 space-y-3 sm:mt-8 sm:space-y-6" onsubmit={submit}>
    <label class="block space-y-1 sm:space-y-2">
      <span class="text-xs font-medium sm:text-sm">Gitea origins</span>
      <textarea
        class="min-h-16 w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-24 sm:px-3 sm:py-2 sm:text-sm"
        placeholder="https://git.example.com"
        bind:value={hostsText}
        aria-describedby="hosts-help"
      ></textarea>
      <span id="hosts-help" class="text-[11px] text-muted-foreground sm:text-xs">
        One origin per line. The extension will request access only for these hosts.
      </span>
    </label>

    <label class="block space-y-1 sm:space-y-2">
      <span class="text-xs font-medium sm:text-sm">Full file path regex</span>
      <input
        class="h-8 w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-10 sm:px-3 sm:py-2 sm:text-sm"
        placeholder="^(OKF|bruno)/.*"
        bind:value={pattern}
        aria-describedby="pattern-help"
      />
      <span id="pattern-help" class="text-[11px] text-muted-foreground sm:text-xs">
        The expression is matched against the complete repository-relative path.
      </span>
    </label>

    {#if error}
      <p class="text-sm text-destructive" role="alert">{error}</p>
    {:else if message}
      <p class="text-sm text-green-700" role="status">{message}</p>
    {/if}

    <Button type="submit" size="sm" disabled={saving}>
      {saving ? "Saving..." : "Save settings"}
    </Button>
  </form>
</div>
