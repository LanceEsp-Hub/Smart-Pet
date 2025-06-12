import { useState, useEffect } from 'react';
import { getPetHealthRecords } from '../../utils/api';
import AdminSidebar from '../../components/AdminSidebar';

export default function PetHealthManagement() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await getPetHealthRecords(pagination.page, pagination.limit, searchTerm);
      setRecords(data.data);
      setPagination(prev => ({ ...prev, total: data.total }));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [pagination.page, searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchRecords();
  };

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      
      <div className="flex-1 overflow-y-auto p-8 ml-64">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Pet Health Management</h1>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex">
            <input
              type="text"
              placeholder="Search by pet name, owner or health details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              className="bg-purple-600 text-white px-4 py-2 rounded-r-md hover:bg-purple-700"
            >
              Search
            </button>
          </div>
        </form>

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
            {/* Health Records Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pet Info</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Health Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temperament</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compatibility</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.map((record) => (
                    <tr key={record.pet_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{record.pet_name}</div>
                        <div className="text-sm text-gray-500 capitalize">{record.pet_type} • {record.pet_status}</div>
                        <div className="text-xs text-gray-400 mt-1">Owner: {record.owner_name}</div>
                        <div className="text-xs text-gray-400">ID: {record.pet_id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <span className="font-medium">Vaccinated:</span> {record.vaccinated || 'Unknown'}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Spayed/Neutered:</span> {record.spayed_neutered || 'Unknown'}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Energy:</span> {record.energy_level || 'Not specified'}
                        </div>
                        {record.health_details && (
                          <div className="text-xs text-gray-500 mt-1">
                            Details: {record.health_details.substring(0, 50)}...
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {record.temperament_personality ? (
                          <div className="text-sm text-gray-700">
                            {record.temperament_personality.substring(0, 100)}...
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Not specified</span>
                        )}
                        {record.reason_for_adoption && (
                          <div className="text-xs text-gray-500 mt-1">
                            <span className="font-medium">Adoption reason:</span> {record.reason_for_adoption.substring(0, 50)}...
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          {record.good_with.children && <span className="text-green-600">✓ Children</span>}
                          {record.good_with.dogs && <span className="text-green-600">✓ Dogs</span>}
                          {record.good_with.cats && <span className="text-green-600">✓ Cats</span>}
                          {record.good_with.elderly && <span className="text-green-600">✓ Elderly</span>}
                          {record.good_with.strangers && <span className="text-green-600">✓ Strangers</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(record.updated_at || record.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(record.updated_at || record.created_at).toLocaleTimeString()}
                        </div>
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
                  <span className="font-medium">{pagination.total}</span> records
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