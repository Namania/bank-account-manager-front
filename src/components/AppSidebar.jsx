import {
    PiggyBankIcon,
    CreditCardIcon,
    LayoutGridIcon,
    BarChart3Icon,
    RepeatIcon,
    TargetIcon
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { Link, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next";
import { NavUser } from "./NavUser";
import SlideYAnimation from "./animation/SlideYAnimation";
import SlideXAnimation from "./animation/SlideXAnimation";

export function AppSidebar() {
    const { t } = useTranslation();
    const { setOpenMobile } = useSidebar();
    const { pathname } = useLocation();
    // The account pages belong to the Accounts entry.
    const isCurrent = (url) => (url === "/" ? pathname === "/" || pathname.startsWith("/account/") : pathname.startsWith(url));
    const location = "core.breadcrumb";

    const items = [
        {
            title: t(`${location}.accounts`),
            url: "/",
            icon: PiggyBankIcon,
        },
        {
            title: t(`${location}.transaction`),
            url: "/transaction",
            icon: CreditCardIcon,
        },
        {
            title: t(`${location}.category`),
            url: "/category",
            icon: LayoutGridIcon,
        },
        {
            title: t(`${location}.recurring`),
            url: "/recurring",
            icon: RepeatIcon,
        },
        {
            title: t(`${location}.budgets`),
            url: "/budgets",
            icon: TargetIcon,
        },
        {
            title: t(`${location}.stats`),
            url: "/stats",
            icon: BarChart3Icon,
        },
    ]

    return (
        <Sidebar>
            <SlideYAnimation>
                <SidebarHeader className="flex flex-row gap-2 pt-4 ml-5">
                    <img src="/images/logo.svg" alt="Logo" className="h-12 w-12 object-contain" />
                    <div className="flex flex-col justify-center">
                        <h2 className="text-lg font-semibold">Account Manager</h2>
                        <p className="text-muted-foreground text-[12px]">v{__APP_VERSION__}</p>
                    </div>
                </SidebarHeader>
            </SlideYAnimation>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item, index) => (
                                <SlideXAnimation key={index} delay={.2 + .15 * index}>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive={isCurrent(item.url)} tooltip={item.title} className="transition-colors data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:hover:bg-primary/90 data-[active=true]:hover:text-primary-foreground">
                                            <Link
                                                to={item.url}
                                                aria-current={isCurrent(item.url) ? "page" : undefined}
                                                onClick={() => setOpenMobile(false)}
                                            >
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SlideXAnimation>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SlideYAnimation reverse delay={.3}>
                <SidebarFooter className="flex justify-center items-center">
                    <div className="mt-auto w-full border-t p-2">
                        <NavUser />
                    </div>
                </SidebarFooter>
            </SlideYAnimation>
        </Sidebar>
    )
}
