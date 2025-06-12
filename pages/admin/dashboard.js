// import AdminSidebar from '../../components/AdminSidebar';
// import { useState, useEffect } from 'react';
// import { getAdminDashboardStats, getAdminRecentActivity  } from '../../utils/api';

// export default function DashboardContent() {
//   const [stats, setStats] = useState(null);
//   const [recentActivity, setRecentActivity] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [timeRange, setTimeRange] = useState('all');



//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const [statsData, activityData] = await Promise.all([
//           getAdminDashboardStats(timeRange),
//           getAdminRecentActivity()
//         ]);
//         setStats(statsData);
//         setRecentActivity(activityData);
//         setError(null);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [timeRange]);


//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-full">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex">
//       <AdminSidebar />
//       <div className="flex-1 ml-64 container mx-auto px-4 py-8 text-black">
//         <h1 className="text-white text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

        
//         {/* Time Range Selector */}
//         <div className="mb-6 bg-white rounded-lg shadow p-4">
//           <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
//           <div className="flex space-x-2">
//             {["day", "week", "month", "year", "all"].map((range) => (
//               <button
//                 key={range}
//                 onClick={() => setTimeRange(range)}
//                 className={`px-4 py-2 rounded-md ${timeRange === range ? "bg-purple-600 text-white" : "bg-gray-200"}`}
//               >
//                 {range.charAt(0).toUpperCase() + range.slice(1)}
//               </button>
//             ))}
//           </div>
//         </div>

//         {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

//         {/* Stats Overview */}
//         {stats && (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//             {/* Users Card */}
//             <div className="bg-white rounded-lg shadow p-6">
//               <h2 className="text-xl font-semibold mb-4">Users</h2>
//               <div className="space-y-3">
//                 <StatItem label="Total Users" value={stats.users.total} />
//                 <StatItem label="Active Users" value={stats.users.active} />
//                 <StatItem label="Verified Users" value={stats.users.verified} />
//                 <StatItem label="New (7 days)" value={stats.users.new} />
//               </div>
//             </div>

//             {/* Pets Card */}
//             <div className="bg-white rounded-lg shadow p-6">
//               <h2 className="text-xl font-semibold mb-4">Pets</h2>
//               <div className="space-y-3">
//                 <StatItem label="Total Pets" value={stats.pets.total} />
//                 <StatItem label="Published" value={stats.pets.published} />
//                 <StatItem label="Approved" value={stats.pets.approved} />
//                 <div className="pt-2 border-t">
//                   <h3 className="text-sm font-medium mb-2">By Type:</h3>
//                   <div className="grid grid-cols-3 gap-2 text-sm">
//                     <StatItem label="Dogs" value={stats.pets.by_type.dogs} small />
//                     <StatItem label="Cats" value={stats.pets.by_type.cats} small />
//                     <StatItem label="Others" value={stats.pets.by_type.others} small />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Adoptions Card */}
//             <div className="bg-white rounded-lg shadow p-6">
//               <h2 className="text-xl font-semibold mb-4">Adoptions</h2>
//               <div className="space-y-3">
//                 <StatItem label="Total" value={stats.adoptions.total} />
//                 <StatItem label="Successful" value={stats.adoptions.successful} positive />
//                 <StatItem label="Pending" value={stats.adoptions.pending} warning />
//                 <StatItem label="Cancelled" value={stats.adoptions.cancelled} negative />
//               </div>
//             </div>

//             {/* Forms Card */}
//             <div className="bg-white rounded-lg shadow p-6">
//               <h2 className="text-xl font-semibold mb-4">Adoption Forms</h2>
//               <div className="space-y-3">
//                 <StatItem label="Total Forms" value={stats.forms.total} />
//                 <StatItem label="Pending" value={stats.forms.pending} warning />
//                 <StatItem label="Approved" value={stats.forms.approved} positive />
//                 <StatItem label="Declined" value={stats.forms.declined} negative />
//               </div>
//             </div>

//             {/* Messages Card */}
//             <div className="bg-white rounded-lg shadow p-6">
//               <h2 className="text-xl font-semibold mb-4">Messages</h2>
//               <div className="space-y-3">
//                 <StatItem label="Total Messages" value={stats.messages.total} />
//                 <StatItem label="Unread" value={stats.messages.unread} warning />
//                 <StatItem label="Conversations" value={stats.messages.conversations} />
//               </div>
//             </div>

