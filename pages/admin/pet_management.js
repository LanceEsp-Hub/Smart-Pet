"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getPetsForManagement, managePet } from '../../utils/api';
import AdminSidebar from '../../components/AdminSidebar'; // Adjusted path

export default function PetManagement() {
  const router = useRouter();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  const fetchPets = async () => {
    try {
      setLoading(true);
      const data = await getPetsForManagement(
        statusFilter,
        pagination.page,
        pagination.limit
      );
      setPets(data.data);
      setPagination(prev => ({
        ...prev,
        total: data.total
      }));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, [statusFilter, pagination.page]);

  const handleAction = async (petId, action) => {
    try {
      await managePet(petId, action);
      fetchPets(); // Refresh the list
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      
      <div className="flex-1 overflow-y-auto p-8 ml-64">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Pet Management</h1>
        
        {/* Status Filter */}
        <div className="mb-6 flex space-x-2">
          {['pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className={`px-4 py-2 rounded-md ${
                statusFilter === status ? 'bg-purple-600 text-white' : 'bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            {/* Pets Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                // Update your table columns to include the new fields
<thead className="bg-gray-50">
  <tr>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pet</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type/Gender</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fingerprint</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
  </tr>
</thead>

<tbody className="bg-white divide-y divide-gray-200">
  {pets.map((pet) => (
    <tr key={pet.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {pet.image && (
            <div className="flex-shrink-0 h-10 w-10">
              <img className="h-10 w-10 rounded-full object-cover" src={pet.image} alt={pet.name} />
            </div>
          )}
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{pet.name}</div>
            <div className="text-sm text-gray-500">ID: {pet.id}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 capitalize">{pet.type}</div>
        <div className="text-sm text-gray-500 capitalize">{pet.gender}</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">{pet.address}</div>
        {pet.latitude && pet.longitude && (
          <div className="text-xs text-gray-500">
            {pet.latitude.toFixed(4)}, {pet.longitude.toFixed(4)}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{pet.owner_name}</div>
        <div className="text-sm text-gray-500">{pet.owner_email}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          pet.has_generated_fingerprint ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {pet.has_generated_fingerprint ? 'Generated' : 'Pending'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          pet.status === 'Safe at Home' ? 'bg-green-100 text-green-800' :
          pet.status === 'Lost' ? 'bg-yellow-100 text-yellow-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {pet.status}
        </span>
        <div className="text-xs text-gray-500 mt-1">
          {pet.admin_approved ? 'Approved' : 'Pending approval'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        {statusFilter === 'pending' && (
          <>
            <button
              onClick={() => handleAction(pet.id, 'approve')}
              className="text-green-600 hover:text-green-900 mr-3"
            >
              Approve
            </button>
            <button
              onClick={() => handleAction(pet.id, 'reject')}
              className="text-red-600 hover:text-red-900"
            >
              Reject
            </button>
          </>
        )}
        {statusFilter === 'approved' && (
          <button
            onClick={() => handleAction(pet.id, 'unpublish')}
            className="text-yellow-600 hover:text-yellow-900"
          >
            Unpublish
          </button>
        )}
      </td>
    </tr>
  ))}
</tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                  <span className="font-medium">{pagination.total}</span> pets
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border rounded-md disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page * pagination.limit >= pagination.total}
                  className="px-4 py-2 border rounded-md disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}