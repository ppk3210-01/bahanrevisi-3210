import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { UserPlus } from 'lucide-react';

interface LocalUserProfile {
  id: string;
  username: string;
  role: 'admin' | 'user';
  avatar_url?: string | null;
  full_name?: string | null;
  created_at: string;
  updated_at: string;
}

const UserManagement: React.FC = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<LocalUserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user' as 'admin' | 'user'
  });

  const fetchUsers = async () => {
    if (!isAdmin) return;
    
    try {
      setIsLoading(true);
      
      const localUsers = localStorage.getItem('app.users');
      let usersList: LocalUserProfile[] = localUsers ? JSON.parse(localUsers) : [];
      
      try {
        const { data, error } = await supabase.from('profiles').select('*');
        
        if (error) {
          console.error('Supabase error fetching users:', error);
        } else if (data) {
          // Ensure proper typing of user data from Supabase
          const typedData = data.map(user => {
            // Ensure that role is either 'admin' or 'user'
            let safeRole: 'admin' | 'user' = 'user';
            if (user.role === 'admin' || user.role === 'user') {
              safeRole = user.role as 'admin' | 'user';
            }
            
            return {
              id: user.id,
              username: user.username,
              role: safeRole,
              avatar_url: user.avatar_url || null,
              full_name: user.full_name || null,
              created_at: user.created_at,
              updated_at: user.updated_at
            } as LocalUserProfile;
          });
          
          const supabaseUserIds = typedData.map(user => user.id);
          usersList = [
            ...typedData,
            ...usersList.filter(user => !supabaseUserIds.includes(user.id))
          ];
        }
      } catch (err) {
        console.error('Error connecting to Supabase:', err);
      }
      
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRole = async (userId: string, currentRole: 'admin' | 'user') => {
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      );
      setUsers(updatedUsers);
      localStorage.setItem('app.users', JSON.stringify(updatedUsers));
      
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ role: newRole })
          .eq('id', userId);
        
        if (error) {
          console.error('Supabase error updating user role:', error);
        }
      } catch (err) {
        console.error('Error connecting to Supabase:', err);
      }
      
      toast({
        title: 'Role updated',
        description: `User role changed to ${newRole}`,
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    
    try {
      const updatedUsers = users.filter(user => user.id !== deleteUserId);
      setUsers(updatedUsers);
      localStorage.setItem('app.users', JSON.stringify(updatedUsers));
      
      try {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', deleteUserId);
        
        if (error) {
          console.error('Supabase error deleting user:', error);
        }
      } catch (err) {
        console.error('Error connecting to Supabase:', err);
      }
      
      setDeleteUserId(null);
      
      toast({
        title: 'User deleted',
        description: 'User has been successfully deleted',
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };
      
      const timestamp = new Date().toISOString();
      
      const newUserProfile: LocalUserProfile = {
        id: generateUUID(),
        username: newUser.username,
        role: newUser.role,
        avatar_url: null,
        full_name: null,
        created_at: timestamp,
        updated_at: timestamp
      };
      
      const updatedUsers = [...users, newUserProfile];
      setUsers(updatedUsers);
      localStorage.setItem('app.users', JSON.stringify(updatedUsers));
      
      const credentials = JSON.parse(localStorage.getItem('app.credentials') || '[]');
      credentials.push({
        email: newUser.email,
        password: newUser.password,
        profileId: newUserProfile.id
      });
      localStorage.setItem('app.credentials', JSON.stringify(credentials));
      
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: newUser.email,
          password: newUser.password,
          options: {
            data: {
              username: newUser.username,
              role: newUser.role
            }
          }
        });
        
        if (authError) {
          console.error('Supabase auth error creating user:', authError);
        } else if (authData.user) {
          newUserProfile.id = authData.user.id;
          
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: authData.user.id,
              username: newUser.username,
              role: newUser.role,
              avatar_url: null,
              full_name: null,
              created_at: timestamp,
              updated_at: timestamp
            });
            
          if (profileError) {
            console.error('Supabase error creating profile:', profileError);
          }
        }
      } catch (err) {
        console.error('Error connecting to Supabase:', err);
      }
      
      setNewUser({
        username: '',
        email: '',
        password: '',
        role: 'user'
      });
      setIsAddUserDialogOpen(false);
      
      toast({
        title: 'User Added',
        description: 'New user has been successfully created',
      });
    } catch (error) {
      console.error('Error adding user:', error);
      toast({
        title: 'Error',
        description: 'Failed to add user',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  if (!isAdmin) return null;

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">Manage Users</Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:w-3/4 md:w-2/3 lg:max-w-2xl">
          <SheetHeader>
            <SheetTitle className="flex justify-between items-center">
              <span>User Management</span>
              <Button 
                size="sm" 
                onClick={() => setIsAddUserDialogOpen(true)}
                className="flex items-center gap-1"
              >
                <UserPlus className="h-4 w-4" />
                <span>Add User</span>
              </Button>
            </SheetTitle>
          </SheetHeader>
          
          <div className="overflow-x-auto mt-6">
            {isLoading ? (
              <p>Loading users...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleToggleRole(user.id, user.role)}
                        >
                          {user.role === 'admin' ? 'Make User' : 'Make Admin'}
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => setDeleteUserId(user.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </SheetContent>
      </Sheet>
      
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              and all their data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account. The user will be able to log in with these credentials.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">Username</Label>
              <Input 
                id="username" 
                value={newUser.username}
                onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input 
                id="email" 
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">Password</Label>
              <Input 
                id="password" 
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">Role</Label>
              <select 
                id="role"
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value as 'admin' | 'user'})}
                className="col-span-3 border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleAddUser} disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserManagement;
