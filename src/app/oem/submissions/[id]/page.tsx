import { redirect, notFound } from 'next/navigation'
import { getMe } from '@/server/auth'
import { getSubmissionDetail } from '@/server/submissions'
import { OemSubmissionReview } from './oem-review'

interface OemSubmissionPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: OemSubmissionPageProps) {
  const { id } = await params
  const submission = await getSubmissionDetail(id)
  
  return {
    title: submission ? `Review: ${submission.skillName}` : 'Soumission non trouvée',
  }
}

export default async function OemSubmissionPage({ params }: OemSubmissionPageProps) {
  const { id } = await params
  const user = await getMe()

  if (!user) {
    redirect('/login?redirect=/oem')
  }

  const oemOrg = user.organizations.find((o) => o.orgType === 'oem')
  if (!oemOrg) {
    redirect('/oem')
  }

  const submission = await getSubmissionDetail(id)

  if (!submission) {
    notFound()
  }

  return (
    <div className="py-8 md:py-12">
      <div className="container max-w-5xl">
        <OemSubmissionReview submission={submission} canReview={submission.status === 'oem_review'} />
      </div>
    </div>
  )
}
