import React, { useState } from 'react';

function GuideButton({
  buttonColor = 'bg-blue-500',
  buttonHoverColor = 'bg-blue-600',
  iconColor = 'text-white',
  guides
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentPage(0);
  };

  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, guides.length - 1));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 0));

  if (!guides || guides.length === 0) {
    return null;
  }

  return (
    <>
      <button
        className={`p-2 rounded-full ${buttonColor} ${iconColor} hover:${buttonHoverColor} transition-colors duration-300`}
        onClick={openModal}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-300"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-3xl font-bold mb-6 text-gray-900 text-left">Re-annotation Tutorial</h2>
            <img 
              src={guides[currentPage].image} 
              alt={`Guide ${currentPage + 1}`} 
              className="w-full h-auto max-h-[50vh] object-contain mb-6 rounded"
            />
            <h3 className="text-2xl font-bold mb-2 text-gray-800">{guides[currentPage].subtitle}</h3>
            <p className="text-gray-700 mb-6 text-lg">{guides[currentPage].description}</p>
            <div className="flex justify-between items-center">
              <button
                onClick={prevPage}
                disabled={currentPage === 0}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded disabled:opacity-50 text-lg"
              >
                &lt;
              </button>
              <span className="text-gray-500 text-xl">{currentPage + 1} / {guides.length}</span>
              <button
                onClick={nextPage}
                disabled={currentPage === guides.length - 1}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded disabled:opacity-50 text-lg"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default GuideButton;