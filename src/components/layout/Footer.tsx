import Link from "next/link"

export function Footer() {
    return (
        <footer className="bg-muted/30 border-t border-border mt-auto">
            <div className="container mx-auto px-4 py-8 sm:px-8">
                <div className="md:flex md:items-center md:justify-between">
                    <div className="flex justify-center md:justify-start">
                        <p className="text-center text-xs leading-5 text-muted-foreground">
                            &copy; {new Date().getFullYear()} Golden Blossom Apartments. All rights reserved.
                        </p>
                    </div>
                    <div className="mt-4 flex justify-center md:mt-0 md:justify-end space-x-6">
                        <Link href="/contact" className="text-xs text-muted-foreground hover:text-foreground">
                            Contact
                        </Link>
                        <Link href="/admin" className="text-xs text-muted-foreground hover:text-foreground">
                            Admin
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
