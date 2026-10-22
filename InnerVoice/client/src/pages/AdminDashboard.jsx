import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import { getAllUsers, deleteUserByAdmin } from "../api/admin";
import { useToast } from "../context/ToastContext";
import GlassSurface from "../components/glass/GlassSurface";
import { ShieldAlert, Trash2, Loader2 } from "lucide-react";

function AdminDashboard() {
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await getAllUsers();
      setUsers(res.data.users || []);
    } catch (err) {
      setError(err.response?.status === 403 ? "This page is only available to admins." : "Could not load users. Please retry.");
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
          <Loader2 className="animate-spin text-[#e2b17a]" size={32} />
        </div>
      </Layout>
    );
  }

  if (error) return <Layout><div role="alert" className="p-6 text-[#f5f2eb]">{error}</div></Layout>;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-4 animate-fade-scale">
        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-white/[0.06]">
          <ShieldAlert className="text-[#e2b17a] shrink-0" size={26} />
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#f5f2eb] font-normal tracking-tight">Admin Panel</h1>
            <p className="text-xs text-[#9e9990] mt-1">{users.length} {users.length === 1 ? "user" : "users"}</p>
          </div>
        </div>

        <GlassSurface level={1} className="rounded-2xl sm:rounded-3xl border border-white/[0.08] overflow-hidden">
          {/* Mobile: one card per user */}
          <ul className="md:hidden divide-y divide-white/[0.06]">
            {users.map((user) => (
              <li key={user.id} className="p-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium text-[#f5f2eb] truncate">{user.full_name}</div>
                  <div className="text-xs text-[#9e9990] truncate">{user.email}</div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-[#9e9990]">
                    <span className={`px-2.5 py-0.5 rounded-full font-semibold ${user.role === "admin" ? "bg-[#e2b17a]/15 text-[#e2b17a]" : "bg-white/[0.06] text-[#f5f2eb]"}`}>
                      {user.role}
                    </span>
                    <span>{user.totalNotes} notes</span>
                    <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                {user.role !== "admin" && (
                  <button
                    onClick={() => handleDelete(user.id, user.full_name)}
                    className="p-2 text-[#9e9990] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                    title="Delete User"
                    aria-label={`Delete ${user.full_name}`}
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </li>
            ))}
          </ul>

          {/* Tablet and up: table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] text-[#9e9990] text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">User</th>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold">Role</th>
                  <th className="p-4 font-semibold">Total Notes</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-[#f5f2eb]">{user.full_name}</div>
                      <div className="text-xs text-[#9e9990] mt-1">Joined: {new Date(user.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="p-4 text-[#9e9990]">{user.email}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.role === "admin" ? "bg-[#e2b17a]/15 text-[#e2b17a]" : "bg-white/[0.06] text-[#f5f2eb]"}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-[#f5f2eb]">{user.totalNotes}</td>
                    <td className="p-4 text-right">
                      {user.role !== "admin" && (
                        <button
                          onClick={() => handleDelete(user.id, user.full_name)}
                          className="p-2 text-[#9e9990] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete User"
                          aria-label={`Delete ${user.full_name}`}
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
            <div className="p-12 text-center text-[#9e9990] text-sm">No users found.</div>
          )}
        </GlassSurface>
      </div>
    </Layout>
  );
}

export default AdminDashboard;
