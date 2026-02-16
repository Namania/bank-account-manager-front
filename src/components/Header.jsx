import React from "react"
import { SidebarTrigger } from "@/components/ui/sidebar";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import SlideXAnimation from "./animation/SlideXAnimation";
import SlideYAnimation from "./animation/SlideYAnimation";

export default function Header({ breadcrumb, children }) {
    const count = React.Children.count(children);
    return (
        <header className="flex items-center justify-between px-1 py-2 border-b bg-background">
            <div className="flex items-center gap-4">
                <SlideXAnimation>
                    <SidebarTrigger />
                </SlideXAnimation>
                {breadcrumb}
            </div>
            <div className="flex flex-row-reverse gap-2 pr-2">
                {children}
                <SlideYAnimation delay={.2 + .2 * count}>
                    <ThemeToggle />
                </SlideYAnimation>
                <SlideYAnimation delay={.4 + .2 * count}>
                    <LanguageToggle />
                </SlideYAnimation>
            </div>
        </header>
    );
}
