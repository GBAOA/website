"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Amenities", href: "/amenities" },
    { name: "Events", href: "/events" },
    { name: "Gallery", href: "/gallery" },
    { name: "Notices", href: "/notices" },
    { name: "Resident Info", href: "/resident-info" },
    { name: "Contact", href: "/contact" },
]

export function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <nav className="container flex h-16 items-center justify-between px-4 sm:px-8 mx-auto" aria-label="Global">
                <div className="flex lg:flex-1">
                    <Link href="/" className="-m-1.5 p-1.5 text-xl font-bold tracking-tight text-primary">
                        Golden Blossom
                    </Link>
                </div>
                <div className="flex lg:hidden">
                    <button
                        type="button"
                        className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-muted-foreground hover:text-foreground"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <span className="sr-only">Open main menu</span>
                        {mobileMenuOpen ? (
                            <X className="h-6 w-6" aria-hidden="true" />
                        ) : (
                            <Menu className="h-6 w-6" aria-hidden="true" />
                        )}
                    </button>
                </div>
                <div className="hidden lg:flex lg:gap-x-8">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="text-sm font-semibold leading-6 text-muted-foreground hover:text-primary transition-colors"
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                <div className="hidden lg:flex lg:flex-1 lg:justify-end">
                    <Link href="/admin/login" className="text-sm font-semibold leading-6 text-primary">
                        Admin Login <span aria-hidden="true">&rarr;</span>
                    </Link>
                </div>
            </nav>
            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden">
                    <div className="space-y-1 px-4 pb-3 pt-2">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="block rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}

                        <Link
                            href="/admin/login"
                            className="block rounded-md px-3 py-2 text-base font-medium text-primary hover:bg-accent hover:text-accent-foreground"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Admin Login
                        </Link>
                    </div>
                </div>
            )}
        </header>
    )
}
