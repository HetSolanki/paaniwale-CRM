"use client";

import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { buttonVariants } from "../../../UI/shadcn-UI/button";
import { Card, CardContent } from "../../../UI/shadcn-UI/card";
import { Badge } from "../../../UI/shadcn-UI/badge";
import { LucideIcon } from "lucide-react";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
    icon?: LucideIcon;
    description?: string;
    badge?: string;
  }[];
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const location = useLocation();

  return (
    <nav
      className={cn(
        // Mobile: Horizontal scrollable tabs with sticky positioning
        // Desktop: Vertical sidebar
        "lg:flex lg:flex-col lg:gap-2",
        "sticky top-[73px] lg:top-0",
        "bg-background lg:bg-transparent",
        "border-b lg:border-b-0",
        className
      )}
      {...props}
    >
      {/* Mobile: Horizontal Scroll */}
      <div className="flex lg:hidden overflow-x-auto hide-scrollbar gap-2 px-4 py-3">
        {items.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap transition-all shrink-0",
                "border",
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card hover:bg-accent border-border"
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
              <span className="text-sm font-medium">{item.title}</span>
            </Link>
          );
        })}
      </div>

      {/* Desktop: Vertical Sidebar Cards */}
      <div className="hidden lg:flex lg:flex-col lg:gap-2">
        {items.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className="block"
            >
              <Card
                className={cn(
                  "transition-all hover:shadow-md cursor-pointer",
                  isActive
                    ? "bg-primary/10 border-primary shadow-sm"
                    : "hover:bg-accent/50"
                )}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-3">
                    {Icon && (
                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                        isActive
                          ? "bg-primary/20"
                          : "bg-muted"
                      )}>
                        <Icon className={cn(
                          "h-5 w-5",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={cn(
                          "font-medium text-sm sm:text-base truncate",
                          isActive ? "text-primary" : ""
                        )}>
                          {item.title}
                        </h3>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
