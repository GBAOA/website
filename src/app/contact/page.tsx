import { Button } from "@/components/ui/button"
import { Mail, Phone, MapPin } from "lucide-react"

export default function Contact() {
    return (
        <div className="bg-background py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Get in Touch</h2>
                    <p className="mt-2 text-lg leading-8 text-muted-foreground">
                        Have questions or need assistance? Reach out to the Association.
                    </p>
                </div>

                <div className="mx-auto mt-16 max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Contact Info */}
                    <div className="bg-muted/30 p-8 rounded-xl border">
                        <h3 className="text-xl font-semibold mb-6">Contact Information</h3>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <MapPin className="w-6 h-6 text-primary mt-1" />
                                <div>
                                    <p className="font-medium">Golden Blossom Apartments</p>
                                    <p className="text-muted-foreground text-sm">Ward No. 83, Sai Baba Ashram, Whitefield - Hoskote Rd, Kadugodi<br />Bengaluru, Karnataka - 560067</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Phone className="w-6 h-6 text-primary" />
                                <div>
                                    <p className="font-medium">7899239977</p>
                                    <p className="text-muted-foreground text-sm">Security / Office</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Mail className="w-6 h-6 text-primary" />
                                <div>
                                    <p className="font-medium">manager@golden-blossom.com</p>
                                    <p className="text-muted-foreground text-sm">Email us anytime</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form className="bg-card p-8 rounded-xl border shadow-xs space-y-4">
                        <h3 className="text-xl font-semibold mb-4">Send a Message</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <input type="text" placeholder="Your Name" className="w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                            <input type="email" placeholder="Email Address" className="w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                            <textarea placeholder="Message" rows={4} className="w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"></textarea>
                            <Button type="submit" className="w-full">Send Message</Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
