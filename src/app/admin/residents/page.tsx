import { Button } from "@/components/ui/button"
import { Users, RefreshCw, CheckCircle2 } from "lucide-react"

// Mock residents data simulating Adda.io API response
const residents = [
    { id: "A-101", name: "Sharma Family", type: "Owner", residents: 4, verified: true },
    { id: "A-102", name: "John Doe", type: "Tenant", residents: 2, verified: true },
    { id: "B-205", name: "Priya Singh", type: "Owner", residents: 3, verified: true },
    { id: "C-304", name: "Rahul Verma", type: "Tenant", residents: 1, verified: false },
]

export default function ResidentsPage() {
    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Resident Directory</h1>
                    <p className="text-muted-foreground flex items-center gap-2 text-sm mt-1">
                        <CheckCircle2 className="w-4 h-4 text-green-500" /> Synced with Adda.io
                    </p>
                </div>
                <Button variant="outline" className="gap-2">
                    <RefreshCw className="w-4 h-4" /> Sync Now
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Flat No</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Members</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {residents.map((res) => (
                                <tr key={res.id} className="border-b transition-colors hover:bg-muted/50">
                                    <td className="p-4 align-middle font-medium">{res.id}</td>
                                    <td className="p-4 align-middle">{res.name}</td>
                                    <td className="p-4 align-middle">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${res.type === 'Owner' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {res.type}
                                        </span>
                                    </td>
                                    <td className="p-4 align-middle">{res.residents}</td>
                                    <td className="p-4 align-middle">
                                        {res.verified ?
                                            <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Verified</span>
                                            : <span className="text-muted-foreground">Pending</span>
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
