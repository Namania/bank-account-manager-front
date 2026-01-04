import { useTranslation } from "react-i18next";

export function isNumeric(value) {
    return /^-?\d+$/.test(value);
}

export function getBreadCrumbItems(path) {
    const { t } = useTranslation();
    const location = 'core.breadcrumb';

    const array = path.split('/');
    const last = array[array.length - 1];

    if (isNumeric(last)) {
        path = path.slice(0, -last.length);
    }

    const items = {
        '/': [
            { label: t(`${location}.accounts`) },
        ],
        '/account/': [
            { label: t(`${location}.accounts`), href: '/' },
            { label: last },
        ],
        '/transaction': [
            { label: t(`${location}.transaction`) },
        ],
        '/category': [
            { label: t(`${location}.category`) },
        ],
    }

    if (!Object.keys(items).includes(path)) return [
        { label: t(`${location}.not-found`) }
    ];

    return items[path];
}
