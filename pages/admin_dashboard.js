// "use client";

// import { useState, useEffect } from 'react';
// import { getAdminStats } from '../utils/api';
// import { useRouter } from 'next/router';

// export default function AdminDashboard() {
//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [timeRange, setTimeRange] = useState('all');
//   const router = useRouter();

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         setLoading(true);
//         const data = await getAdminStats(timeRange);
//         setStats(data);
//         setError(null);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchStats();
//   }, [timeRange]);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8 text-black">
//       <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
      
//       {/* Time Range Selector */}
//       <div className="mb-6 bg-white rounded-lg shadow p-4">
//         <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
//         <div className="flex space-x-2">
//           {['day', 'week', 'month', 'year', 'all'].map((range) => (
//             <button
//               key={range}
//               onClick={() => setTimeRange(range)}
//               className={`px-4 py-2 rounded-md ${
//                 timeRange === range ? 'bg-purple-600 text-white' : 'bg-gray-200'
//               }`}
//             >
//               {range.charAt(0).toUpperCase() + range.slice(1)}
//             </button>
//           ))}
//         </div>
//       </div>

//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
//           {error}
//         </div>
//       )}

//       {/* Stats Overview */}
//       {stats && (
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//           {/* Users Card */}
//           <div className="bg-white rounded-lg shadow p-6">
//             <h2 className="text-xl font-semibold mb-4">Users</h2>
//             <div className="space-y-3">
//               <div className="flex justify-between">
//                 <span>Total Users:</span>
//                 <span className="font-medium">{stats.stats.users.total}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Verified:</span>
//                 <span className="font-medium">{stats.stats.users.verified}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Active:</span>
//                 <span className="font-medium">{stats.stats.users.active}</span>
//               </div>
//             </div>
//           </div>

//           {/* Pets Card */}
//           <div className="bg-white rounded-lg shadow p-6">
//             <h2 className="text-xl font-semibold mb-4">Pets</h2>
//             <div className="space-y-3">
//               <div className="flex justify-between">
//                 <span>Total Pets:</span>
//                 <span className="font-medium">{stats.stats.pets.total}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Published:</span>
//                 <span className="font-medium">{stats.stats.pets.published}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Approved:</span>
//                 <span className="font-medium">{stats.stats.pets.approved}</span>
//               </div>
//               <div className="pt-2 border-t">
//                 <h3 className="text-sm font-medium mb-2">By Type:</h3>
//                 <div className="grid grid-cols-3 gap-2 text-sm">
//                   <div className="text-center">
//                     <div className="font-medium">{stats.stats.pets.by_type.dogs}</div>
//                     <div className="text-gray-500">Dogs</div>
//                   </div>
//                   <div className="text-center">
//                     <div className="font-medium">{stats.stats.pets.by_type.cats}</div>
//                     <div className="text-gray-500">Cats</div>
//                   </div>
//                   <div className="text-center">
//                     <div className="font-medium">{stats.stats.pets.by_type.others}</div>
//                     <div className="text-gray-500">Others</div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Adoptions Card */}
//           <div className="bg-white rounded-lg shadow p-6">
//             <h2 className="text-xl font-semibold mb-4">Adoptions</h2>
//             <div className="space-y-3">
//               <div className="flex justify-between">
//                 <span>Total:</span>
//                 <span className="font-medium">{stats.stats.adoptions.total}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Successful:</span>
//                 <span className="font-medium text-green-600">
//                   {stats.stats.adoptions.successful}
//                 </span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Pending:</span>
//                 <span className="font-medium text-yellow-600">
//                   {stats.stats.adoptions.pending}
//                 </span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Cancelled:</span>
//                 <span className="font-medium text-red-600">
//                   {stats.stats.adoptions.cancelled}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Recent Activity */}
//       {stats && (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* Recent Users */}
//           <div className="bg-white rounded-lg shadow overflow-hidden">
//             <div className="p-4 border-b">
//               <h2 className="text-lg font-semibold">Recent Users</h2>
//             </div>
//             <div className="divide-y">
//               {stats.recent_activity.users.map((user) => (
//                 <div key={user.id} className="p-4 hover:bg-gray-50 cursor-pointer">
//                   <div className="flex justify-between items-center">
//                     <div>
//                       <h3 className="font-medium">{user.name}</h3>
//                       <p className="text-sm text-gray-500">{user.email}</p>
//                     </div>
//                     <span className="text-xs text-gray-400">
//                       {new Date(user.created_at).toLocaleDateString()}
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Recent Pets */}
//           <div className="bg-white rounded-lg shadow overflow-hidden">
//             <div className="p-4 border-b">
//               <h2 className="text-lg font-semibold">Recent Pets</h2>
//             </div>
//             <div className="divide-y">
//               {stats.recent_activity.pets.map((pet) => (
//                 <div key={pet.id} className="p-4 hover:bg-gray-50 cursor-pointer">
//                   <div className="flex justify-between items-center">
//                     <div>
//                       <h3 className="font-medium">{pet.name}</h3>
//                       <p className="text-sm text-gray-500 capitalize">
//                         {pet.type} • {pet.status}
//                       </p>
//                     </div>
//                     <span className="text-xs text-gray-400">
//                       {new Date(pet.created_at).toLocaleDateString()}
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


