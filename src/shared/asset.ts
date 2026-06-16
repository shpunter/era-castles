// Resolve a public-folder asset to a URL that works whether this remote runs
// standalone or is federated into a host on a different origin.
//
// Vite inlines `import.meta.env.BASE_URL` to the configured `base` at build
// time: "/" in dev, "https://castles.eraplanner.com/" in the federation build.
// So the returned URL always points back at THIS remote — not the host page
// that embeds it, where a bare "/img/..." would 404 against the host's origin.
export const asset = (path: string): string =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
