export interface ProcessResult {
  processed: number;
  skipped: number;
  failed: number;
  matched: number;
}

export function processMatchingFiles(pattern: RegExp): ProcessResult {
  const result: ProcessResult = { processed: 0, skipped: 0, failed: 0, matched: 0 };
  const headers = document.querySelectorAll<HTMLElement>(".diff-file-header");

  for (const header of headers) {
    const checkbox = header.querySelector<HTMLInputElement>(
      "label.viewed-file-form input[type='checkbox']",
    );
    if (!checkbox) continue;

    const path =
      checkbox.name.trim() ||
      header.querySelector<HTMLAnchorElement>(".file-link")?.getAttribute("title")?.trim() ||
      "";
    if (!pattern.test(path)) continue;

    result.matched += 1;
    if (checkbox.checked) {
      result.skipped += 1;
      continue;
    }

    checkbox.click();
    if (checkbox.checked) {
      result.processed += 1;
    } else {
      result.failed += 1;
    }
  }

  return result;
}
