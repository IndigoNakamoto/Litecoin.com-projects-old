// components/ProjectHeader.tsx
type ProjectHeaderProps = {
  title: string
  summary: string
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ title, summary }) => (
  <header>
    <h1 className="pb-4 font-space-grotesk text-[39px] font-semibold leading-9 tracking-tight text-gray-900 sm:leading-10  md:leading-14">
      {title}
    </h1>
    <p className="prose max-w-none pb-0 pt-0 text-lg font-medium">{summary}</p>
  </header>
)

export default ProjectHeader