// import { useState, useEffect } from 'react';
// import { getAdminDashboardStats, getAdminRecentActivity } from '../utils/api';
// import { useRouter } from 'next/router';

// export default function AdminDashboard() {
//   const [stats, setStats] = useState(null);
//   const [recentActivity, setRecentActivity] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [timeRange, setTimeRange] = useState('all');
//   const router = useRouter();

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
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8 text-black">
//       <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
      
//       {/* Time Range Selector */}
//       <div className="mb-6 bg-white rounded-lg shadow p-4">
//         <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
//         <div className="flex space-x-2">
//           {['day', 'week', 'month', 'year', 'all'].map((range) => (
//             <button
//               key={range}
//               onClick={() => setTimeRange(range)}
//               className={`px-4 py-2 rounded-md ${
//                 timeRange === range ? 'bg-purple-600 text-white' : 'bg-gray-200'
//               }`}
//             >
//               {range.charAt(0).toUpperCase() + range.slice(1)}
//             </button>
//           ))}
//         </div>
//       </div>

//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
//           {error}
//         </div>
//       )}

//       {/* Stats Overview */}
//       {stats && (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//           {/* Users Card */}
//           <div className="bg-white rounded-lg shadow p-6">
//             <h2 className="text-xl font-semibold mb-4">Users</h2>
//             <div className="space-y-3">
//               <StatItem label="Total Users" value={stats.users.total} />
//               <StatItem label="Active Users" value={stats.users.active} />
//               <StatItem label="Verified Users" value={stats.users.verified} />
//               <StatItem label="New (7 days)" value={stats.users.new} />
//             </div>
//           </div>

//           {/* Pets Card */}
//           <div className="bg-white rounded-lg shadow p-6">
//             <h2 className="text-xl font-semibold mb-4">Pets</h2>
//             <div className="space-y-3">
//               <StatItem label="Total Pets" value={stats.pets.total} />
//               <StatItem label="Published" value={stats.pets.published} />
//               <StatItem label="Approved" value={stats.pets.approved} />
//               <div className="pt-2 border-t">
//                 <h3 className="text-sm font-medium mb-2">By Type:</h3>
//                 <div className="grid grid-cols-3 gap-2 text-sm">
//                   <StatItem label="Dogs" value={stats.pets.by_type.dogs} small />
//                   <StatItem label="Cats" value={stats.pets.by_type.cats} small />
//                   <StatItem label="Others" value={stats.pets.by_type.others} small />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Adoptions Card */}
//           <div className="bg-white rounded-lg shadow p-6">
//             <h2 className="text-xl font-semibold mb-4">Adoptions</h2>
//             <div className="space-y-3">
//               <StatItem label="Total" value={stats.adoptions.total} />
//               <StatItem label="Successful" value={stats.adoptions.successful} positive />
//               <StatItem label="Pending" value={stats.adoptions.pending} warning />
//               <StatItem label="Cancelled" value={stats.adoptions.cancelled} negative />
//             </div>
//           </div>

