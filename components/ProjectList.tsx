export {}
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faArrowRight, faC, faClose } from '@fortawesome/free-solid-svg-icons'
// import ProjectCard from './ProjectCard'
// import Link from 'next/link'
// import { ProjectItem } from '../utils/types'
// import { useEffect, useState } from 'react'

// type ProjectListProps = {
//   header?: string
//   exclude?: string
//   projects: ProjectItem[]
//   columns?: number
//   openPaymentModal: (project: ProjectItem) => void
// }
// const ProjectList: React.FC<ProjectListProps> = ({
//   header = 'Explore Projects',
//   exclude,
//   projects,
//   columns = 2,
//   openPaymentModal,
// }) => {
//   const [sortedProjects, setSortedProjects] = useState<ProjectItem[]>()

//   useEffect(() => {
//     setSortedProjects(
//       projects.filter((p) => p.slug !== exclude).sort(() => 0.5 - Math.random())
//     )
//   }, [projects])

//   const gridClass = `grid max-w-5xl gap-4 md:grid-cols-${columns}`

//   return (
//     <section className="bg-light items-left flex flex-col">
//       <ul className={gridClass}>
//         {sortedProjects &&
//           sortedProjects.slice(0, 6).map((p, i) => (
//             <li key={i} className="">
//               <ProjectCard
//                 project={p}
//                 openPaymentModal={openPaymentModal}
//                 bgColor={''}
//               />
//             </li>
//           ))}
//       </ul>
//     </section>
//   )
// }

// export default ProjectList
