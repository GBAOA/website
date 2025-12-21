import {
    ShieldCheck, Zap, Car, Accessibility, TreePine,
    Dumbbell, Footprints, Users, Sprout, Recycle
} from "lucide-react"

const amenities = [
    { name: '24/7 Security', description: 'Round-the-clock security personnel and MyGate visitor management.', icon: ShieldCheck },
    { name: 'Power Backup', description: 'Safe and reliable 100% power backup for common areas and elevators.', icon: Zap },
    { name: 'Ample Parking', description: 'Dedicated and spacious parking spaces for residents and visitors.', icon: Car },
    { name: 'Lift Access', description: 'High-speed automated elevators for easy access to all floors.', icon: Accessibility },
    { name: 'Fully Equipped Gym', description: 'Modern fitness center with a range of strength and cardio equipment.', icon: Dumbbell },
    { name: 'Children’s Play Area', description: 'Dedicated safe zones for kids to play and interact.', icon: Sprout },
    { name: 'Walking Track', description: 'Paved tracks within the community for morning and evening walks.', icon: Footprints },
    { name: 'Community Hall', description: 'Spacious clubhouse for gatherings, meetings, and celebrations.', icon: Users },
    { name: 'Green Spaces', description: 'Wide open green zones and manicured gardens for relaxation.', icon: TreePine },
]

export default function Amenities() {
    return (
        <div className="bg-background py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:text-center">
                    <h2 className="text-base font-semibold leading-7 text-primary">Lifestyle</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Everything you need for a comfortable life
                    </p>
                    <p className="mt-6 text-lg leading-8 text-muted-foreground">
                        Golden Blossom Apartments offers a wide range of amenities designed to enhance your quality of life.
                    </p>
                </div>
                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                    <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                        {amenities.map((feature) => (
                            <div key={feature.name} className="flex flex-col">
                                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                                    <feature.icon className="h-5 w-5 flex-none text-primary" aria-hidden="true" />
                                    {feature.name}
                                </dt>
                                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                                    <p className="flex-auto">{feature.description}</p>
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </div>
    )
}
