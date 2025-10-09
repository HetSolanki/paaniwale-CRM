"use client";

import * as React from "react";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/Components/UI/shadcn-UI/navigation-menu";
import { Link } from "react-router-dom";

const records: { title: string; href: string; description: string }[] = [
    {
        title: "Customer Entry Records",
        href: "/customerentrydata",
        description:
            "Records of all the customers that have been entered into the system.",
    },
    {
        title: "Customer Data Records",
        href: "/",
        description:
            "Records of all the customers that have been entered into the system.",
    },
    // {
    //     title: "Hover Card",
    //     href: "/docs/primitives/hover-card",
    //     description:
    //         "For sighted users to preview content available behind a link.",
    // },
    // {
    //     title: "Progress",
    //     href: "/docs/primitives/progress",
    //     description:
    //         "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
    // },
    // {
    //     title: "Scroll-area",
    //     href: "/docs/primitives/scroll-area",
    //     description: "Visually or semantically separates content.",
    // },
    // {
    //     title: "Tabs",
    //     href: "/docs/primitives/tabs",
    //     description:
    //         "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
    // },
    // {
    //     title: "Tooltip",
    //     href: "/docs/primitives/tooltip",
    //     description:
    //         "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
    // },
];

export function NavbarItems() {
    return (
        <>
            <NavigationMenu>
                <NavigationMenuList>
                    <NavigationMenuItem>
                        <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
                            <Link to="/dashboard" >
                                Dashboard
                            </Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
                            <Link to="/customers" >
                                Customers
                            </Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
                            <Link to="/customerentry" >
                                Customer Entry
                            </Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
                            <Link to="/paymentdetails" >
                                Payment Details
                            </Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
                            <Link to="/partyorders" >
                                Party Orders
                            </Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    {/* <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                            <li className="row-span-3">
                                <NavigationMenuLink asChild>
                                    <a
                                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                                        href="/"
                                    >
                                        <div className="mb-2 mt-4 text-lg font-medium">
                                            shadcn/ui
                                        </div>
                                        <p className="text-sm leading-tight text-muted-foreground">
                                            Beautifully designed components that you can copy and
                                            paste into your apps. Accessible. Customizable. Open
                                            Source.
                                        </p>
                                    </a>
                                </NavigationMenuLink>
                            </li>
                            <ListItem href="/docs" title="Introduction">
                                Re-usable components built using Radix UI and Tailwind CSS.
                            </ListItem>
                            <ListItem href="/docs/installation" title="Installation">
                                How to install dependencies and structure your app.
                            </ListItem>
                            <ListItem href="/docs/primitives/typography" title="Typography">
                                Styles for headings, paragraphs, lists...etc
                            </ListItem>
                        </ul>
                    </NavigationMenuContent> */}
                </NavigationMenuList>
                {/* <NavigationMenuItem>
                    <NavigationMenuTrigger>Records</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                            {records.map((component) => (
                                <Link to={component.href} key={component.title}>
                                <ListItem
                                    key={component.title}
                                    title={component.title}
                                >
                                    {component.description}
                                </ListItem>
                                </Link>
                            ))}
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem> */}
            </NavigationMenu >
        </>
    );
}

// const ListItem = React.forwardRef<
//     React.ElementRef<"a">,
//     React.ComponentPropsWithoutRef<"a">
// >(({ className, title, children, ...props }, ref) => {
//     return (
//         <li>
//             <NavigationMenuLink asChild>
//                 <Link
//                     ref={ref}
//                     className={cn(
//                         "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
//                         className
//                     )}
//                     {...props}
//                 >
//                     <div className="text-sm font-medium leading-none">{title}</div>
//                     <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
//                         {children}
//                     </p>
//                 </Link>
//             </NavigationMenuLink>
//         </li>
//     )
// })
// ListItem.displayName = "ListItem"
