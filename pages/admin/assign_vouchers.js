import { useEffect, useState } from "react";
import { getApiUrl } from "../../utils/apiUtils";

export default function AssignVouchersPage() {
  const [vouchers, setVouchers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVoucher, setSelectedVoucher] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [assignToAll, setAssignToAll] = useState(false);
  const [bulkAssigning, setBulkAssigning] = useState(false);
  const [userVouchers, setUserVouchers] = useState([]);
  const [removingVoucher, setRemovingVoucher] = useState(false);
  const [selectedUserForRemoval, setSelectedUserForRemoval] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const API_URL = getApiUrl();
        // Fetch vouchers
        const vouchersResponse = await fetch(`${API_URL}/api/vouchers/`);
        if (!vouchersResponse.ok) throw new Error("Failed to fetch vouchers");
        const vouchersData = await vouchersResponse.json();
        setVouchers(vouchersData);
        
        // Fetch users (you'll need to create this endpoint)
        const usersResponse = await fetch(`${API_URL}/api/vouchers/users`);
        if (!usersResponse.ok) throw new Error("Failed to fetch users");
        const usersData = await usersResponse.json();
        setUsers(usersData);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAssignVoucher = async (e) => {
    e.preventDefault();
    
    if (!selectedVoucher || (!selectedUser && !assignToAll)) {
      alert("Please select both a voucher and a user, or check 'Assign to All Users'");
      return;
    }

    try {
      setAssigning(true);
      setSuccessMessage("");
      
      if (assignToAll) {
        // Bulk assign to all users
        await handleBulkAssign();
      } else {
        // Assign to single user
        const API_URL = getApiUrl();
        const response = await fetch(`${API_URL}/api/vouchers/assign`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            voucher_id: parseInt(selectedVoucher),
            user_id: parseInt(selectedUser),
            assigned_by: 1 // Default admin ID for testing
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to assign voucher");
        }

        setSuccessMessage("Voucher assigned successfully!");
      }
      
      setSelectedVoucher("");
      setSelectedUser("");
      setAssignToAll(false);
      
    } catch (err) {
      alert(err.message);
    } finally {
      setAssigning(false);
    }
  };

  const handleBulkAssign = async () => {
    try {
      setBulkAssigning(true);
      let successCount = 0;
      let errorCount = 0;

      for (const user of users) {
        try {
          const API_URL = getApiUrl();
          const response = await fetch(`${API_URL}/api/vouchers/assign`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              voucher_id: parseInt(selectedVoucher),
              user_id: user.id,
              assigned_by: 1 // Default admin ID for testing
            })
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (err) {
          errorCount++;
        }
      }

      if (errorCount === 0) {
        setSuccessMessage(`Voucher successfully assigned to all ${successCount} users!`);
      } else {
        setSuccessMessage(`Voucher assigned to ${successCount} users. ${errorCount} assignments failed.`);
      }
    } catch (err) {
      alert(`Bulk assignment error: ${err.message}`);
    } finally {
      setBulkAssigning(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const fetchUserVouchers = async (userId) => {
    try {
      const API_URL = getApiUrl();
      const response = await fetch(`${API_URL}/api/vouchers/user/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch user vouchers");
      const data = await response.json();
      setUserVouchers(data);
    } catch (err) {
      console.error("Error fetching user vouchers:", err);
      setUserVouchers([]);
    }
  };

  const handleUserSelectionForRemoval = (userId) => {
    setSelectedUserForRemoval(userId);
    if (userId) {
      fetchUserVouchers(userId);
    } else {
      setUserVouchers([]);
    }
  };

  const handleRemoveVoucher = async (userVoucherId) => {
    if (!confirm("Are you sure you want to remove this voucher from the user?")) {
      return;
    }

    try {
      setRemovingVoucher(true);
      const API_URL = getApiUrl();
      const response = await fetch(`${API_URL}/api/vouchers/user/${selectedUserForRemoval}/voucher/${userVoucherId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to remove voucher");
      }

      // Refresh user vouchers
      await fetchUserVouchers(selectedUserForRemoval);
      alert("Voucher removed successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setRemovingVoucher(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Assign Vouchers to Users</h1>
          <p className="mt-2 text-gray-600">Assign available vouchers to specific users</p>
        </div>

        {/* Assignment Form */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Assign Voucher</h2>
          </div>
          <div className="px-6 py-4">
            <form onSubmit={handleAssignVoucher} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="voucher" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Voucher
                  </label>
                  <select
                    id="voucher"
                    value={selectedVoucher}
                    onChange={(e) => setSelectedVoucher(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">Choose a voucher...</option>
                    {vouchers.filter(v => v.is_active).map((voucher) => (
                      <option key={voucher.id} value={voucher.id}>
                        {voucher.name} - {voucher.code} ({voucher.discount_type === 'percentage' ? `${voucher.discount_value}%` : `$${voucher.discount_value}`} OFF)
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="user" className="block text-sm font-medium text-gray-700 mb-2">
                    Select User
                  </label>
                  <select
                    id="user"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    disabled={assignToAll}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required={!assignToAll}
                  >
                    <option value="">Choose a user...</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Assign to All Users Option */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="assignToAll"
                  checked={assignToAll}
                  onChange={(e) => {
                    setAssignToAll(e.target.checked);
                    if (e.target.checked) {
                      setSelectedUser(""); // Clear individual user selection
                    }
                  }}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="assignToAll" className="text-sm font-medium text-gray-700">
                  Assign to All Users ({users.length} users)
                </label>
              </div>

              {assignToAll && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        This voucher will be assigned to all {users.length} active users. 
                        Users who already have this voucher will be skipped.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  {successMessage}
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={assigning || !selectedVoucher || (!selectedUser && !assignToAll) || bulkAssigning}
                  className="px-6 py-2 bg-purple-700 text-white rounded-md hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {assigning || bulkAssigning ? "Assigning..." : assignToAll ? `Assign to All Users (${users.length})` : "Assign Voucher"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Remove Vouchers Section */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Remove Vouchers from Users</h2>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-4">
              {/* User Selection for Removal */}
              <div>
                <label htmlFor="userForRemoval" className="block text-sm font-medium text-gray-700 mb-2">
                  Select User to Remove Vouchers From
                </label>
                <select
                  id="userForRemoval"
                  value={selectedUserForRemoval}
                  onChange={(e) => handleUserSelectionForRemoval(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Choose a user...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* User's Vouchers Display */}
              {selectedUserForRemoval && userVouchers.length > 0 && (
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3">User's Assigned Vouchers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userVouchers.map((userVoucher) => {
                      const voucher = userVoucher.voucher;
                      const now = new Date();
                      const startDate = new Date(voucher.start_date);
                      const endDate = new Date(voucher.end_date);
                      const isActive = now >= startDate && now <= endDate;
                      
                      return (
                        <div key={userVoucher.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900">{voucher.name}</h4>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {isActive ? 'Active' : 'Expired'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{voucher.description}</p>
                          <div className="space-y-1 text-sm">
                            <p><span className="font-medium">Code:</span> {voucher.code}</p>
                            <p><span className="font-medium">Discount:</span> 
                              {voucher.discount_type === 'percentage' 
                                ? ` ${voucher.discount_value}% OFF`
                                : ` $${voucher.discount_value} OFF`
                              }
                            </p>
                            <p><span className="font-medium">Valid:</span> {formatDate(voucher.start_date)} - {formatDate(voucher.end_date)}</p>
                            {voucher.free_shipping && (
                              <p className="text-green-600 font-medium">Free Shipping</p>
                            )}
                            <p><span className="font-medium">Assigned:</span> {formatDate(userVoucher.assigned_at)}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveVoucher(userVoucher.id)}
                            disabled={removingVoucher}
                            className="mt-3 w-full px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {removingVoucher ? "Removing..." : "Remove Voucher"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedUserForRemoval && userVouchers.length === 0 && (
                <div className="text-center py-8">
                  <div className="mx-auto h-12 w-12 text-gray-400">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No vouchers assigned</h3>
                  <p className="mt-1 text-sm text-gray-500">This user doesn't have any vouchers assigned to them.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Available Vouchers */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Available Vouchers</h2>
          </div>
          <div className="px-6 py-4">
            {vouchers.filter(v => v.is_active).length === 0 ? (
              <p className="text-gray-500 text-center py-4">No active vouchers available</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vouchers.filter(v => v.is_active).map((voucher) => (
                  <div key={voucher.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900">{voucher.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{voucher.description}</p>
                    <div className="mt-2 space-y-1 text-sm">
                      <p><span className="font-medium">Code:</span> {voucher.code}</p>
                      <p><span className="font-medium">Discount:</span> 
                        {voucher.discount_type === 'percentage' 
                          ? ` ${voucher.discount_value}% OFF`
                          : ` $${voucher.discount_value} OFF`
                        }
                      </p>
                      <p><span className="font-medium">Valid:</span> {formatDate(voucher.start_date)} - {formatDate(voucher.end_date)}</p>
                      {voucher.free_shipping && (
                        <p className="text-green-600 font-medium">Free Shipping</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to Admin
          </button>
        </div>
      </div>
    </div>
  );
} 