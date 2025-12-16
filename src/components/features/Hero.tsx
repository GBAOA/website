import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function Hero() {
    return (
        <div className="relative isolate overflow-hidden bg-background">
            <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
                <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
                    <div className="mt-24 sm:mt-32 lg:mt-16">
                        <a href="#" className="inline-flex space-x-6">
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold leading-6 text-primary ring-1 ring-inset ring-primary/10">
                                Latest Updates
                            </span>
                            <span className="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-muted-foreground">
                                <span>Just announced v1.0</span>
                            </span>
                        </a>
                    </div>
                    <h1 className="mt-10 text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                        Live Better at Golden Blossom
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-muted-foreground">
                        Experience the perfect blend of luxury, community, and nature.
                        Golden Blossom Apartments offers a premium lifestyle with state-of-the-art amenities and a vibrant community.
                    </p>
                    <div className="mt-10 flex items-center gap-x-6">
                        <Button asChild size="lg">
                            <Link href="/about">Discover More</Link>
                        </Button>
                        <Button variant="ghost" asChild>
                            <Link href="/contact">Contact Us <span aria-hidden="true">→</span></Link>
                        </Button>
                    </div>
                </div>
                <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mt-0 lg:mr-0 lg:max-w-none lg:flex-none xl:ml-32">
                    <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
                        <div className="relative aspect-[4/3] w-[40rem] max-w-full rounded-xl shadow-2xl ring-1 ring-gray-900/10 lg:w-[50rem] overflow-hidden">
                            <Image
                                src="/images/hero.png"
                                alt="Golden Blossom Exterior"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