//             {/* Notifications Card */}
//             <div className="bg-white rounded-lg shadow p-6">
//               <h2 className="text-xl font-semibold mb-4">Notifications</h2>
//               <div className="space-y-3">
//                 <StatItem label="Total Notifications" value={stats.notifications.total} />
//                 <StatItem label="Unread" value={stats.notifications.unread} warning />
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Recent Activity */}
//         {recentActivity && (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//             <RecentActivityCard
//               title="Recent Users"
//               items={recentActivity.users}
//               fields={["name", "email"]}
//               onClick={(id) => router.push(`/admin/users/${id}`)}
//             />
//             <RecentActivityCard
//               title="Recent Pets"
//               items={recentActivity.pets}
//               fields={["name", "type", "status"]}
//               onClick={(id) => router.push(`/admin/pets/${id}`)}
//             />
//             <RecentActivityCard
//               title="Recent Adoptions"
//               items={recentActivity.adoptions}
//               fields={["pet_id", "status"]}
//               onClick={(id) => router.push(`/admin/adoptions/${id}`)}
//             />
//             <RecentActivityCard
//               title="Recent Forms"
//               items={recentActivity.forms}
//               fields={["user_id", "status"]}
//               onClick={(id) => router.push(`/admin/forms/${id}`)}
//             />
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// // Helper Components
// function StatItem({ label, value, positive = false, warning = false, negative = false, small = false }) {
//   let colorClass = "text-gray-700"
//   if (positive) colorClass = "text-green-600"
//   if (warning) colorClass = "text-yellow-600"
//   if (negative) colorClass = "text-red-600"

//   return (
//     <div className={`flex justify-between ${small ? "text-sm" : ""}`}>
//       <span>{label}:</span>
//       <span className={`font-medium ${colorClass}`}>{value}</span>
//     </div>
//   )
// }

// function RecentActivityCard({ title, items, fields, onClick }) {
//   return (
//     <div className="bg-white rounded-lg shadow overflow-hidden">
//       <div className="p-4 border-b">
//         <h2 className="text-lg font-semibold">{title}</h2>
//       </div>
//       <div className="divide-y">
//         {items.map((item) => (
//           <div key={item.id} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => onClick(item.id)}>
//             <div className="flex justify-between items-center">
//               <div>
//                 {fields.map((field) => (
//                   <p key={field} className={field === fields[0] ? "font-medium" : "text-sm text-gray-500"}>
//                     {item[field]}
//                   </p>
//                 ))}
//               </div>
//               <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString()}</span>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
  
//   );
// }

"use client"

import AdminSidebar from "../../components/AdminSidebar"
import { useState, useEffect } from "react"
import { getAdminDashboardStats, getAdminRecentActivity } from "../../utils/api"
import { useRouter } from "next/router"

