import {
  ProjectShowcase,
  type ProjectShowcaseItem,
} from '@/components/project-showcase'

type LandingProjectsSectionProps = {
  projects: ProjectShowcaseItem[]
}

export function LandingProjectsSection({ projects }: LandingProjectsSectionProps) {
  return (
    <section id="projects-section" className="py-0">
      {projects.length > 0 ? (
        <ProjectShowcase projects={projects} />
      ) : (
        <p className="text-muted-foreground">
          Projects will appear here once published from admin.
        </p>
      )}
    </section>
  )
}
