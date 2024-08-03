import React, { useState } from 'react';

function StarRating(props) {
  // Star scoring module
  const [rating, setRating] = useState(
    typeof props.rating === 'number' ? props.rating : 0
  );
  // Mouse move effect
  const [selection, setSelection] = useState(0);

  const hoverOver = event => {
    let val = 0;
    if (event && event.target && event.target.getAttribute('star-id')) {
      val = event.target.getAttribute('star-id');
    }
    setSelection(val);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '1rem' }}>
      {/* Show the text in front of the star */}
      <div>{props.label}</div>
      {/* Display star module */}
      <div
        style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
        onMouseOut={() => hoverOver(null)}
        onClick={event => setRating(event.target.getAttribute('star-id') || rating)}
        onMouseOver={hoverOver}
      >
        {Array.from({ length: 5 }, (v, i) => (
          <Star
            starId={i + 1}
            key={`star_${i + 1}`}
            marked={selection ? selection >= i + 1 : rating >= i + 1}
          />
        ))}
      </div>
    </div>
  );
}

function Star({ marked, starId }) {
  return (
    <span star-id={starId} style={{ color: '#ff9933', fontSize: '2rem', marginRight: '0.5rem' }} role="button">
      {/* Empty star, solid star */}
      {marked ? '\u2605' : '\u2606'}
    </span>
  );
}

const OrderNotes = () => {
  return (
    <div>

      <div
        className="relative overflow-hidden rounded-lg border border-gray-200 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600"
        style={{ width: '29.8rem', height: '12rem', marginBottom: '1rem', position: 'relative' }}
      >
        <textarea
          id="OrderNotes"
          className="w-full h-full resize-none border-none align-top focus:ring-0 sm:text-sm absolute top-0 left-0" // 使用绝对定位将文本框置于最上层
          placeholder="Enter your suggestions..."
        ></textarea>

        <div className="absolute inset-0 flex items-end justify-end pointer-events-none">

        </div>
      </div>
    </div>
  );
};

const PromptSuccessfulFeedback = ({ onClose }) => {
  return (
    <div role="alert" className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="rounded-xl border border-gray-100 bg-white p-4">
        <div className="flex items-start gap-4">
          <span className="text-green-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </span>

          <div className="flex-1">
            <strong className="block font-medium text-gray-900">Feedback successfully!</strong>
            <p className="mt-1 text-sm text-gray-700">Administrator will respond to you shortly.</p>
          </div>

          <button className="text-gray-500 transition hover:text-gray-600" onClick={onClose}>
            <span className="sr-only">Dismiss popup</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [showSuccessFeedback, setShowSuccessFeedback] = useState(false);

  const handleSave = () => {
    // Process save logic
    setShowSuccessFeedback(true);
    console.log('Submit');
  };

  const handleBack = () => {
    // Process return logic
    console.log('Clear');
  };

  const handleCloseFeedback = () => {
    setShowSuccessFeedback(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div style={{ width: '32rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '0.5rem', background: '#f0f7ed' }}>
        <h1><StarRating label="How would you rate our product?" rating={5} /></h1>
        <OrderNotes />
        <div className="flex justify-end mt-4">
          <button
            type="button"
            className="rounded bg-white text-blue-500 border border-blue-500 px-3 py-1.5 text-sm font-medium hover:bg-blue-500 hover:text-white"
            onClick={handleBack}
          >
            Clear
          </button>
          <button
            type="button"
            className="rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 ml-4"
            onClick={handleSave}
          >
            Submit
          </button>
        </div>
        {showSuccessFeedback && <PromptSuccessfulFeedback onClose={handleCloseFeedback} />}
      </div>
    </div>
  );
};

export default App;
