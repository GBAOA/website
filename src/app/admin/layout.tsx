import Link from "next/link"
import { signOut } from "@/auth"
import { Button } from "@/components/ui/button"
import {
    LayoutDashboard, Calendar, Bell, Image as ImageIcon, Users, LogOut, FileText
} from "lucide-react"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-muted/10 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-card border-r hidden md:flex flex-col">
                <div className="p-6 border-b flex items-center gap-2">
                    <span className="text-xl font-bold text-primary">Admin Panel</span>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <Link href="/admin" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-accent/50 text-accent-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link href="/admin/events" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                        <Calendar className="w-4 h-4" /> Events
                    </Link>
                    <Link href="/admin/notices" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                        <Bell className="w-4 h-4" /> Notices
                    </Link>
                    <Link href="/admin/documents" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                        <FileText className="w-4 h-4" /> Documents
                    </Link>
                    <Link href="/admin/gallery" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                        <ImageIcon className="w-4 h-4" /> Gallery
                    </Link>
                    <Link href="/admin/residents" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                        <Users className="w-4 h-4" /> API Integrations
                    </Link>
                </nav>

                <div className="p-4 border-t">
                    <form
                        action={async () => {
                            "use server"
                            await signOut()
                        }}
                    >
                        <Button variant="outline" className="w-full justify-start gap-2">
                            <LogOut className="w-4 h-4" /> Sign Out
                        </Button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
