import { extensionApi } from "$lib/extension";

export interface Settings {
  hosts: string[];
  pattern: string;
}

export const defaultSettings: Settings = {
  hosts: [],
  pattern: "",
};

export async function getSettings(): Promise<Settings> {
  const stored = await extensionApi.storage.sync.get(defaultSettings);
  const hosts = Array.isArray(stored.hosts)
    ? [...new Set(
        stored.hosts
          .filter((host): host is string => typeof host === "string")
          .map(normalizeOrigin)
          .filter((host): host is string => host !== null),
      )]
    : [];

  return {
    hosts,
    pattern: typeof stored.pattern === "string" ? stored.pattern : "",
  };
}

export async function saveSettings(settings: Settings) {
  await extensionApi.storage.sync.set(settings);
}

export function normalizeOrigin(value: string): string | null {
  try {
    const url = new URL(value.trim());
    if (!/^https?:$/.test(url.protocol) || url.pathname !== "/" || url.search || url.hash) {
      return null;
    }
    return url.origin;
  } catch {
    return null;
  }
}

export function hostMatchPattern(origin: string): string {
  const url = new URL(origin);
  return `*://${url.host}/*`;
}

export function validPattern(pattern: string): RegExp | null {
  if (!pattern.trim()) return null;

  try {
    return new RegExp(`^(?:${pattern})$`);
  } catch {
    return null;
  }
}
