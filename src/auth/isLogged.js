export function isLogged() {
    const LOCAL_KEY = import.meta.env.VITE_LOCAL_KEY;
    return localStorage.getItem(`${LOCAL_KEY}.token`);
}
