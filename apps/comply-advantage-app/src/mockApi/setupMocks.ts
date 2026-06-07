const ignoredPathnames = [
  '/assets',
  '/favicon.ico',
  'svg',
  '/@fs/', // Vite file system requests (source files from packages)
  '/@vite/', // Vite internal client
  '/node_modules', // Vite pre-bundled deps
  '.tsx', // source file requests
];

export default async function setupMocks() {
  const { worker } = await import('./browser');

  await worker.start({
    onUnhandledRequest(req, print) {
      if (ignoredPathnames.some((pathname) => req.url.includes(pathname))) {
        return;
      }
      print.warning();
    },
  });
}
