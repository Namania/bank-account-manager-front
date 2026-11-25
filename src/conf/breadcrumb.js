import { useTranslation } from "react-i18next";

export function isNumeric(value) {
    return /^-?\d+$/.test(value);
}

export function useBreadcrumbItems(path, pageLabel = null) {
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
            { label: pageLabel ?? last },
        ],
        '/transaction': [
            { label: t(`${location}.transaction`) },
        ],
        '/category': [
            { label: t(`${location}.category`) },
        ],
        '/recurring': [
            { label: t(`${location}.recurring`) },
        ],
        '/budgets': [
            { label: t(`${location}.budgets`) },
        ],
        '/stats': [
            { label: t(`${location}.stats`) },
        ],
        '/profile': [
            { label: t(`${location}.profile`) },
        ],
    }

    if (!Object.keys(items).includes(path)) return [
        { label: t(`${location}.not-found`) }
    ];

    return items[path];
}
