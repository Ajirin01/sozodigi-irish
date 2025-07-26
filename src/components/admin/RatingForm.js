const RatingForm = ({
    rating,
    setRating,
    comment,
    setComment,
    handleRateSession,
    isSubmitting
  }) => {
    return (
      <div className="w-full max-w-md space-y-4 text-left">
        <label className="block text-sm text-gray-700 dark:text-gray-300">
          Rating (1 to 5):
          <input
            type="number"
            value={rating}
            min={1}
            max={5}
            onChange={(e) => setRating(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 rounded border border-gray-300 dark:bg-gray-700 dark:text-white"
          />
        </label>
        <label className="block text-sm text-gray-700 dark:text-gray-300">
          Comment:
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded border border-gray-300 dark:bg-gray-700 dark:text-white"
          />
        </label>
        <button
          onClick={handleRateSession}
          disabled={isSubmitting}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Rating'}
        </button>
      </div>
    );
  };
  
  export default RatingForm;
  