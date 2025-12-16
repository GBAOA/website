import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, Bell } from "lucide-react"

// Mock stats
const stats = [
    { name: "Total Residents", value: "450", icon: Users, change: "+12%" },
    { name: "Upcoming Events", value: "3", icon: Calendar, change: "Next: Diwali" },
    { name: "Active Notices", value: "5", icon: Bell, change: "2 Urgent" },
]

export default function AdminDashboard() {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-8">Dashboard Overview</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat) => (
                    <div key={stat.name} className="rounded-xl border bg-card text-card-foreground shadow-xs">
                        <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="tracking-tight text-sm font-medium">{stat.name}</h3>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="p-6 pt-0">
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 rounded-xl border bg-card shadow-xs">
                    <div className="p-6">
                        <h3 className="font-semibold text-lg mb-4">Recent Activity</h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center">
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">New Notice Posted</p>
                                        <p className="text-sm text-muted-foreground">Admin posted "Lift Maintanence"</p>
                                    </div>
                                    <div className="ml-auto font-medium text-xs text-muted-foreground">2h ago</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
