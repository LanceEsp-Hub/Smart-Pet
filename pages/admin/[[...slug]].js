import { useRouter } from 'next/router';
import AdminSidebar from '../../components/AdminSidebar';

export default function AdminPage() {
  const router = useRouter();
  const { slug } = router.query;
  const currentPath = slug ? `/admin/${slug.join('/')}` : '/admin/dashboard';

  // You can add route-based content rendering here
  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto p-8 ml-64">
        <h1 className="text-2xl font-bold mb-6">
          {currentPath.split('/').pop().charAt(0).toUpperCase() + 
           currentPath.split('/').pop().slice(1)}
        </h1>
        {/* Page content will be rendered here */}
      </div>
    </div>
  );
}