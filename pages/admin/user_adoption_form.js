import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAdoptionForms } from '../../utils/api';
import AdminSidebar from '../../components/AdminSidebar';

export default function AdoptionFormManagement() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });
  const [expandedForm, setExpandedForm] = useState(null);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const data = await getAdoptionForms(
        statusFilter,
        pagination.page,
        pagination.limit,
        searchTerm
      );
      setForms(data.data);
      setPagination(prev => ({ ...prev, total: data.total }));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, [statusFilter, pagination.page, searchTerm]);

  const toggleExpandForm = (formId) => {
    setExpandedForm(expandedForm === formId ? null : formId);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchForms();
  };

  const renderJsonData = (data) => {
    if (!data) return null;
    if (Array.isArray(data)) {
      return (
        <ul className="list-disc pl-5">
          {data.map((item, index) => (
            <li key={index}>{JSON.stringify(item)}</li>
          ))}
        </ul>
      );
    }
    return <pre>{JSON.stringify(data, null, 2)}</pre>;
  };

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      
      <div className="flex-1 overflow-y-auto p-8 ml-64">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Adoption Form Management</h1>
        
        {/* Filters and Search */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex">
              <input
                type="text"
                placeholder="Search by name, user or email..."
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
          
          <div className="flex space-x-2">
            {['pending', 'approved', 'declined', 'all'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status === 'all' ? null : status);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className={`px-4 py-2 rounded-md ${
                  (statusFilter === status || (status === 'all' && statusFilter === null)) 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
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
            {/* Forms List */}
            <div className="space-y-4">
              {forms.map((form) => (
                <div key={form.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div 
                    className="p-4 border-b flex justify-between items-center cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleExpandForm(form.id)}
                  >
                    <div>
                      <h3 className="font-medium">
                        {form.applicant_info.full_name} - {form.user_name}
                      </h3>
                      <div className="text-sm text-gray-500">
                        Submitted: {new Date(form.created_at).toLocaleDateString()} • 
                        Status: <span className={`font-medium ${
                          form.status === 'approved' ? 'text-green-600' :
                          form.status === 'declined' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {form.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-gray-500">
                      {expandedForm === form.id ? '▲' : '▼'}
                    </div>
                  </div>
                  
                  {expandedForm === form.id && (
                    <div className="p-4 space-y-6">
                      {/* Applicant Information */}
                      <div>
                        <h4 className="font-medium text-lg mb-2">Applicant Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p><span className="font-medium">Full Name:</span> {form.applicant_info.full_name}</p>
                            <p><span className="font-medium">Contact:</span> {form.applicant_info.contact_info}</p>
                          </div>
                          <div>
                            <p><span className="font-medium">Housing:</span> {form.applicant_info.housing_type}</p>
                            <p><span className="font-medium">Landlord Allows Pets:</span> 
                              {form.applicant_info.landlord_allows_pets ? ' Yes' : ' No'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Household Details */}
                      <div>
                        <h4 className="font-medium text-lg mb-2">Household Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p><span className="font-medium">Household Members:</span></p>
                            {renderJsonData(form.household_details.members)}
                          </div>
                          <div>
                            <p><span className="font-medium">Pet Allergies:</span> 
                              {form.household_details.pet_allergies ? ' Yes' : ' No'}
                            </p>
                            {form.household_details.allergy_types && (
                              <p><span className="font-medium">Allergy Types:</span> {form.household_details.allergy_types}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Pet Care Plan */}
                      <div>
                        <h4 className="font-medium text-lg mb-2">Pet Care Plan</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p><span className="font-medium">Primary Caregiver:</span> {form.pet_care_plan.primary_caregiver}</p>
                            <p><span className="font-medium">Expense Responsibility:</span> {form.pet_care_plan.expense_responsibility}</p>
                          </div>
                          <div>
                            <p><span className="font-medium">Daily Alone Time:</span> {form.pet_care_plan.daily_alone_time}</p>
                            {form.pet_care_plan.alone_time_plan && (
                              <p><span className="font-medium">Alone Time Plan:</span> {form.pet_care_plan.alone_time_plan}</p>
                            )}
                            <p><span className="font-medium">Emergency Care:</span> {form.pet_care_plan.emergency_care}</p>
                          </div>
                        </div>
                      </div>

                      {/* Pet Experience */}
                      <div>
                        <h4 className="font-medium text-lg mb-2">Pet Experience</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            {form.pet_experience.current_pets && (
                              <>
                                <p className="font-medium">Current Pets:</p>
                                {renderJsonData(form.pet_experience.current_pets)}
                              </>
                            )}
                          </div>
                          <div>
                            {form.pet_experience.past_pets && (
                              <>
                                <p className="font-medium">Past Pets:</p>
                                {renderJsonData(form.pet_experience.past_pets)}
                                {form.pet_experience.past_pets_outcome && (
                                  <p><span className="font-medium">Outcome:</span> {form.pet_experience.past_pets_outcome}</p>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Adoption Readiness */}
                      <div>
                        <h4 className="font-medium text-lg mb-2">Adoption Readiness</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p><span className="font-medium">Adoption Reason:</span> {form.adoption_readiness.reason}</p>
                          </div>
                          <div>
                            <p><span className="font-medium">Household Agreement:</span> 
                              {form.adoption_readiness.household_agreement ? ' Yes' : ' No'}
                            </p>
                            {form.adoption_readiness.disagreement_reason && (
                              <p><span className="font-medium">Disagreement Reason:</span> {form.adoption_readiness.disagreement_reason}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                  <span className="font-medium">{pagination.total}</span> forms
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