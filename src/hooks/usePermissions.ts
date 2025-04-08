
import { useAuth, UserRole } from '@/hooks/useAuth';
import { FilterSelection } from '@/types/budget';

/**
 * Hook to check user permissions for various actions
 */
export const usePermissions = () => {
  const { user, profile } = useAuth();
  const userRole = profile?.role || 'viewer';
  
  // Check if user is authenticated
  const isAuthenticated = !!user;
  
  // Check if user has admin role
  const isAdmin = isAuthenticated && userRole === 'admin';
  
  // Check if user has at least user role
  const isUser = isAuthenticated && (userRole === 'user' || userRole === 'admin');
  
  // Check if user can edit items
  const canEditItems = (filters: FilterSelection, itemCreatedByUser = false) => {
    if (isAdmin) return true;
    if (!isUser) return false;
    
    // For regular users, only allow edit if all filters are active and not set to "all"
    const allFiltersActive = 
      filters.programPembebanan !== 'all' && 
      filters.kegiatan !== 'all' && 
      filters.rincianOutput !== 'all' && 
      filters.komponenOutput !== 'all' && 
      filters.subKomponen !== 'all' && 
      filters.akun !== 'all';
    
    return allFiltersActive;
  };
  
  // Check if user can approve budget items
  const canApproveBudgetItems = () => {
    return isAdmin;
  };
  
  // Check if user can delete items
  const canDeleteItems = (itemCreatedByUser = false, itemApproved = false) => {
    if (isAdmin) return true;
    if (!isUser) return false;
    
    // Regular users can only delete items they created that haven't been approved
    return itemCreatedByUser && !itemApproved;
  };
  
  // Check if user can access import/export features
  const canAccessImportExport = () => {
    return isAdmin;
  };
  
  // Check if user can edit uraian (description)
  const canEditUraian = (itemCreatedByUser = false) => {
    if (isAdmin) return true;
    if (!isUser) return false;
    
    // Regular users can only edit uraian for items they created
    return itemCreatedByUser;
  };
  
  return {
    isAuthenticated,
    isAdmin,
    isUser,
    userRole,
    canEditItems,
    canApproveBudgetItems,
    canDeleteItems,
    canAccessImportExport,
    canEditUraian
  };
};
