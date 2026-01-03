import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages } from "lucide-react";

export default function LanguageToggle({ className }) {
    const { i18n } = useTranslation();

    const changeLanguage = (lang) => {
        const localKey = import.meta.env.VITE_LOCAL_KEY;
        i18n.changeLanguage(lang);
        localStorage.setItem(`${localKey}.lang`, lang);
    };

    return (
        <div className={ className }>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Languages />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                        onClick={() => changeLanguage("fr")}
                        className={i18n.language === "fr" ? "bg-accent" : ""}
                    >
                        Français
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                        onClick={() => changeLanguage("en")}
                        className={i18n.language === "en" ? "bg-accent" : ""}
                    >
                        English
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
