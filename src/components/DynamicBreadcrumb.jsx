import React from "react";

import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";
import SlideYAnimation from "./animation/SlideYAnimation";

export function DynamicBreadcrumb({ items }) {
    return (
        <Breadcrumb className="min-w-0">
            <BreadcrumbList className="flex-nowrap">
                {items.map((item, index) => (
                    <React.Fragment key={index}>
                        {index > 0 && <SlideYAnimation delay={.2 * index} className="max-sm:hidden"><BreadcrumbSeparator /></SlideYAnimation>}
                        <SlideYAnimation delay={.2 * (index + 1)} className={index < items.length - 1 ? "max-sm:hidden" : "min-w-0"}>
                            <BreadcrumbItem>
                                {item.href ? (
                                    <Link className="hover:text-foreground" to={item.href}>{item.label}</Link>
                                    ) : (
                                    <BreadcrumbPage className="block max-w-[45vw] truncate sm:max-w-[40vw]" title={item.label}>{item.label}</BreadcrumbPage>
                                )}
                            </BreadcrumbItem>
                        </SlideYAnimation>
                    </React.Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