export default function DashboardContent() {
  const [stats, setStats] = useState(null)
  const [recentActivity, setRecentActivity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeRange, setTimeRange] = useState("all")
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [statsData, activityData] = await Promise.all([
          getAdminDashboardStats(timeRange),
          getAdminRecentActivity(),
        ])
        setStats(statsData)
        setRecentActivity(activityData)
        setError(null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [timeRange])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <AdminSidebar />
      <div className="flex-1 ml-64 container mx-auto px-4 py-8 text-black">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
          Admin Dashboard
        </h1>

        {/* Time Range Selector */}
        <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
          <div className="flex space-x-2">
            {["day", "week", "month", "year", "all"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  timeRange === range
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transform scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 shadow-md">
            {error}
          </div>
        )}

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Users Card */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">👥</div>
                Users
              </h2>
              <div className="space-y-3">
                <StatItem label="Total Users" value={stats.users.total} />
                <StatItem label="Active Users" value={stats.users.active} positive />
                <StatItem label="Verified Users" value={stats.users.verified} positive />
                <StatItem label="New (7 days)" value={stats.users.new} />
                <StatItem label="Deactivated" value={stats.users.deactivated} negative />
              </div>
              {/* User Growth Chart */}
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="flex items-end justify-between h-16 gap-1">
                  {[65, 78, 85, 92, 100].map((height, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div
                        className="bg-white/30 rounded-t w-full transition-all duration-500 hover:bg-white/40"
                        style={{ height: `${height}%` }}
                      ></div>
                      <span className="text-xs mt-1 opacity-80">{["M", "T", "W", "T", "F"][index]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pets Card */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">🐾</div>
                Pets
              </h2>
              <div className="space-y-3">
                <StatItem label="Total Pets" value={stats.pets.total} />
                <StatItem label="Published" value={stats.pets.published} positive />
                <StatItem label="Approved" value={stats.pets.approved} positive />
                <StatItem label="With Fingerprints" value={stats.pets.with_fingerprints} />
                <div className="pt-2 border-t border-white/20">
                  <h3 className="text-sm font-medium mb-2">By Type:</h3>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <StatItem label="Dogs" value={stats.pets.by_type.dogs} small />
                    <StatItem label="Cats" value={stats.pets.by_type.cats} small />
                    <StatItem label="Others" value={stats.pets.by_type.others} small />
                  </div>
                </div>
                {/* Pet Type Distribution Chart */}
                <div className="pt-2 border-t border-white/20">
                  <h3 className="text-sm font-medium mb-2">Distribution:</h3>
                  <div className="space-y-2">
                    <PetTypeBar
                      label="Dogs"
                      value={stats.pets.by_type.dogs}
                      total={stats.pets.total}
                      color="bg-white/30"
                    />
                    <PetTypeBar
                      label="Cats"
                      value={stats.pets.by_type.cats}
                      total={stats.pets.total}
                      color="bg-white/30"
                    />
                    <PetTypeBar
                      label="Others"
                      value={stats.pets.by_type.others}
                      total={stats.pets.total}
                      color="bg-white/30"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Adoptions Card */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">❤️</div>
                Adoptions
              </h2>
              <div className="space-y-3">
                <StatItem label="Total" value={stats.adoptions.total} />
                <StatItem label="Successful" value={stats.adoptions.successful} positive />
                <StatItem label="Pending" value={stats.adoptions.pending} warning />
                <StatItem label="Cancelled" value={stats.adoptions.cancelled} negative />
              </div>
              {/* Adoption Success Rate */}
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="text-sm mb-2">Success Rate</div>
                <div className="bg-white/20 rounded-full h-3">
                  <div
                    className="bg-white/60 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(stats.adoptions.successful / stats.adoptions.total) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs mt-1 opacity-80">
                  {Math.round((stats.adoptions.successful / stats.adoptions.total) * 100)}%
                </div>
              </div>
            </div>

            {/* Forms Card */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">📋</div>
                Adoption Forms
              </h2>
              <div className="space-y-3">
                <StatItem label="Total Forms" value={stats.forms.total} />
                <StatItem label="Pending" value={stats.forms.pending} warning />
                <StatItem label="Approved" value={stats.forms.approved} positive />
                <StatItem label="Declined" value={stats.forms.declined} negative />
              </div>
              {/* Forms Status Chart */}
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="w-full bg-white/30 rounded h-2 mb-1">
                      <div
                        className="bg-green-300 h-2 rounded"
                        style={{ width: `${(stats.forms.approved / stats.forms.total) * 100}%` }}
                      ></div>
                    </div>
                    <span>Approved</span>
                  </div>
                  <div className="text-center">
                    <div className="w-full bg-white/30 rounded h-2 mb-1">
                      <div
                        className="bg-yellow-300 h-2 rounded"
                        style={{ width: `${(stats.forms.pending / stats.forms.total) * 100}%` }}
                      ></div>
                    </div>
                    <span>Pending</span>
                  </div>
                  <div className="text-center">
                    <div className="w-full bg-white/30 rounded h-2 mb-1">
                      <div
                        className="bg-red-300 h-2 rounded"
                        style={{ width: `${(stats.forms.declined / stats.forms.total) * 100}%` }}
                      ></div>
                    </div>
                    <span>Declined</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Card */}
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">🔒</div>
                Security
              </h2>
              <div className="space-y-3">
                <StatItem label="Total Logins" value={stats.security.total_logins} />
                <StatItem label="Failed Logins" value={stats.security.failed_logins} warning />
                <StatItem label="Suspicious Activity" value={stats.security.suspicious_activity} negative />
              </div>
              {/* Security Chart */}
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="text-sm mb-2">Login Success Rate</div>
                <div className="bg-white/20 rounded-full h-3">
                  <div
                    className="bg-green-300 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${((stats.security.total_logins - stats.security.failed_logins) / stats.security.total_logins) * 100}%`,
                    }}
                  ></div>
                </div>
                <div className="text-xs mt-1 opacity-80">
                  {Math.round(
                    ((stats.security.total_logins - stats.security.failed_logins) / stats.security.total_logins) * 100,
                  )}
                  %
                </div>
              </div>
            </div>

            {/* Pet Similarity Card */}
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">🔍</div>
                Pet Similarity
              </h2>
              <div className="space-y-3">
                <StatItem label="Total Searches" value={stats.pet_similarity.total_searches} />
                <StatItem label="Successful Matches" value={stats.pet_similarity.successful_matches} positive />
                <StatItem
                  label="Match Rate"
                  value={`${stats.pet_similarity.total_searches > 0 ? Math.round((stats.pet_similarity.successful_matches / stats.pet_similarity.total_searches) * 100) : 0}%`}
                />
              </div>
              {/* Similarity Match Chart */}
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="text-sm mb-2">Search Performance</div>
                <div className="bg-white/20 rounded-full h-3">
                  <div
                    className="bg-cyan-300 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${stats.pet_similarity.total_searches > 0 ? (stats.pet_similarity.successful_matches / stats.pet_similarity.total_searches) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
                <div className="text-xs mt-1 opacity-80">
                  {stats.pet_similarity.successful_matches} / {stats.pet_similarity.total_searches} matches
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {recentActivity && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <RecentActivityCard
              title="Recent Users"
              items={recentActivity.users}
              fields={["name", "email"]}
              onClick={(id) => router.push(`/admin/users/${id}`)}
              color="purple"
            />
            <RecentActivityCard
              title="Recent Pets"
              items={recentActivity.pets}
              fields={["name", "type", "status"]}
              onClick={(id) => router.push(`/admin/pets/${id}`)}
              color="blue"
            />
            <RecentActivityCard
              title="Recent Adoptions"
              items={recentActivity.adoptions}
              fields={["pet_id", "status"]}
              onClick={(id) => router.push(`/admin/adoptions/${id}`)}
              color="green"
            />
            <RecentActivityCard
              title="Recent Forms"
              items={recentActivity.forms}
              fields={["user_id", "status"]}
              onClick={(id) => router.push(`/admin/forms/${id}`)}
              color="orange"
            />
          </div>
        )}
      </div>
    </div>
  )
}

