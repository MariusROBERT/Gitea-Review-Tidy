<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { validPattern } from "$lib/settings";
  import { processMatchingFiles } from "./process";

  let { pattern }: { pattern: string } = $props();

  let running = $state(false);
  let message = $state("");
  let valid = $derived(validPattern(pattern) !== null);

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
</div>
