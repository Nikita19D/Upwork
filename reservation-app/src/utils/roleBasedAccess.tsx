import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../contexts/AuthContext';

interface RoleBasedProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component to conditionally render content based on user role
 */
export const RoleBasedAccess: React.FC<RoleBasedProps> = ({
  allowedRoles,
  children,
  fallback = null,
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return fallback as React.ReactElement;
  }

  const hasPermission = allowedRoles.includes(user.role);
  
  return hasPermission ? (children as React.ReactElement) : (fallback as React.ReactElement);
};

/**
 * Hook to check if current user has required roles
 */
export const useHasRole = (allowedRoles: UserRole[]): boolean => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !user) {
    return false;
  }
  
  return allowedRoles.includes(user.role);
};