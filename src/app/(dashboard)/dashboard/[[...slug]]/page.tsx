import { Card, CardHeader } from '@/components/ui/card'

interface DashboardPageProps {
    params: {
        slug: string[]
    }
}

export default async function DashboardPage({ params }: DashboardPageProps) {
    const slug = params.slug
    const pageDisplay = slug ? `/dashboard/${slug}` : '/dashboard'
    return (
        <div className='container py-4'>
            <Card className='text-center'>
                <CardHeader>Page: {pageDisplay}</CardHeader>
            </Card>
        </div>
    )
}
