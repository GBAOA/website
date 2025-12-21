import { Button } from "@/components/ui/button"
import { ExternalLink, Shield, CreditCard, Wrench, MessageSquare, Smartphone } from "lucide-react"

export default function ResidentInfo() {
    return (
        <div className="bg-background py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:text-center">
                    <h2 className="text-base font-semibold leading-7 text-primary">Resident Portal</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Managing Your Life at Golden Blossom
                    </p>
                    <p className="mt-6 text-lg leading-8 text-muted-foreground">
                        We use specialized platforms to ensure a seamless and secure living experience.
                        Here is how to access and use them.
                    </p>
                </div>

                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">

                        {/* Adda.io Section */}
                        <div className="flex flex-col bg-card p-8 rounded-2xl border shadow-sm">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                    <CreditCard className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold">Adda.io</h3>
                            </div>
                            <p className="text-muted-foreground mb-6">
                                Adda is our comprehensive platform for community management, accounting, and official communication.
                            </p>
                            <ul className="space-y-4 mb-8 text-sm">
                                <li className="flex items-center gap-3">
                                    <CreditCard className="w-5 h-5 text-primary/60" />
                                    <span>Pay maintenance and utility bills online</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Wrench className="w-5 h-5 text-primary/60" />
                                    <span>Raise and track maintenance helpdesk tickets</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <MessageSquare className="w-5 h-5 text-primary/60" />
                                    <span>Read official notices and participate in discussions</span>
                                </li>
                            </ul>
                            <div className="mt-auto pt-6 border-t">
                                <Button asChild className="w-full gap-2">
                                    <a href="https://adda.io" target="_blank" rel="noopener noreferrer">
                                        Login to Adda <ExternalLink className="w-4 h-4" />
                                    </a>
                                </Button>
                            </div>
                        </div>

                        {/* MyGate Section */}
                        <div className="flex flex-col bg-card p-8 rounded-2xl border shadow-sm">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                    <Shield className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold">MyGate</h3>
                            </div>
                            <p className="text-muted-foreground mb-6">
                                MyGate is used primarily for visitor management, security, and immediate daily logistics.
                            </p>
                            <ul className="space-y-4 mb-8 text-sm">
                                <li className="flex items-center gap-3">
                                    <Shield className="w-5 h-5 text-primary/60" />
                                    <span>Approve or deny visitor entry in real-time</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Smartphone className="w-5 h-5 text-primary/60" />
                                    <span>Pre-approve guests and delivery personnel</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Bell className="w-5 h-5 text-primary/60" />
                                    <span>Receive security alerts and community broadscasts</span>
                                </li>
                            </ul>
                            <div className="mt-auto pt-6 border-t flex gap-4">
                                <Button variant="outline" className="flex-1 gap-2" asChild>
                                    <a href="https://mygate.com" target="_blank" rel="noopener noreferrer">
                                        Learn More
                                    </a>
                                </Button>
                                <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground italic">
                                    Available on iOS & Android
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Additional Help */}
                    <div className="mt-16 p-8 bg-muted/30 rounded-2xl border text-center">
                        <h4 className="text-lg font-semibold mb-2">Need Help with Access?</h4>
                        <p className="text-muted-foreground text-sm max-w-xl mx-auto">
                            If you are a new resident and haven't received your login credentials for Adda or MyGate,
                            please contact the Association Office or reach out to us at
                            <span className="text-primary font-medium"> manager@golden-blossom.com</span>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Bell(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
    )
}
