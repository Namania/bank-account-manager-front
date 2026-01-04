import React from "react";
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";

export function DynamicBreadcrumb({ items }) {
    return (
        <Breadcrumb>
            <BreadcrumbList>
                {items.map((item, index) => (
                    <React.Fragment key={index}>
                        {index > 0 && <BreadcrumbSeparator />}
                        <BreadcrumbItem key={index}>
                            {item.href ? (
                                <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                                ) : (
                                <BreadcrumbPage>{item.label}</BreadcrumbPage>
                            )}
                        </BreadcrumbItem>
                    </React.Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
