import JobFeedScreen from '@/components/JobFeedScreen'
import WorkerLayout from '@/components/layouts/WorkerLayout'

export const metadata = {
  title: 'Лента смен - ШЕФ-МОНТАЖ',
  description: 'Доступные смены для монтажников и бригадиров',
}

export default function FeedPage() {
  return (
    <WorkerLayout>
      <JobFeedScreen />
    </WorkerLayout>
  )
}
