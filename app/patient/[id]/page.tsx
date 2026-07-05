export function generateStaticParams() {
  return [{ id: 'new' }]
}

import PatientDetailClient from './patient-detail-client'

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <PatientDetailClient id={id} />
}
