// app/profile-under-review/page.js  (or pages/profile-under-review.js if you're using pages router)

export default function ProfileUnderReview() {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 dark:text-gray-300 px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center dark:bg-gray-900 dark:text-gray-300">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 dark:bg-gray-900 dark:text-gray-300">
            Profile Under Review
          </h1>
          <p className="text-gray-600 mb-6 dark:bg-gray-900 dark:text-gray-300">
            Thank you for registering as a Specialist. 
            Our team is currently reviewing your profile.
          </p>
          <p className="text-gray-600 mb-6 dark:bg-gray-900 dark:text-gray-300">
            You will be notified via email once your profile is approved.
          </p>
          <div className="flex justify-center">
            <svg
              className="w-24 h-24 text-blue-500 animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
        </div>
      </div>
    );
  }
  