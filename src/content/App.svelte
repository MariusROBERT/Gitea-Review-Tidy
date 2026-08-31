<script lang="ts">
  import { onMount } from "svelte";
  import { Button } from "$lib/components/ui/button";
  import { Switch } from "$lib/components/ui/switch";
  import { validPattern } from "$lib/settings";
  import { processMatchingFiles, setMatchingFilesHidden } from "./process";

  let { pattern }: { pattern: string } = $props();

  let running = $state(false);
  let message = $state("");
  let hideMatchingFiles = $state(false);
  let valid = $derived(validPattern(pattern) !== null);

  function updateHiddenFiles() {
    if (!valid) return;
    setMatchingFilesHidden(new RegExp(`^(?:${pattern})$`), hideMatchingFiles);
  }

  function toggleHiddenFiles(checked: boolean) {
    hideMatchingFiles = checked;
    updateHiddenFiles();
  }

  onMount(() => {
    const observer = new MutationObserver(() => {
      if (hideMatchingFiles) updateHiddenFiles();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  });

  function run() {
    if (!valid || running) return;

    running = true;
    message = "";
    const regex = new RegExp(`^(?:${pattern})$`);
    const result = processMatchingFiles(regex);
    message = `${result.processed} marked, ${result.skipped} already viewed, ${result.failed} failed (${result.matched} matched)`;
    running = false;
  }
</script>

<div class="flex items-center gap-2">
  {#if message}
    <span class="text-xs" role="status">{message}</span>
  {/if}
  <Button size="sm" disabled={!valid || running} onclick={run}>
    {running ? "Marking..." : "Mark matching files read"}
  </Button>
  <label class="inline-flex cursor-pointer items-center gap-1.5 text-xs" for="hide-matching-files">
    <Switch
      id="hide-matching-files"
      bind:checked={hideMatchingFiles}
      onCheckedChange={toggleHiddenFiles}
      aria-label="Hide matching files"
      size="sm"
    />
    <span>Hide matching files</span>
  </label>
</div>
