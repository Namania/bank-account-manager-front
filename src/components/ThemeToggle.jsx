import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ThemeToggle({ className }) {
    const { t } = useTranslation();
    const { theme, setTheme } = useTheme();

    const changeTheme = (current) => {
        const localKey = import.meta.env.VITE_LOCAL_KEY;
        setTheme(current);
        localStorage.setItem(`${localKey}.theme`, current);
    };

    const themes = [
        "light",
        "dark",
        "system"
    ];

    return (
        <div className={ className }>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="relative">
                        <Sun className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-border">
                    {
                        themes.map((current) => {
                            let icon = null;
                            switch (current) {
                                case "light":
                                    icon = <Sun className="h-4 w-4" />
                                    break;
                                case "dark":
                                    icon = <Moon className="h-4 w-4" />
                                    break;
                                case "system":
                                    icon = <Monitor className="h-4 w-4" />
                                    break;
                                default:
                                    break;
                            }
                            
                            return (
                                <DropdownMenuItem 
                                    key={current}
                                    onClick={() => changeTheme(current)}
                                    className={`flex items-center gap-2 cursor-pointer ${current === theme ? "bg-accent" : ""}`}
                                >
                                    { icon }
                                    <span>{ t(`core.theme.${current}`) }</span>
                                </DropdownMenuItem>
                            );
                        })
                    }
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
