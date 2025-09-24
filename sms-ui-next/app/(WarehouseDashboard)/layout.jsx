"use client"
import { useEffect } from "react";
import MainLayout from "./main-layout";
import { useRouter, usePathname } from "next/navigation";
import SessionProvider from '@/components/SessionProvider'; 
import ProtectedRoute from '@/components/ProtectedRoute';
import { toast } from "sonner";

const StationLayout = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();


  // useEffect(() => {
  //   const checkAuth = () => {
  //     const logindata = sessionStorage.getItem('userData');
  //     if (!logindata) {
  //       router.push('/');
  //       return false;
  //     }
  //     const userData = JSON.parse(logindata);
  //     if (userData.roleid !== 4) {
  //       router.push('/');
  //       setTimeout(() => { toast("Not authorized") }, 10);
  //       return false;
  //     }
  //     return true;
  //   };

  //   if (!checkAuth()) {
  //     return; // Stop further execution if not authenticated
  //   }
  // }, [router, pathname]);


  
  return (
    <SessionProvider>
      <ProtectedRoute allowedRoles={[4]}> {/* Only allow role 5 (Station) */}
        <MainLayout>
          {children}
        </MainLayout>
      </ProtectedRoute>
    </SessionProvider>


  );
};

export default StationLayout;

