export default function About() {
    return (
        <div className="bg-background py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:mx-0">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">About Golden Blossom</h2>
                    <p className="mt-6 text-lg leading-8 text-muted-foreground">
                        Golden Blossom Apartments is a premium residential community designed for modern living.
                        Nestled in a serene environment, we prioritize safety, sustainability, and a vibrant community life.
                    </p>
                </div>

                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                    <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                        <div className="flex flex-col">
                            <dt className="text-base font-semibold leading-7 text-foreground">Community First</dt>
                            <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                                <p className="flex-auto">We believe in fostering a strong sense of belonging among residents through regular events and shared spaces.</p>
                            </dd>
                        </div>
                        <div className="flex flex-col">
                            <dt className="text-base font-semibold leading-7 text-foreground">Safety & Security</dt>
                            <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                                <p className="flex-auto">24/7 security personnel, CCTV surveillance, and secure access control ensure peace of mind for all residents.</p>
                            </dd>
                        </div>
                        <div className="flex flex-col">
                            <dt className="text-base font-semibold leading-7 text-foreground">Sustainable Living</dt>
                            <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                                <p className="flex-auto">Eco-friendly initiatives including rainwater harvesting, waste segregation, and extensive green cover.</p>
                            </dd>
                        </div>
                    </dl>
                </div>

                {/* Location Map Placeholder */}
                <div className="mt-24">
                    <h3 className="text-2xl font-bold tracking-tight text-foreground mb-8">Our Location</h3>
                    <div className="w-full h-96 bg-muted rounded-xl flex items-center justify-center border">
                        <span className="text-muted-foreground">Google Maps Embed Placeholder</span>
                    </div>
                    <p className="mt-4 text-muted-foreground">
                        123 Blossom Lane, Green Valley, City - 560001
                    </p>
                </div>
            </div>
        </div>
    )
}
