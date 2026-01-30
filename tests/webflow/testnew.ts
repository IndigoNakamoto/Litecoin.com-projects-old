// testWebflow.ts

import {
  getCollectionSchema,
  createOptionIdToLabelMap,
  getActiveMatchingDonors,
  getMatchingTypeLabelForDonor,
  getSupportedProjectsForDonor,
  getMatchingTypeLabel,
  getAllProjects,
  getAllPosts,
  getAllUpdates,
  getAllContributors,
  getProjectBySlug,
  getProjectUpdatesBySlug,
  getPostsByProjectIdLocal,
  getPostsBySlug,
  getMatchingDonorById,
  getMatchingDonorsByProjectSlug,
  getFAQsByProjectSlug,
} from '../../utils/webflow' // Adjust the path as necessary
;(async () => {
  try {
    // // Test getCollectionSchema failed
    // console.log('Testing getCollectionSchema...')
    // const collectionId = process.env.WEBFLOW_COLLECTION_ID_MATCHING_DONORS
    // const schema = await getCollectionSchema(collectionId!)
    // console.log('Collection Schema:', JSON.stringify(schema, null, 2))

    // // Test createOptionIdToLabelMap failed
    // console.log('\nTesting createOptionIdToLabelMap...')
    // const fieldSlug = 'status' // Or 'matching-type', depending on what you want to test
    // const optionMap = await createOptionIdToLabelMap(collectionId!, fieldSlug)
    // console.log(`Option Map for field '${fieldSlug}':`)
    // optionMap.forEach((label, id) => {
    //   console.log(`ID: ${id} => Label: ${label}`)
    // })

    // Test getPostsBySlug
    // console.log('\nTesting getPostsBySlug...')
    // const slug = 'mweb'
    // const posts = await getPostsBySlug(slug)
    // console.log(`Posts for ${slug}: `, posts)

    // Test getActiveMatchingDonors
    // console.log('\nTesting getActiveMatchingDonors...')
    // const activeDonors = await getActiveMatchingDonors()
    // console.log('Active Matching Donors: ', activeDonors)

    // Test getMatchingDonorById
    // console.log('\nTesting getMatchingDonorById...')
    // const matchingDonor = await getMatchingDonorById('670718cdf8133590e50b7770')
    // console.log('matching donor info: ', matchingDonor)

    // Test getFAQsByProjectSlug
    // console.log(`\ngetFAQsByProjectSlug...`)
    // const faqs = await getFAQsByProjectSlug('core')
    // console.log('FAQs for core: ', faqs)

    // Test getMatchingDonorsByProjectSlug
    // console.log(`\nTesting getMatchingDonorsByProjectSlug...`)
    // const matchingDonors = await getMatchingDonorsByProjectSlug('ordinals-lite')
    // console.log('matching donors for slug: ', matchingDonors)

    // const donorMatchingType = await getMatchingTypeLabelForDonor(
    //   activeDonors[0]
    // )
    // console.log('Donor matching type: ', donorMatchingType)

    // const donorMatchingProjects = await getSupportedProjectsForDonor(
    //   activeDonors[0]
    // )
    // console.log('Donor projects matching: ', donorMatchingProjects)

    // // Test getAllProjects
    // console.log('\nTesting getAllProjects...')
    // const projects = await getAllProjects()
    // console.log('Projects:', JSON.stringify(projects, null, 2))

    // // Test getAllPosts
    // console.log('\nTesting getAllPosts...')
    // const posts = await getAllPosts()
    // console.log('Posts:', JSON.stringify(posts, null, 2))

    // // Test getAllUpdates
    // console.log('\nTesting getAllUpdates...')
    // const updates = await getAllUpdates()
    // console.log('Updates:', JSON.stringify(updates, null, 2))

    // Test getAllContributors
    console.log('\nTesting getAllContributors...')
    const contributors = await getAllContributors()
    console.log('Contributors:', JSON.stringify(contributors, null, 2))

    // // Test getProjectBySlug
    // const projectSlug = 'ordinals-lite' // Replace with an actual project slug
    // console.log('\nTesting getProjectBySlug...')
    // const projectWithDetails = await getProjectBySlug(projectSlug)
    // console.log(
    //   `Project '${projectSlug}':`,
    //   JSON.stringify(projectWithDetails, null, 2)
    // )

    // // Test getProjectUpdatesBySlug
    // console.log('\nTesting getProjectUpdatesBySlug...')
    // const projectUpdates = await getProjectUpdatesBySlug(projectSlug)
    // console.log(
    //   `Updates for project '${projectSlug}':`,
    //   JSON.stringify(projectUpdates, null, 2)
    // )

    // Test getPostsByProjectIdLocal
    // console.log('\nTesting getPostsByProjectIdLocal...')
    // if (projectWithDetails) {
    //   const projectId = projectWithDetails.id
    //   const projectPostsLocal = await getPostsByProjectIdLocal(projectId)
    //   console.log(
    //     `Posts (local filter) for project ID '${projectId}':`,
    //     JSON.stringify(projectPostsLocal, null, 2)
    //   )
    // } else {
    //   console.log(`Project '${projectSlug}' not found.`)
    // }

    console.log('\nAll tests completed successfully.')
  } catch (error: any) {
    console.error('An error occurred during testing:', error)
  }
})()

// to run in terminal run: npx ts-node tests/webflow/testnew.ts
