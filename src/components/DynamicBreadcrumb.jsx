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
        <Breadcrumb>
            <BreadcrumbList>
                {items.map((item, index) => (
                    <React.Fragment key={index}>
                        {index > 0 && <SlideYAnimation delay={.2 * index}><BreadcrumbSeparator /></SlideYAnimation>}
                        <SlideYAnimation delay={.2 * (index + 1)}>
                            <BreadcrumbItem>
                                {item.href ? (
                                    <Link className="hover:text-foreground" to={item.href}>{item.label}</Link>
                                    ) : (
                                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                                )}
                            </BreadcrumbItem>
                        </SlideYAnimation>
                    </React.Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
