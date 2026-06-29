export type PermissionAction = 'CREATE_POST' | 'LIKE_POST' | 'DELETE_POST';

export interface PermissionContext {
  user?: {
    id: string;
    role?: string;
  };
}

export function checkPermission(user: PermissionContext['user'], action: PermissionAction, resource: { type: string }) {
  if (!user) {
    return false;
  }

  if (user.role === 'ADMIN') {
    return true;
  }

  if (user.role === 'MODERATOR') {
    return action !== 'LIKE_POST';
  }

  if (user.role === 'GUEST') {
    return false;
  }

  if (action === 'CREATE_POST' || action === 'DELETE_POST') {
    return true;
  }

  if (action === 'LIKE_POST') {
    return true;
  }

  return false;
}
