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
  //       setTimeout(() => { toast("Not authorized") }, 10);
  //       return false;
  //     }

  //     const userData = JSON.parse(logindata);

  //     if (userData.roleid !== 5) {
  //       router.push('/');
  //       setTimeout(() => { toast("Not authorized") }, 10);
  //       return false;
  //     }

  //     // Only remove sessionStorage items if not on specified routes
  //     if (
  //       pathname !== "/station/Catalogue/Products/addnewattribute" &&
  //       pathname !== "/station/Catalogue/Products/productadd"
  //     ) {
  //       sessionStorage.removeItem('productFormData');
  //       sessionStorage.removeItem('imagePreview');
  //     }

  //     return true;
  //   };

  //   if (!checkAuth()) {
  //     return; // Stop further execution if not authenticated
  //   }
  // }, [router, pathname]);

  // return <MainLayout>{children}</MainLayout>;
  

  return (
    <SessionProvider>
      <ProtectedRoute allowedRoles={[5]}> 
        <MainLayout>
          {children}
        </MainLayout>
      </ProtectedRoute>
    </SessionProvider>

    
  );
};

export default StationLayout;