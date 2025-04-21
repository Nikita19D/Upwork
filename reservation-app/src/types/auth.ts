// Define user roles
export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'waiter',
  CUSTOMER = 'customer',
  BODYGUARD = 'bodyguard'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}