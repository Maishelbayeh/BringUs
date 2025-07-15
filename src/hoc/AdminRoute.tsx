import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

interface AdminRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

/**
 * مكون لحماية الصفحات التي تحتاج دور admin
 * يتحقق من أن المستخدم مسجل دخول ودوره admin
 */
const AdminRoute: React.FC<AdminRouteProps> = ({ 
  children, 
  fallbackPath = '/login' 
}) => {
  const { isAuthenticated, isAuthenticatedAdmin, getCurrentUser } = useAuth();
  const { t } = useTranslation();

  // التحقق من تسجيل الدخول
  if (!isAuthenticated()) {
    console.log('🚫 المستخدم غير مسجل دخول، التوجيه لصفحة تسجيل الدخول');
    return <Navigate to={fallbackPath} replace />;
  }

  // التحقق من دور admin
  if (!isAuthenticatedAdmin()) {
    const user = getCurrentUser();
    console.log('🚫 المستخدم ليس admin، الدور الحالي:', user?.role);
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {t('admin.accessDenied') || 'الوصول مرفوض'}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('admin.adminRequired') || 'هذه الصفحة تتطلب صلاحيات مدير النظام'}
            </p>
            <div className="bg-gray-100 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-700">
                <strong>الدور الحالي:</strong> {user?.role || 'غير محدد'}
              </p>
              <p className="text-sm text-gray-700">
                <strong>المستخدم:</strong> {user?.firstName} {user?.lastName}
              </p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('admin.goBack') || 'العودة للصفحة السابقة'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // المستخدم مسجل دخول ودوره admin
  console.log('✅ المستخدم مسجل دخول ودوره admin، السماح بالوصول');
  return <>{children}</>;
};

export default AdminRoute; 