
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { UserProfile } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, UserPlus } from 'lucide-react';

const UserManagement: React.FC = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
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
      
      // First, get users from local storage
      const localUsers = localStorage.getItem('app.users');
      let usersList: UserProfile[] = localUsers ? JSON.parse(localUsers) : [];
      
      // Then try to fetch from Supabase if available
      try {
        const { data, error } = await supabase.from('profiles').select('*');
        
        if (error) {
          console.error('Supabase error fetching users:', error);
        } else if (data) {
          // Merge with local users, prefer Supabase data
          const supabaseUserIds = data.map(user => user.id);
          usersList = [
            ...data,
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

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const handleToggleRole = async (userId: string, currentRole: 'admin' | 'user') => {
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      
      // Update in local storage first
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      );
      setUsers(updatedUsers);
      localStorage.setItem('app.users', JSON.stringify(updatedUsers));
      
      // Then try to update in Supabase
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
      // Remove from local state and storage
      const updatedUsers = users.filter(user => user.id !== deleteUserId);
      setUsers(updatedUsers);
      localStorage.setItem('app.users', JSON.stringify(updatedUsers));
      
      // Try to delete from Supabase
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
      
      // Generate a UUID for local storage users
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };
      
      // Create new user profile
      const newUserProfile: UserProfile = {
        id: generateUUID(),
        username: newUser.username,
        role: newUser.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Add to local storage first
      const updatedUsers = [...users, newUserProfile];
      setUsers(updatedUsers);
      localStorage.setItem('app.users', JSON.stringify(updatedUsers));
      
      // Store login credentials in a separate area of local storage
      const credentials = JSON.parse(localStorage.getItem('app.credentials') || '[]');
      credentials.push({
        email: newUser.email,
        password: newUser.password,
        profileId: newUserProfile.id
      });
      localStorage.setItem('app.credentials', JSON.stringify(credentials));
      
      // Try to add to Supabase if available
      try {
        // First create auth user if possible
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
          // If auth user creation succeeded, update our local user with the actual UUID
          newUserProfile.id = authData.user.id;
          
          // Update the profile manually in case the trigger doesn't work
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: authData.user.id,
              username: newUser.username,
              role: newUser.role
            });
            
          if (profileError) {
            console.error('Supabase error creating profile:', profileError);
          }
        }
      } catch (err) {
        console.error('Error connecting to Supabase:', err);
      }
      
      // Reset form and close dialog
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
                          onClick={() => handleToggleRole(user.id, user.role as 'admin' | 'user')}
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
