import React from 'react';

const AdminViewFeedback = () => {
  return (
      <div className="overflow-x-auto ">
        <div className="text-left mt-4 ml-4"> {/* 添加顶部间距 */}
          <h1 className="text-2xl font-bold ">User Feedback</h1>
        </div>
        <hr className="border-b-2 border-gray-400 mb-6 w-50 ml-0"/>
        <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
          <thead className="ltr:text-left rtl:text-right">
          <tr>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-left bg-green-100">User Name</th>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-left bg-green-100">Star Rating
            </th>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-left bg-green-100">Suggestion</th>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-left bg-green-100">Detail</th>
            <th className="px-4 py-2 bg-green-100"></th>
          </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
          <tr>
            <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-left">John Doe</td>
            <td className="whitespace-nowrap px-4 py-2 text-gray-700 text-left">5</td>
            <td className="whitespace-nowrap px-4 py-2 text-gray-700 text-left">no</td>
            <td className="whitespace-nowrap px-4 py-2">
              <a
                  href="#"
                  className="inline-block rounded hover:bg-indigo-600 px-4 py-2 text-xs font-medium text-white bg-green-600"
              >
                View
              </a>
            </td>
          </tr>

          <tr>
            <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-left">Jane Doe</td>
            <td className="whitespace-nowrap px-4 py-2 text-gray-700 text-left">4</td>
            <td className="whitespace-nowrap px-4 py-2 text-gray-700 text-left">no</td>
            <td className="whitespace-nowrap px-4 py-2">
              <a
                  href="#"
                  className="inline-block rounded hover:bg-indigo-600 px-4 py-2 text-xs font-medium text-white bg-green-600"
              >
                View
              </a>
            </td>
          </tr>

          <tr>
            <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-left">Gary Barlow</td>
            <td className="whitespace-nowrap px-4 py-2 text-gray-700 text-left">5</td>
            <td className="whitespace-nowrap px-4 py-2 text-gray-700 text-left">nonono</td>
            <td className="whitespace-nowrap px-4 py-2">
              <a
                  href="#"
                  className="inline-block rounded hover:bg-indigo-600 px-4 py-2 text-xs font-medium text-white bg-green-600"
              >
                View
              </a>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
  );
};

export default AdminViewFeedback;

