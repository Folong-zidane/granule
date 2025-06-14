// Déplacer le contenu de app/page.tsx (dashboard) ici
// Contenu inchangé
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { RecentDocuments } from "@/components/dashboard/recent-documents"
import { PopularTemplates } from "@/components/dashboard/popular-templates"
import { RecentActivities } from "@/components/dashboard/recent-activities"

export default function DashboardPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <DashboardHeader />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="md:col-span-2 space-y-6">
          <RecentDocuments />
          <PopularTemplates />
        </div>
        <div>
          <RecentActivities />
        </div>
      </div>
    </div>
  )
}