//           {/* Forms Card */}
//           <div className="bg-white rounded-lg shadow p-6">
//             <h2 className="text-xl font-semibold mb-4">Adoption Forms</h2>
//             <div className="space-y-3">
//               <StatItem label="Total Forms" value={stats.forms.total} />
//               <StatItem label="Pending" value={stats.forms.pending} warning />
//               <StatItem label="Approved" value={stats.forms.approved} positive />
//               <StatItem label="Declined" value={stats.forms.declined} negative />
//             </div>
//           </div>

//           {/* Messages Card */}
//           <div className="bg-white rounded-lg shadow p-6">
//             <h2 className="text-xl font-semibold mb-4">Messages</h2>
//             <div className="space-y-3">
//               <StatItem label="Total Messages" value={stats.messages.total} />
//               <StatItem label="Unread" value={stats.messages.unread} warning />
//               <StatItem label="Conversations" value={stats.messages.conversations} />
//             </div>
//           </div>

//           {/* Notifications Card */}
//           <div className="bg-white rounded-lg shadow p-6">
//             <h2 className="text-xl font-semibold mb-4">Notifications</h2>
//             <div className="space-y-3">
//               <StatItem label="Total Notifications" value={stats.notifications.total} />
//               <StatItem label="Unread" value={stats.notifications.unread} warning />
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Recent Activity */}
//       {recentActivity && (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           <RecentActivityCard 
//             title="Recent Users" 
//             items={recentActivity.users} 
//             fields={['name', 'email']}
//             onClick={(id) => router.push(`/admin/users/${id}`)}
//           />
//           <RecentActivityCard 
//             title="Recent Pets" 
//             items={recentActivity.pets} 
//             fields={['name', 'type', 'status']}
//             onClick={(id) => router.push(`/admin/pets/${id}`)}
//           />
//           <RecentActivityCard 
//             title="Recent Adoptions" 
//             items={recentActivity.adoptions} 
//             fields={['pet_id', 'status']}
//             onClick={(id) => router.push(`/admin/adoptions/${id}`)}
//           />
//           <RecentActivityCard 
//             title="Recent Forms" 
//             items={recentActivity.forms} 
//             fields={['user_id', 'status']}
//             onClick={(id) => router.push(`/admin/forms/${id}`)}
//           />
//         </div>
//       )}
//     </div>
//   );
// }

// // Helper Components
// function StatItem({ label, value, positive = false, warning = false, negative = false, small = false }) {
//   let colorClass = 'text-gray-700';
//   if (positive) colorClass = 'text-green-600';
//   if (warning) colorClass = 'text-yellow-600';
//   if (negative) colorClass = 'text-red-600';

//   return (
//     <div className={`flex justify-between ${small ? 'text-sm' : ''}`}>
//       <span>{label}:</span>
//       <span className={`font-medium ${colorClass}`}>{value}</span>
//     </div>
//   );
// }

// function RecentActivityCard({ title, items, fields, onClick }) {
//   return (
//     <div className="bg-white rounded-lg shadow overflow-hidden">
//       <div className="p-4 border-b">
//         <h2 className="text-lg font-semibold">{title}</h2>
//       </div>
//       <div className="divide-y">
//         {items.map((item) => (
//           <div 
//             key={item.id} 
//             className="p-4 hover:bg-gray-50 cursor-pointer"
//             onClick={() => onClick(item.id)}
//           >
//             <div className="flex justify-between items-center">
//               <div>
//                 {fields.map((field) => (
//                   <p key={field} className={field === fields[0] ? 'font-medium' : 'text-sm text-gray-500'}>
//                     {item[field]}
//                   </p>
//                 ))}
//               </div>
//               <span className="text-xs text-gray-400">
//                 {new Date(item.created_at).toLocaleDateString()}
//               </span>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }


import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminDashboardRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/admin/dashboard');
  }, []);

  return null;
}