// Helper Components
function StatItem({ label, value, positive = false, warning = false, negative = false, small = false }) {
  let colorClass = "text-white/90"
  if (positive) colorClass = "text-green-200"
  if (warning) colorClass = "text-yellow-200"
  if (negative) colorClass = "text-red-200"

  return (
    <div className={`flex justify-between ${small ? "text-sm" : ""}`}>
      <span className="text-white/80">{label}:</span>
      <span className={`font-medium ${colorClass}`}>{value}</span>
    </div>
  )
}

function PetTypeBar({ label, value, total, color }) {
  const percentage = (value / total) * 100
  return (
    <div className="text-xs">
      <div className="flex justify-between mb-1">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="bg-white/20 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}

function RecentActivityCard({ title, items, fields, onClick, color }) {
  const colorClasses = {
    purple: "from-purple-500 to-purple-600",
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    orange: "from-orange-500 to-orange-600",
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-200">
      <div className={`bg-gradient-to-r ${colorClasses[color]} p-4 border-b`}>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="divide-y">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
            onClick={() => onClick(item.id)}
          >
            <div className="flex justify-between items-center">
              <div>
                {fields.map((field) => (
                  <p key={field} className={field === fields[0] ? "font-medium" : "text-sm text-gray-500"}>
                    {item[field]}
                  </p>
                ))}
              </div>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {new Date(item.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
