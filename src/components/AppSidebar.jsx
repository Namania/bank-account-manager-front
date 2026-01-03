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
} from "@/components/ui/sidebar"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next";
import { NavUser } from "./NavUser";

export function AppSidebar() {
    const { t } = useTranslation();
    const location = "core.breadcrumb";

    const items = [
        {
            title: t(`${location}.account`),
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
            <SidebarHeader className="flex flex-row gap-2 pt-4 ml-5">
                <img src="/images/logo.ico" alt="Logo" className="h-12 w-12 object-contain" />
                <div className="flex flex-col justify-center">
                    <h2 className="text-lg font-semibold">Account Manager</h2>
                    <p className="text-neutral-500 text-[12px]">v0.1.4</p>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link to={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="flex justify-center items-center">
                <div className="mt-auto border-t p-2">
                    <NavUser />
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}
