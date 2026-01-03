import LanguageToggle from "@/components/LanguageToggle";
import { Hammer } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Maintenance() {
    const { t } = useTranslation();
    const location = "core.maintenance";

    return (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-background p-4">
            <div className="flex flex-col items-center text-center space-y-4">
                <div className="rounded-full bg-purple-500/10 p-6">
                    <Hammer className="h-12 w-12 text-purple-600" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">
                    { t(`${location}.title`) }
                </h1>
                <p className="text-muted-foreground max-w-md">
                    { t(`${location}.description`) }
                </p>
            </div>
            <LanguageToggle className="fixed right-2 top-2" />
        </div>
    );
}
