import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { DynamicBreadcrumb } from "./DynamicBreadcrumb";
import { getBreadCrumbItems } from "@/conf/breadcrumb";

import Header from "./Header"
import { Button } from "./ui/button";
import { PlusIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";

export default function Layout() {
  const { t } = useTranslation();
  const location = useLocation();
  const path = location.pathname;
  const breadcrumbItems = getBreadCrumbItems(path);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const actions = {
    "/": {
      context: "male",
      langKey: "account.new"
    },
    "/transaction": {
      context: "female",
      langKey: "transaction.new"
    },
    "/category": {
      context: "female",
      langKey: "category.new"
    }
  };

  const current = Object.keys(actions).includes(path) ? actions[path] : {
    context: "male",
    langKey: "core.header.actions.not-found"
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 p-2 flex flex-col min-h-screen">
        <Header breadcrumb={ <DynamicBreadcrumb items={breadcrumbItems} /> } >
          <Button onClick={() => setIsModalOpen(true)}>
            <PlusIcon />
            { t(current.langKey) }
          </Button>
        </Header>
        <div className="p-2 flex-1">
          <Outlet context={{ isModalOpen, setIsModalOpen }} />
        </div>
      </main>
    </SidebarProvider>
  );
}
