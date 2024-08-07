import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StarRating = ({ label, rating, onRatingChange }) => {
  const [selection, setSelection] = useState(0);

  const hoverOver = event => {
    let val = 0;
    if (event && event.target && event.target.getAttribute('star-id')) {
      val = parseInt(event.target.getAttribute('star-id'));
    }
    setSelection(val);
  };

  return (
    <div className="flex flex-col items-start mb-4">
      <div>{label}</div>
      <div
        className="flex flex-row items-center"
        onMouseOut={() => hoverOver(null)}
        onClick={event => onRatingChange(parseInt(event.target.getAttribute('star-id') || rating))}
        onMouseOver={hoverOver}
      >
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={`star_${i + 1}`}
            starId={i + 1}
            marked={selection ? selection >= i + 1 : rating >= i + 1}
          />
        ))}
      </div>
    </div>
  );
};

const Star = ({ marked, starId }) => (
  <span
    star-id={starId}
    className="text-[#ff9933] text-2xl mr-2 cursor-pointer"
    role="button"
  >
    {marked ? '\u2605' : '\u2606'}
  </span>
);

const OrderNotes = ({ content, onContentChange }) => (
  <div className="relative overflow-hidden rounded-lg border border-gray-200 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 w-[29.8rem] h-48 mb-4">
    <textarea
      id="OrderNotes"
      className="w-full h-full resize-none border-none p-2 focus:ring-0 sm:text-sm"
      placeholder="Enter your suggestions..."
      value={content}
      onChange={(e) => onContentChange(e.target.value)}
      maxLength={1000}
    />
  </div>
);

const PromptFeedback = ({ message, onClose, isSuccess }) => (
  <div role="alert" className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
    <div className="rounded-xl border border-gray-100 bg-white p-4">
      <div className="flex items-start gap-4">
        <span className={isSuccess ? "text-green-600" : "text-red-600"}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d={isSuccess ? "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" : "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"} />
          </svg>
        </span>
        <div className="flex-1">
          <strong className="block font-medium text-gray-900">{isSuccess ? "Success!" : "Error"}</strong>
          <p className="mt-1 text-sm text-gray-700">{message}</p>
        </div>
        <button className="text-gray-500 transition hover:text-gray-600" onClick={onClose}>
          <span className="sr-only">Dismiss popup</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
);

const ReportFeedbackPage = () => {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setIsDisabled(!(rating && content));
  }, [rating, content]);

  const handleSubmit = async () => {
    try {
      const response = await axios.post('/api/user/report_feedback', {
        rating: rating,
        content: content
      });

      if (response.data.status_code === 201) {
        setIsSuccess(true);
        setFeedbackMessage(response.data.message);
      } else {
        setIsSuccess(false);
        setFeedbackMessage('An unexpected error occurred. Please try again.');
      }
    } catch (error) {
      setIsSuccess(false);
      if (error.response) {
        setFeedbackMessage(error.response.data.message || 'An error occurred while submitting feedback.');
      } else {
        setFeedbackMessage('Network error. Please check your connection and try again.');
      }
    }
    setShowFeedback(true);
  };

  const handleClear = () => {
    setRating(0);
    setContent('');
  };

  const handleCloseFeedback = () => {
    setShowFeedback(false);
    if (isSuccess) {
      handleClear();
      navigate('/user'); // 성공 페이지로 라우팅
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-[32rem] p-6 border border-gray-300 rounded-lg bg-white shadow-md">
        <h1 className="text-2xl font-bold mb-6">Report Feedback</h1>
        <StarRating label="How would you rate our product?" rating={rating} onRatingChange={setRating} />
        <OrderNotes content={content} onContentChange={setContent} />
        <div className="flex justify-end mt-4">
          <button
            type="button"
            className="rounded bg-white text-blue-500 border border-blue-500 px-4 py-2 text-sm font-medium hover:bg-blue-500 hover:text-white transition-colors"
            onClick={handleClear}
          >
            Clear
          </button>
          <button
            type="button"
            className={`rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 ml-4 transition-colors ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleSubmit}
            disabled={isDisabled}
          >
            Submit
          </button>
        </div>
        {showFeedback && <PromptFeedback message={feedbackMessage} onClose={handleCloseFeedback} isSuccess={isSuccess} />}
      </div>
    </div>
  );
};

export default ReportFeedbackPage;
