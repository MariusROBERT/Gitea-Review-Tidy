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

export function setMatchingFilesHidden(pattern: RegExp, hidden: boolean): void {
  const matchingIds = new Set<string>();
  const boxes = document.querySelectorAll<HTMLElement>(
    "#diff-file-boxes .diff-file-box[data-new-filename]",
  );

  for (const box of boxes) {
    const path = box.getAttribute("data-new-filename")?.trim() || box.getAttribute("data-old-filename")?.trim() || "";
    if (!pattern.test(path)) continue;

    box.hidden = hidden;
    if (box.id) matchingIds.add(`#${box.id}`);
  }

  for (const file of document.querySelectorAll<HTMLAnchorElement>("#diff-file-tree a.item-file")) {
    if (matchingIds.has(file.getAttribute("href") ?? "")) file.hidden = hidden;
  }
}
