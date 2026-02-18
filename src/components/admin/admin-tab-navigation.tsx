import {
  BarChart3,
  Inbox,
  LayoutTemplate,
  MessageCircle,
  PenSquare,
  Sparkles,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { AdminTab } from './admin-shared'

type AdminTabNavigationProps = {
  activeTab: AdminTab
  onTabChange: (tab: AdminTab) => void
}

const tabs: Array<{
  id: AdminTab
  label: string
  icon: typeof LayoutTemplate
}> = [
  { id: 'projects', label: 'Projects', icon: LayoutTemplate },
  { id: 'testimonials', label: 'Testimonials', icon: MessageCircle },
  { id: 'messages', label: 'Messages', icon: Inbox },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'wall', label: 'Wall', icon: PenSquare },
  { id: 'widgets', label: 'Site Widgets', icon: Sparkles },
]

export function AdminTabNavigation({
  activeTab,
  onTabChange,
}: AdminTabNavigationProps) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant={activeTab === tab.id ? 'default' : 'outline'}
          className="rounded-full"
          onClick={() => onTabChange(tab.id)}
        >
          <tab.icon className="h-4 w-4" />
          {tab.label}
        </Button>
      ))}
    </div>
  )
}
