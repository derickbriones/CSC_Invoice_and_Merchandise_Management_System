import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2, Plus, X, Search } from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface UserWithRoles {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  student_id: string | null;
  course: string | null;
  year_level: number | null;
  created_at: string;
  roles: AppRole[];
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithRoles | null>(null);
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', student_id: '', course: '', year_level: '', role: 'student' as AppRole,
  });

  const fetchUsers = async () => {
    const { data: profiles } = await supabase.from('profiles').select('*');
    const { data: roles } = await supabase.from('user_roles').select('*');

    const usersWithRoles: UserWithRoles[] = (profiles || []).map(p => ({
      ...p,
      roles: (roles || []).filter(r => r.user_id === p.user_id).map(r => r.role),
    }));

    setUsers(usersWithRoles);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const filteredUsers = users.filter(u => {
    const q = search.toLowerCase();
    return !q || `${u.first_name} ${u.last_name} ${u.email} ${u.student_id || ''}`.toLowerCase().includes(q);
  });

  const startEdit = (user: UserWithRoles) => {
    setEditingUser(user);
    setForm({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      student_id: user.student_id || '',
      course: user.course || '',
      year_level: user.year_level?.toString() || '',
      role: user.roles[0] || 'student',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.first_name || !form.last_name || !form.email) {
      toast.error('Name and email are required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (editingUser) {
      // Update profile
      const { error: profileError } = await supabase.from('profiles').update({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        student_id: form.student_id || null,
        course: form.course || null,
        year_level: form.year_level ? parseInt(form.year_level) : null,
      }).eq('user_id', editingUser.user_id);

      if (profileError) {
        toast.error('Failed to update profile');
        return;
      }

      // Update role if changed
      if (editingUser.roles[0] !== form.role) {
        await supabase.from('user_roles').delete().eq('user_id', editingUser.user_id);
        await supabase.from('user_roles').insert({ user_id: editingUser.user_id, role: form.role });
      }

      toast.success('User updated');
    }

    setShowForm(false);
    setEditingUser(null);
    setForm({ first_name: '', last_name: '', email: '', student_id: '', course: '', year_level: '', role: 'student' });
    fetchUsers();
  };

  const deleteUser = async (user: UserWithRoles) => {
    if (!confirm(`Are you sure you want to remove ${user.first_name} ${user.last_name}? This only removes their profile and role data.`)) return;

    await supabase.from('user_roles').delete().eq('user_id', user.user_id);
    const { error } = await supabase.from('profiles').delete().eq('user_id', user.user_id);

    if (error) {
      toast.error('Failed to delete user');
    } else {
      toast.success('User removed');
      fetchUsers();
    }
  };

  const roleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'staff': return 'bg-blue-100 text-blue-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  if (loading) return <div className="text-center py-10 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-card-foreground">User Management</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="login-input pl-9 w-60"
            />
          </div>
        </div>
      </div>

      {/* Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <Card className="w-full max-w-md" onClick={e => e.stopPropagation()}>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-card-foreground">{editingUser ? 'Edit User' : 'User Details'}</h3>
                <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-card-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">First Name *</label>
                  <input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} className="login-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Last Name *</label>
                  <input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} className="login-input" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="login-input" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Student ID</label>
                  <input value={form.student_id} onChange={e => setForm(f => ({ ...f, student_id: e.target.value }))} className="login-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Course</label>
                  <input value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))} className="login-input" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Year Level</label>
                  <input type="number" min="1" max="5" value={form.year_level} onChange={e => setForm(f => ({ ...f, year_level: e.target.value }))} className="login-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Role *</label>
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as AppRole }))} className="login-input">
                    <option value="student">Student</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} className="flex-1">Save Changes</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.first_name} {u.last_name}</TableCell>
                  <TableCell className="text-sm">{u.email}</TableCell>
                  <TableCell>{u.student_id || '-'}</TableCell>
                  <TableCell>{u.course || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {u.roles.map((r) => (
                        <Badge key={r} className={roleColor(r)}>{r}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => startEdit(u)} title="Edit">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteUser(u)} title="Delete" className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-10">No users found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">Total: {filteredUsers.length} users</p>
    </div>
  );
};

export default AdminUsers;
