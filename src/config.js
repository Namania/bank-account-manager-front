// Settings of the running application.
//
// In the Docker image they come from /config.js, written when the container
// starts: one image serves any environment. In development and in tests that
// file is empty and the build-time Vite variables are used instead.
const runtime = globalThis.__APP_CONFIG__ ?? {};

// Address of the API as the browser sees it.
export const API_URL = runtime.API_URL || import.meta.env.VITE_API_URL;

// Prefix of the keys kept in localStorage (theme and language).
export const LOCAL_KEY = runtime.LOCAL_KEY || import.meta.env.VITE_LOCAL_KEY;
