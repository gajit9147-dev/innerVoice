import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import { getAllUsers, deleteUserByAdmin } from "../api/admin";
import { useToast } from "../context/ToastContext";
import { ShieldAlert, Trash2, Loader2 } from "lucide-react";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await getAllUsers();
      setUsers(res.data.users);
    } catch (err) {
      addToast("Failed to fetch users", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to permanently delete ${name} and ALL their notes?`)) {
      try {
        await deleteUserByAdmin(id);
        addToast(`${name}'s account has been deleted.`, "success");
        fetchUsers();
      } catch (err) {
        addToast(err.response?.data?.message || "Failed to delete user", "error");
      }
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="animate-spin text-blue-500" size={48} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-6 animate-fade-scale">
        <div className="flex items-center gap-3 mb-8">
          <ShieldAlert className="text-red-500 dark:text-red-400" size={32} />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Admin Panel
          </h1>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700 text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold">User</th>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold">Role</th>
                  <th className="p-4 font-semibold">Total Notes</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-gray-800 dark:text-white">{user.full_name}</div>
                      <div className="text-xs text-gray-400 mt-1">Joined: {new Date(user.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">{user.email}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300 font-medium">{user.totalNotes}</td>
                    <td className="p-4 text-right">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handleDelete(user.id, user.full_name)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">No users found.</div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default AdminDashboard;
