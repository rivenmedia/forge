import { Card, CardHeader } from '@/components/ui/card'

export function Settings() {
    return (
        <div className='flex flex-wrap gap-4 py-6 pr-4 lg:py-8'>
            {[...Array(48)].map((_, index) => (
                <Card key={index} className='md:w-[180px]'>
                    <CardHeader>
                        <h1>col-{index}</h1>
                    </CardHeader>
                </Card>
            ))}
        </div>
    )
}
