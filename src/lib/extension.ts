type ExtensionApi = typeof chrome;

const globals = globalThis as typeof globalThis & {
  browser?: ExtensionApi;
};

export const extensionApi: ExtensionApi = globals.browser ?? chrome;
