"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUserData } from '@/utilities/sessionUtils';
import { toast } from "sonner";
import { SiteLogo } from "@/components/svg";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        router.push('/');
        return;
      }

      const userData = getUserData();

      // If roles are specified, check user role
      if (allowedRoles.length > 0) {
        if (!userData || !allowedRoles.includes(userData.roleid)) {
          // Show unauthorized toast
          toast("Not authorized to access this area");

          // Redirect to appropriate dashboard based on role
          let redirectRoute = '/';
          if (userData) {
            switch (userData.roleid) {
              case 0: // Admin
                redirectRoute = '/admin/admindashboard';
                break;
              case 4: // Warehouse
                redirectRoute = '/warehouse/warehousedashboard';
                break;
              case 5: // Station
                redirectRoute = '/station/stationdashboard';
                break;
              default:
                redirectRoute = '/';
            }
          }

          router.push(redirectRoute);
          return;
        }
      }

      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [router, allowedRoles]);

  if (isLoading) {
    return (
        <div className=" h-screen flex items-center justify-center flex-col space-y-2">
      <SiteLogo className=" h-10 w-10 text-primary" />
      <span className=" inline-flex gap-1">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </span>
    </div>
    );
  }

  return isAuthorized ? children : null;
};

export default ProtectedRoute;
