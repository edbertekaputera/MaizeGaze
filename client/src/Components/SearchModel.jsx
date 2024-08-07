import React, { useState } from 'react';
import { Checkbox } from 'flowbite-react';

const SearchNodel = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedItems, setSelectedItems] = useState(new Set());

  const handleDeleteClick = (target) => {
    setDeleteTarget(target);
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    // Handle deletion logic here
    setShowConfirm(false);
    setShowDeleteConfirm(false); // Hide delete confirmation modal
    setShowSuccess(true);
    // Auto-hide success modal after a delay
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleCheckboxChange = (name) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(name)) {
        newSet.delete(name);
      } else {
        newSet.add(name);
      }
      return newSet;
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(new Set(['John Doe', 'Jane Doe', 'Gary Barlow']));
    } else {
      setSelectedItems(new Set());
    }
  };

  // Show popup when there are selected items
  const handlePopup = () => {
    setShowPopup(selectedItems.size > 0);
  };

  // Update popup visibility when selectedItems changes
  React.useEffect(() => {
    handlePopup();
  }, [selectedItems]);

  return (
    <div className="overflow-x-auto">
      <div className="text-left mt-4 ml-4">
        <h1 className="text-2xl font-bold">History of Training Results</h1>
      </div>
      <hr className="border-b-2 border-gray-400 mb-6 w-50 ml-0"/>

      {/* Popup for selected items */}
      {showPopup && (
        <div className="bg-gray-100 border border-gray-300 p-2 rounded-md mb-4 flex items-center max-w-xs relative"> {/* Adjust padding and width */}
          <i className="fas fa-exclamation-circle mr-2 text-gray-600"></i> {/* Warning icon */}
          <p className="mr-4 text-sm whitespace-nowrap">You have selected {selectedItems.size} item(s).</p>
          <button
            onClick={() => setShowDeleteConfirm(true)} // Show delete confirmation popup
            className="bg-red-600 text-white px-2 py-1 text-xs rounded-md flex items-center ml-auto" // Use ml-auto to align right and adjust button size
          >
            <i className="fas fa-trash-alt mr-1 text-sm"></i> {/* Font Awesome trash icon */}
            Remove
          </button>
        </div>
      )}

      <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
        <thead className="bg-green-100 text-white">
          <tr>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-left w-1/12">
              <Checkbox
                checked={selectedItems.size === 3} // Adjust based on the number of rows
                onChange={handleSelectAll}
                aria-label="Select all"
              />
            </th>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-left w-1/6">Name</th>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-left w-1/6">Training Date</th>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-left w-1/6">Loss</th>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-left w-1/6">mAP (%)</th>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-left w-1/6">Number of Data</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200">
          {[
            { name: 'John Doe', date: '2024-07-01', loss: '0.5', map: '85.6', data: '1000' },
            { name: 'Jane Doe', date: '2024-07-02', loss: '0.4', map: '88.2', data: '1500' },
            { name: 'Gary Barlow', date: '2024-07-03', loss: '0.3', map: '90.0', data: '2000' }
          ].map((item) => (
            <tr key={item.name}>
              <td className="whitespace-nowrap px-4 py-2">
                <Checkbox
                  checked={selectedItems.has(item.name)}
                  onChange={() => handleCheckboxChange(item.name)}
                  aria-label={`Select ${item.name}`}
                />
              </td>
              <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-left">{item.name}</td>
              <td className="whitespace-nowrap px-4 py-2 text-gray-700 text-left">{item.date}</td>
              <td className="whitespace-nowrap px-4 py-2 text-gray-700 text-left">{item.loss}</td>
              <td className="whitespace-nowrap px-4 py-2 text-gray-700 text-left">{item.map}</td>
              <td className="whitespace-nowrap px-4 py-2 text-gray-700 text-left">{item.data}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white border border-gray-300 p-8 rounded shadow-lg w-96 h-auto relative flex flex-col"> {/* Ensure width is consistent */}
            <button
              onClick={() => setShowDeleteConfirm(false)} // Close delete confirmation modal
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
            >
              <i className="fas fa-times"></i>
            </button>
            <h2 className="text-xl mb-4 text-center">Are you sure you want to delete these?</h2> {/* Center text */}
            <div className="flex justify-between mt-auto">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1 border border-gray-300 rounded"
              >
                No, cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-3 py-1 bg-red-600 text-white rounded"
              >
                Yes, I'm sure
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white border border-gray-300 p-8 rounded shadow-lg w-96 h-auto relative flex flex-col"> {/* Ensure width is consistent */}
            <button
              onClick={() => setShowConfirm(false)} // Close confirmation modal
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
            >
              <i className="fas fa-times"></i>
            </button>
            <h2 className="text-xl mb-4 text-center">Are you sure you want to delete this?</h2> {/* Center text */}
            <div className="flex justify-between mt-auto">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-3 py-1 border border-gray-300 rounded"
              >
                No, cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-3 py-1 bg-red-600 text-white rounded"
              >
                Yes, I'm sure
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white border border-gray-300 p-8 rounded shadow-lg w-96 h-auto relative flex flex-col"> {/* Ensure width is consistent */}
            <button
              onClick={() => setShowSuccess(false)} // Close success modal
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
            >
              <i className="fas fa-times"></i>
            </button>
            <h2 className="text-xl mb-4 text-center">Removal Successful!</h2> {/* Center text */}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchNodel;

