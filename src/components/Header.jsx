import { SidebarTrigger } from "@/components/ui/sidebar";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";

export default function Header({ breadcrumb, children }) {
    return (
        <header className="flex items-center justify-between px-1 py-2 border-b bg-background">
            <div className="flex items-center gap-4">
                <SidebarTrigger />
                {breadcrumb}
            </div>
            <div className="flex flex-row-reverse gap-2 pr-2">
                {children}
                <ThemeToggle />
                <LanguageToggle />
            </div>
        </header>
    );
}
