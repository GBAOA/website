export default function About() {
    return (
        <div className="bg-background py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:mx-0">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">About Golden Blossom Apartments</h2>
                    <p className="mt-6 text-lg leading-8 text-muted-foreground">
                        Golden Blossom Apartments is a premier residential enclave located in the growing hub of Whitefield - Hoskote Road.
                        We pride ourselves on offering a harmonious living experience built on the pillars of safety, community, and environmental responsibility.
                    </p>
                </div>

                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                    <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                        <div className="flex flex-col border-l border-primary pl-6">
                            <dt className="text-base font-semibold leading-7 text-foreground">Community First</dt>
                            <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                                <p className="flex-auto">A vibrant hub where neighbors become friends through regular cultural celebrations and shared community spaces.</p>
                            </dd>
                        </div>
                        <div className="flex flex-col border-l border-primary pl-6">
                            <dt className="text-base font-semibold leading-7 text-foreground">Safety & Security</dt>
                            <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                                <p className="flex-auto">Equipped with 24/7 manned security, smart visitor management via MyGate, and comprehensive CCTV coverage.</p>
                            </dd>
                        </div>
                        <div className="flex flex-col border-l border-primary pl-6">
                            <dt className="text-base font-semibold leading-7 text-foreground">Sustainable Living</dt>
                            <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                                <p className="flex-auto">Committed to eco-friendly practices like rainwater harvesting, organic waste conversion, and maintainting extensive green cover.</p>
                            </dd>
                        </div>
                    </dl>
                </div>

                {/* Location Map */}
                <div className="mt-24">
                    <h3 className="text-2xl font-bold tracking-tight text-foreground mb-8">Our Location</h3>
                    <div className="w-full h-96 rounded-xl overflow-hidden border">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3887.5541716553557!2d77.7542797!3d13.0003424!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae0e3d2ae95edf%3A0x38fcab7544782088!2sGolden%20Blossom%20Apartments!5e0!3m2!1sen!2sin!4v1766228854536!5m2!1sen!2sin"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                    <p className="mt-4 text-muted-foreground">
                        Ward No. 83, Sai Baba Ashram, Whitefield - Hoskote Rd, Kadugodi, Bengaluru, Karnataka 560067
                    </p>
                </div>
            </div>
        </div>
    )
}
