import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { DynamicBreadcrumb } from "./DynamicBreadcrumb";
import { getBreadCrumbItems, isNumeric } from "@/conf/breadcrumb";

import Header from "./Header"
import { Button } from "./ui/button";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";

export default function Layout() {
  const { t } = useTranslation();
  const location = useLocation();
  let path = location.pathname;
  const breadcrumbItems = getBreadCrumbItems(path);

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const array = path.split('/');
  const last = array[array.length - 1];

  if (isNumeric(last)) {
    path = path.slice(0, -last.length);
  }

  const actions = {
    "/": {
      icon: <PlusIcon />,
      langKey: "account.new",
      variant: "default"
    },
    "/account/": {
      icon: <Trash2Icon />,
      langKey: "account.delete.label",
      variant: "destructive"
    },
    "/transaction": {
      icon: <PlusIcon />,
      langKey: "transaction.new",
      variant: "default"
    },
    "/category": {
      icon: <PlusIcon />,
      langKey: "category.new",
      variant: "default"
    }
  };

  const current = Object.keys(actions).includes(path) ? actions[path] : {
    langKey: "core.header.actions.not-found"
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 p-2 flex flex-col min-h-screen">
        <Header breadcrumb={ <DynamicBreadcrumb items={breadcrumbItems} /> } >
          {
            path !== "/transaction" ? <Button variant={current.variant} onClick={() => setIsModalOpen(true)}>
              {current.icon}
              { t(current.langKey) }
            </Button> : null
          }
        </Header>
        <div className="p-2 flex-1">
          <Outlet context={{ isModalOpen, setIsModalOpen }} />
        </div>
      </main>
    </SidebarProvider>
  );
}
