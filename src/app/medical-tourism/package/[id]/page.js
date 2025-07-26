// src/app/medical-tourism/package/[id]/page.js

import { fetchData } from '@/utils/api'
import {
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import Link from "next/link";


export default async function PackagePage({ params }) {
  const { id } = params // Getting the `id` directly from `params`

  let packageData = null
  let error = null

  try {
    packageData = await fetchData(`tour/${id}`)
  } catch (err) {
    error = 'Failed to fetch package data.'
    console.error(err)
  }

  if (!packageData) {
    return <div>{error || 'No package found.'}</div>
  }

  const { name, description, services, location, duration, price } = packageData

  return (
    <div
      className="relative py-24 sm:py-32"
      style={{
        backgroundImage: "url('https://nairametrics.com/wp-content/uploads/2021/06/Medical-tourism.jpg')",
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/90 z-0" />

      {/* Content */}
      <div className="relative z-5 mx-auto max-w-4xl px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-sm font-semibold text-indigo-600">Medical Tourism Package</h2>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">{name}</h1>
          <p className="mt-4 text-lg text-gray-600">{description}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Info */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPinIcon className="h-6 w-6 text-indigo-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">Location</p>
                <p className="text-base text-gray-900">{location}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ClockIcon className="h-6 w-6 text-indigo-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">Duration</p>
                <p className="text-base text-gray-900">{duration}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CurrencyDollarIcon className="h-6 w-6 text-indigo-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">Price</p>
                <p className="text-base text-gray-900">${Number(price).toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Included Services</h3>
            <ul className="space-y-3">
              {(services || []).map((service, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircleIcon className="h-5 w-5 text-indigo-500 mt-1" />
                  <span className="text-gray-700">{service}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Section */}
          <div className="relative z-10 mt-24 text-center">
            <div className="inline-block rounded-lg bg-indigo-600 px-6 py-4 shadow-lg hover:shadow-xl transition duration-300">
              <Link
                href={`/medical-tourism/book/${id}`}
                className="text-white text-lg font-medium"
              >
                Book Consultation Appointment →
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
