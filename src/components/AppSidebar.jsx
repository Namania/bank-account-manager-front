import {
    PiggyBankIcon,
    CreditCardIcon,
    LayoutGridIcon
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
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next";
import { NavUser } from "./NavUser";
import SlideYAnimation from "./animation/SlideYAnimation";
import SlideXAnimation from "./animation/SlideXAnimation";

export function AppSidebar() {
    const { t } = useTranslation();
    const { setOpenMobile } = useSidebar();
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
    ]

    return (
        <Sidebar>
            <SlideYAnimation>
                <SidebarHeader className="flex flex-row gap-2 pt-4 ml-5">
                    <img src="/images/logo.ico" alt="Logo" className="h-12 w-12 object-contain" />
                    <div className="flex flex-col justify-center">
                        <h2 className="text-lg font-semibold">Account Manager</h2>
                        <p className="text-neutral-500 text-[12px]">v0.1.4</p>
                    </div>
                </SidebarHeader>
            </SlideYAnimation>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item, index) => (
                                <SlideXAnimation key={index} delay={.3 + .2 * index}>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild>
                                            <Link
                                                to={item.url}
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
