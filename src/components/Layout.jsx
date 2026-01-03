import { Link, Outlet, useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { DynamicBreadcrumb } from "./DynamicBreadcrumb";
import { getBreadCrumbItems } from "@/conf/breadcrumb";

import Header from "./Header"
import { Button } from "./ui/button";
import { PlusIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Layout() {
  const { t } = useTranslation();
  const location = useLocation();
  const path = location.pathname;
  const breadcrumbItems = getBreadCrumbItems(path);

  const actions = {
    "/": {
      context: "male",
      langKey: "account"
    },
    "/transaction": {
      context: "female",
      langKey: "transaction"
    },
    "/category": {
      context: "female",
      langKey: "category"
    }
  };

  const current = Object.keys(actions).includes(path) ? actions[path] : {
    context: "male",
    langKey: "not-found"
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 p-2 flex flex-col min-h-screen">
        <Header breadcrumb={ <DynamicBreadcrumb items={breadcrumbItems} /> } >
          <Link to={path + "/new"}>
            <Button>
              <PlusIcon />
              { `${t('core.header.actions.base', { context: current.context })} ${t(`core.header.actions.${current.langKey}`)}` }
            </Button>
          </Link>
        </Header>
        <div className="p-2 flex-1">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
}
