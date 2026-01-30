import { useRouter } from 'next/router'
import { useState } from 'react'
import { useForm, SubmitHandler, Controller } from 'react-hook-form'
import { fetchPostJSON } from '../utils/api-helpers'
import FormButton from '@/components/FormButton'

interface FormData {
  project: boolean
  project_name: string
  project_description: string
  main_focus: string
  potential_impact: string
  project_repository?: string
  social_media_links: string
  open_source?: 'yes' | 'no' | 'partially'
  open_source_license?: string
  partially_open_source?: string
  proposed_budget: string
  received_funding?: 'yes' | 'no'
  prior_funding_details?: string
  your_name: string
  email: string
  is_lead_contributor?: 'yes' | 'no'
  other_lead?: string
  personal_github?: string
  other_contact_details?: string
  prior_contributions?: string
  references: string
}

export default function ProjectSubmissionForm() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty, isValid },
  } = useForm<FormData>({
    mode: 'onBlur',
  })

  const [failureReason, setFailureReason] = useState<string | undefined>()

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setLoading(true)

    const structuredData = {
      project_overview: {
        project_name: data.project_name,
        project_description: data.project_description,
        main_focus: data.main_focus,
        potential_impact: data.potential_impact,
        project_repository: data.project_repository,
        social_media_links: data.social_media_links,
        open_source: data.open_source, // Managed by react-hook-form
        open_source_license: data.open_source_license, // Include license
        partially_open_source: data.partially_open_source, // Include explanation
      },
      project_budget: {
        proposed_budget: data.proposed_budget,
        received_funding: data.received_funding === 'yes',
        prior_funding_details: data.prior_funding_details,
      },
      applicant_information: {
        your_name: data.your_name,
        email: data.email,
        is_lead_contributor: data.is_lead_contributor === 'yes',
        other_lead: data.other_lead,
        personal_github: data.personal_github,
        other_contact_details: data.other_contact_details,
        prior_contributions: data.prior_contributions,
        references: data.references,
      },
    }

    try {
      const res = await fetchPostJSON('/api/github', structuredData)
      if (res.message === 'success') {
        router.push('/projects/submitted')
        setLoading(false)
      } else {
        setFailureReason('Submission failed. Please try again.')
      }
    } catch (e) {
      if (e instanceof Error) {
        setFailureReason(`Error: ${e.message}`)
        console.error('Error submitting project:', e.message)
      } else {
        setFailureReason('An unknown error occurred.')
      }
      setLoading(false)
    }
  }

  const buttonVariant = isValid && isDirty ? 'enabled' : 'disabled'

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex max-w-2xl flex-col gap-4"
      noValidate
    >
      <input type="hidden" {...register('project', { value: true })} />

      <h2 className="text-xl font-semibold">Project Overview</h2>

      {/* Project Name */}
      <div>
        <label className="block" htmlFor="project_name">
          Project Name <span className="text-red-500">*</span>
        </label>
        <input
          id="project_name"
          type="text"
          className={`mt-1 block w-full rounded-none border ${
            errors.project_name ? 'border-red-500' : 'border-gray-300'
          } text-black shadow-sm focus:border-[#C5D3D6] focus:ring focus:ring-[#C5D3D6] focus:ring-opacity-50`}
          {...register('project_name', {
            required: 'Project Name is required',
          })}
          aria-invalid={errors.project_name ? 'true' : 'false'}
          aria-describedby="project_name_error"
        />
        {errors.project_name && (
          <p className="mt-1 text-sm text-red-600" id="project_name_error">
            {errors.project_name.message}
          </p>
        )}
      </div>

      {/* Project Description */}
      <div>
        <label className="block" htmlFor="project_description">
          Project Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="project_description"
          className={`mt-1 block h-40 w-full rounded-none border ${
            errors.project_description ? 'border-red-500' : 'border-gray-300'
          } text-black shadow-sm focus:border-[#C5D3D6] focus:ring focus:ring-[#C5D3D6] focus:ring-opacity-50`}
          {...register('project_description', {
            required: 'Project Description is required',
          })}
          aria-invalid={errors.project_description ? 'true' : 'false'}
          aria-describedby="project_description_error"
        />
        {errors.project_description && (
          <p
            className="mt-1 text-sm text-red-600"
            id="project_description_error"
          >
            {errors.project_description.message}
          </p>
        )}
      </div>

      {/* Main Focus */}
      <div>
        <label className="block" htmlFor="main_focus">
          Main Focus <span className="text-red-500">*</span>
        </label>
        <select
          id="main_focus"
          className={`mt-1 block w-full rounded-none border ${
            errors.main_focus ? 'border-red-500' : 'border-gray-300'
          } text-black shadow-sm focus:border-[#C5D3D6] focus:ring focus:ring-[#C5D3D6] focus:ring-opacity-50`}
          {...register('main_focus', { required: 'Main Focus is required' })}
          aria-invalid={errors.main_focus ? 'true' : 'false'}
          aria-describedby="main_focus_error"
        >
          <option value="">Select a focus</option>
          <option value="litecoin">Litecoin Core</option>
          <option value="meta">Meta Protocols (Eg. Ordinals/Omni)</option>
          <option value="ordinals">Ordinals Lite</option>
          <option value="omni">Omni Layer</option>
          <option value="tools">Tooling (Eg. LDK/LTCSuite)</option>
          <option value="ldk">Litecoin Dev Kit (Rust)</option>
          <option value="ltcsuite">LTC Suite (Go)</option>
          <option value="lightning">Lightning Network</option>
          <option value="atomicswaps">Atomic Swaps</option>
          <option value="education">Education/Guides</option>
          <option value="wallet">Wallets</option>
          <option value="other">Other</option>
        </select>
        {errors.main_focus && (
          <p className="mt-1 text-sm text-red-600" id="main_focus_error">
            {errors.main_focus.message}
          </p>
        )}
      </div>

      {/* Potential Impact */}
      <div>
        <label className="block" htmlFor="potential_impact">
          Potential Impact <span className="text-red-500">*</span>
        </label>
        <textarea
          id="potential_impact"
          className={`mt-1 block h-40 w-full rounded-none border ${
            errors.potential_impact ? 'border-red-500' : 'border-gray-300'
          } text-black shadow-sm focus:border-[#C5D3D6] focus:ring focus:ring-[#C5D3D6] focus:ring-opacity-50`}
          {...register('potential_impact', {
            required: 'Potential Impact is required',
          })}
          aria-invalid={errors.potential_impact ? 'true' : 'false'}
          aria-describedby="potential_impact_error"
        />
        {errors.potential_impact && (
          <p className="mt-1 text-sm text-red-600" id="potential_impact_error">
            {errors.potential_impact.message}
          </p>
        )}
      </div>

      {/* Project Repository */}
      <div>
        <label className="block" htmlFor="project_repository">
          Project Repository
        </label>
        <input
          id="project_repository"
          type="url"
          placeholder="https://github.com/your-repo"
          className={`mt-1 block w-full rounded-none border ${
            errors.project_repository ? 'border-red-500' : 'border-gray-300'
          } text-black shadow-sm focus:border-[#C5D3D6] focus:ring focus:ring-[#C5D3D6] focus:ring-opacity-50`}
          {...register('project_repository', {
            pattern: {
              value:
                /^(https?:\/\/)?(www\.)?github\.com\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+\/?$/,
              message: 'Please enter a valid GitHub repository URL',
            },
          })}
          aria-invalid={errors.project_repository ? 'true' : 'false'}
          aria-describedby="project_repository_error"
        />
        {errors.project_repository && (
          <p
            className="mt-1 text-sm text-red-600"
            id="project_repository_error"
          >
            {errors.project_repository.message}
          </p>
        )}
      </div>

      {/* Social Media Links */}
      <div>
        <label className="block" htmlFor="social_media_links">
          Social Media Links (e.g., X, GitHub, LinkedIn, Facebook, Telegram){' '}
          <span className="text-red-500">*</span>
        </label>
        <textarea
          id="social_media_links"
          className={`mt-1 block w-full rounded-none border ${
            errors.social_media_links ? 'border-red-500' : 'border-gray-300'
          } text-black shadow-sm focus:border-[#C5D3D6] focus:ring focus:ring-[#C5D3D6] focus:ring-opacity-50`}
          {...register('social_media_links', {
            required: 'Social Media Links are required',
          })}
          aria-invalid={errors.social_media_links ? 'true' : 'false'}
          aria-describedby="social_media_links_error"
        />
        {errors.social_media_links && (
          <p
            className="mt-1 text-sm text-red-600"
            id="social_media_links_error"
          >
            {errors.social_media_links.message}
          </p>
        )}
      </div>

      {/* Open Source Section */}
      <div>
        <p className="mb-2">
          Is your project open-source? <span className="text-red-500">*</span>
        </p>
        <Controller
          name="open_source"
          control={control}
          rules={{ required: 'Please select an option' }}
          render={({ field }) => (
            <>
              <div className="flex w-full space-x-4 border border-gray-300 bg-gray-100 p-1">
                <button
                  type="button"
                  className={`flex-grow rounded-lg px-4 py-2 shadow ${
                    field.value === 'yes'
                      ? 'bg-[#C5D3D6] text-[#222222] shadow-md'
                      : 'bg-white text-[#222222] shadow-md'
                  }`}
                  onClick={() => field.onChange('yes')}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={`flex-grow rounded-lg px-4 py-2 shadow ${
                    field.value === 'no'
                      ? 'bg-gray-300 text-[#222222] shadow-md'
                      : 'bg-white text-[#222222] shadow-md'
                  }`}
                  onClick={() => field.onChange('no')}
                >
                  No
                </button>
                <button
                  type="button"
                  className={`flex-grow rounded-lg px-4 py-2 shadow ${
                    field.value === 'partially'
                      ? 'bg-[#C5D3D6] text-[#222222] shadow-md'
                      : 'bg-white text-[#222222] shadow-md'
                  }`}
                  onClick={() => field.onChange('partially')}
                >
                  Partially
                </button>
              </div>
              {errors.open_source && (
                <p className="mt-1 text-sm text-red-600" id="open_source_error">
                  {errors.open_source.message}
                </p>
              )}
              {field.value === 'yes' && (
                <div className="ml-4 mt-4 text-sm">
                  <label className="block" htmlFor="open_source_license">
                    Please provide the open-source license used (e.g., MIT, GPL,
                    Apache 2.0). <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="open_source_license"
                    type="text"
                    className={`mt-1 block w-full rounded-none border ${
                      errors.open_source_license
                        ? 'border-red-500'
                        : 'border-gray-300'
                    } text-black shadow-sm focus:border-[#C5D3D6] focus:ring focus:ring-[#C5D3D6] focus:ring-opacity-50`}
                    {...register('open_source_license', {
                      required:
                        field.value === 'yes'
                          ? 'Open-source license is required'
                          : false,
                    })}
                    aria-invalid={errors.open_source_license ? 'true' : 'false'}
                    aria-describedby="open_source_license_error"
                  />
                  {errors.open_source_license && (
                    <p
                      className="mt-1 text-sm text-red-600"
                      id="open_source_license_error"
                    >
                      {errors.open_source_license.message}
                    </p>
                  )}
                </div>
              )}
              {field.value === 'no' && (
                <div className="ml-4 mt-4 text-sm">
                  <p>This project is not open-source.</p>
                </div>
              )}
              {field.value === 'partially' && (
                <div className="ml-4 mt-4 text-sm">
                  <label className="block" htmlFor="partially_open_source">
                    Please briefly explain which parts of your project are
                    open-source and which are not. Also, provide the open-source
                    license used for the open-source parts.{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="partially_open_source"
                    className={`mt-1 block w-full rounded-none border ${
                      errors.partially_open_source
                        ? 'border-red-500'
                        : 'border-gray-300'
                    } text-black shadow-sm focus:border-[#C5D3D6] focus:ring focus:ring-[#C5D3D6] focus:ring-opacity-50`}
                    {...register('partially_open_source', {
                      required:
                        field.value === 'partially'
                          ? 'This field is required'
                          : false,
                    })}
                    aria-invalid={
                      errors.partially_open_source ? 'true' : 'false'
                    }
                    aria-describedby="partially_open_source_error"
                  />
                  {errors.partially_open_source && (
                    <p
                      className="mt-1 text-sm text-red-600"
                      id="partially_open_source_error"
                    >
                      {errors.partially_open_source.message}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        />
      </div>

      <h2 className="text-xl font-semibold">Project Budget</h2>

      {/* Proposed Budget */}
      <div>
        <label className="block" htmlFor="proposed_budget">
          Proposed Budget <span className="text-red-500">*</span>
        </label>
        <textarea
          id="proposed_budget"
          className={`mt-1 block w-full rounded-none border ${
            errors.proposed_budget ? 'border-red-500' : 'border-gray-300'
          } text-black shadow-sm focus:border-[#C5D3D6] focus:ring focus:ring-[#C5D3D6] focus:ring-opacity-50`}
          {...register('proposed_budget', {
            required: 'Proposed Budget is required',
          })}
          aria-invalid={errors.proposed_budget ? 'true' : 'false'}
          aria-describedby="proposed_budget_error"
        />
        {errors.proposed_budget && (
          <p className="mt-1 text-sm text-red-600" id="proposed_budget_error">
            {errors.proposed_budget.message}
          </p>
        )}
      </div>

      {/* Received Funding */}
      <div>
        <p className="">
          Has this project received any prior funding?{' '}
          <span className="text-red-500">*</span>
        </p>
        <Controller
          name="received_funding"
          control={control}
          rules={{ required: 'Please select an option' }}
          render={({ field }) => (
            <>
              <div className="flex w-full space-x-4 border border-gray-300 bg-gray-100 p-1">
                <button
                  type="button"
                  className={`flex-grow rounded-lg px-4 py-2 shadow ${
                    field.value === 'yes'
                      ? 'bg-[#C5D3D6] text-[#222222] shadow-md'
                      : 'bg-white text-[#222222] shadow-md'
                  }`}
                  onClick={() => field.onChange('yes')}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={`flex-grow rounded-lg px-4 py-2 shadow ${
                    field.value === 'no'
                      ? 'bg-gray-300 text-[#222222] shadow-md'
                      : 'bg-white text-[#222222] shadow-md'
                  }`}
                  onClick={() => field.onChange('no')}
                >
                  No
                </button>
              </div>
              {errors.received_funding && (
                <p
                  className="mt-1 text-sm text-red-600"
                  id="received_funding_error"
                >
                  {errors.received_funding.message}
                </p>
              )}
              {field.value === 'yes' && (
                <div className="ml-4 mt-4 text-sm">
                  <label className="block" htmlFor="prior_funding_details">
                    This project has received prior funding. Please describe:{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="prior_funding_details"
                    className={`mt-1 block w-full rounded-none border ${
                      errors.prior_funding_details
                        ? 'border-red-500'
                        : 'border-gray-300'
                    } text-black shadow-sm focus:border-[#C5D3D6] focus:ring focus:ring-[#C5D3D6] focus:ring-opacity-50`}
                    {...register('prior_funding_details', {
                      required:
                        field.value === 'yes'
                          ? 'Please provide details about prior funding'
                          : false,
                    })}
                    aria-invalid={
                      errors.prior_funding_details ? 'true' : 'false'
                    }
                    aria-describedby="prior_funding_details_error"
                  />
                  {errors.prior_funding_details && (
                    <p
                      className="mt-1 text-sm text-red-600"
                      id="prior_funding_details_error"
                    >
                      {errors.prior_funding_details.message}
                    </p>
                  )}
                </div>
              )}
              {field.value === 'no' && (
                <div className="ml-4 mt-4 text-sm">
                  <p>This project has not received prior funding.</p>
                </div>
              )}
            </>
          )}
        />
      </div>

      <h2 className="text-xl font-semibold">Applicant Information</h2>

      {/* Your Name */}
      <div>
        <label className="block" htmlFor="your_name">
          Your Name <span className="text-red-500">*</span>
        </label>
        <input
          id="your_name"
          type="text"
          className={`mt-1 block w-full rounded-none border ${
            errors.your_name ? 'border-red-500' : 'border-gray-300'
          } text-black shadow-sm focus:border-[#C5D3D6] focus:ring focus:ring-[#C5D3D6] focus:ring-opacity-50`}
          {...register('your_name', { required: 'Your Name is required' })}
          aria-invalid={errors.your_name ? 'true' : 'false'}
          aria-describedby="your_name_error"
        />
        {errors.your_name && (
          <p className="mt-1 text-sm text-red-600" id="your_name_error">
            {errors.your_name.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block" htmlFor="email">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          className={`mt-1 block w-full rounded-none border ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          } text-black shadow-sm focus:border-[#C5D3D6] focus:ring focus:ring-[#C5D3D6] focus:ring-opacity-50`}
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value:
                /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/,
              message: 'Please enter a valid email address',
            },
          })}
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby="email_error"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600" id="email_error">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Lead Contributor */}
      <div>
        <p className="">
          Are you the Project Lead / Lead Contributor?{' '}
          <span className="text-red-500">*</span>
        </p>
        <Controller
          name="is_lead_contributor"
          control={control}
          rules={{ required: 'Please select an option' }}
          render={({ field }) => (
            <>
              <div className="flex w-full space-x-4 border border-gray-300 bg-gray-100 p-1">
                <button
                  type="button"
                  className={`flex-grow rounded-lg px-4 py-2 shadow ${
                    field.value === 'yes'
                      ? 'bg-[#C5D3D6] text-[#222222] shadow-md'
                      : 'bg-white text-[#222222] shadow-md'
                  }`}
                  onClick={() => field.onChange('yes')}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={`flex-grow rounded-lg px-4 py-2 shadow ${
                    field.value === 'no'
                      ? 'bg-gray-300 text-[#222222] shadow-md'
                      : 'bg-white text-[#222222] shadow-md'
                  }`}
                  onClick={() => field.onChange('no')}
                >
                  No
                </button>
              </div>
              {errors.is_lead_contributor && (
                <p
                  className="mt-1 text-sm text-red-600"
                  id="is_lead_contributor_error"
                >
                  {errors.is_lead_contributor.message}
                </p>
              )}
              {field.value === 'yes' && (
                <div className="ml-4 mt-4 text-sm">
                  <p>I am the lead contributor.</p>
                </div>
              )}
              {field.value === 'no' && (
                <div className="ml-4 mt-4 text-sm">
                  <label className="block" htmlFor="other_lead">
                    Who is the project lead?{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="other_lead"
                    type="text"
                    className={`mt-1 block w-full rounded-none border ${
                      errors.other_lead ? 'border-red-500' : 'border-gray-300'
                    } text-black shadow-sm focus:border-[#C5D3D6] focus:ring focus:ring-[#C5D3D6] focus:ring-opacity-50`}
                    {...register('other_lead', {
                      required:
                        field.value === 'no'
                          ? 'Project lead name is required'
                          : false,
                    })}
                    aria-invalid={errors.other_lead ? 'true' : 'false'}
                    aria-describedby="other_lead_error"
                  />
                  {errors.other_lead && (
                    <p
                      className="mt-1 text-sm text-red-600"
                      id="other_lead_error"
                    >
                      {errors.other_lead.message}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        />
      </div>

      {/* Personal Github */}
      <div>
        <label className="block" htmlFor="personal_github">
          Personal Github (or similar, if applicable)
        </label>
        <input
          id="personal_github"
          type="url"
          placeholder="https://github.com/your-username"
          className={`mt-1 block w-full rounded-none border ${
            errors.personal_github ? 'border-red-500' : 'border-gray-300'
          } text-black shadow-sm focus:border-[#C5D3D6] focus:ring focus:ring-[#C5D3D6] focus:ring-opacity-50`}
          {...register('personal_github', {
            pattern: {
              value: /^(https?:\/\/)?(www\.)?github\.com\/[A-Za-z0-9_-]+\/?$/,
              message: 'Please enter a valid GitHub profile URL',
            },
          })}
          aria-invalid={errors.personal_github ? 'true' : 'false'}
          aria-describedby="personal_github_error"
        />
        {errors.personal_github && (
          <p className="mt-1 text-sm text-red-600" id="personal_github_error">
            {errors.personal_github.message}
          </p>
        )}
      </div>

      {/* Other Contact Details */}
      <div>
        <label className="block" htmlFor="other_contact_details">
          Other Contact Details
        </label>
        <textarea
          id="other_contact_details"
          className={`mt-1 block w-full rounded-none border ${
            errors.other_contact_details ? 'border-red-500' : 'border-gray-300'
          } text-black shadow-sm focus:border-[#C5D3D6] focus:ring focus:ring-[#C5D3D6] focus:ring-opacity-50`}
          {...register('other_contact_details')}
        />
        {errors.other_contact_details && (
          <p
            className="mt-1 text-sm text-red-600"
            id="other_contact_details_error"
          >
            {errors.other_contact_details.message}
          </p>
        )}
      </div>

      {/* Prior Contributions */}
      <div>
        <label className="block" htmlFor="prior_contributions">
          Prior Contributions
        </label>
        <textarea
          id="prior_contributions"
          className={`mt-1 block h-40 w-full rounded-none border ${
            errors.prior_contributions ? 'border-red-500' : 'border-gray-300'
          } text-black shadow-sm focus:border-[#C5D3D6] focus:ring focus:ring-[#C5D3D6] focus:ring-opacity-50`}
          {...register('prior_contributions')}
        />
        {errors.prior_contributions && (
          <p
            className="mt-1 text-sm text-red-600"
            id="prior_contributions_error"
          >
            {errors.prior_contributions.message}
          </p>
        )}
      </div>

      {/* References */}
      <div>
        <label className="block" htmlFor="references">
          References <span className="text-red-500">*</span>
        </label>
        <textarea
          id="references"
          className={`mt-1 block w-full rounded-none border ${
            errors.references ? 'border-red-500' : 'border-gray-300'
          } text-black shadow-sm focus:border-[#C5D3D6] focus:ring focus:ring-[#C5D3D6] focus:ring-opacity-50`}
          {...register('references', { required: 'References are required' })}
          aria-invalid={errors.references ? 'true' : 'false'}
          aria-describedby="references_error"
        />
        {errors.references && (
          <p className="mt-1 text-sm text-red-600" id="references_error">
            {errors.references.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <FormButton
        variant={
          buttonVariant === 'enabled' ? 'enabledSpecific' : buttonVariant
        }
        type="submit"
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Submit Project'}
      </FormButton>

      {/* Failure Reason */}
      {!!failureReason && (
        <p className="rounded bg-red-500 p-4 text-white">
          Something went wrong! {failureReason}
        </p>
      )}
    </form>
  )
}
