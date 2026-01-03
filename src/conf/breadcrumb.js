import { useTranslation } from "react-i18next";

export function getBreadCrumbItems(path) {
    const { t } = useTranslation();
    const location = 'core.breadcrumb';

    const items = {
        '/': [
            { label: t(`${location}.account`) },
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
