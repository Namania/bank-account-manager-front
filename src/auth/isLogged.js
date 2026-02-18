import Cookies from "js-cookie";

export function isLogged() {
    const LOCAL_KEY = import.meta.env.VITE_LOCAL_KEY;
    return Cookies.get(`${LOCAL_KEY}_access`);
}
