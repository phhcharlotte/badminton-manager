// src/components/auth/ProtectedRoute.tsx
import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';

interface Props {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<Props> = ({
  allowedRoles,
  children,
  fallback,
}) => {
  const { currentUser, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !currentUser) {
    return null;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return (
      <>
        {fallback || (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 400,
              color: '#718096',
            }}
          >
            <div style={{ fontSize: 64, marginBottom: 16 }}>🚫</div>

            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: '#1b1b2f',
                marginBottom: 8,
              }}
            >
              Không có quyền truy cập
            </div>

            <div style={{ fontSize: 14 }}>
              Trang này chỉ dành cho: {allowedRoles.join(', ')}
            </div>
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;