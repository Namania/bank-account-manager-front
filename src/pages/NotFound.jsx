import { FileQuestion } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function NotFound() {
    const { t } = useTranslation();
    const location = "core.not-found";

    return (
        <div className="h-full flex flex-col items-center justify-center">
            <div className="flex flex-col items-center text-center space-y-4">

                <div className="rounded-full bg-purple-500/10 p-6">
                    <FileQuestion 
                        className="h-10 w-10 text-purple-600" 
                        strokeWidth={1.5} 
                    />
                </div>

                <div className="space-y-1">
                    <h1 className="text-2xl pb-7 font-semibold tracking-tight">
                        { t(`${location}.title`) }
                    </h1>
                    <p className="text-sm text-muted-foreground max-w-[300px]">
                        { t(`${location}.description`) }
                    </p>
                </div>
                
            </div>
        </div>
    );
}
