"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";


export default function PortalsLayout({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  const deleteCookie = (name) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/`;
};
 
const SESSION_KEYS = {
    USER_DATA: "userData",
    NOP_TOKEN: "nopToken",
    TOKEN: "token",
    SESSION_BACKUP: "sessionBackup"
};
 
const clearSession = () => {
    deleteCookie(SESSION_KEYS.USER_DATA);
    Object.values(SESSION_KEYS).forEach(key => {
        if (key !== SESSION_KEYS.SESSION_BACKUP) {
            sessionStorage.removeItem(key);
        }
    });
    localStorage.removeItem(SESSION_KEYS.SESSION_BACKUP);
    console.log('All session data cleared');
};
 
const handleLogout = async () => {
    clearSession();
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
};
  
  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
    const roleTypeId = userData?.roletypeid;

    if (roleTypeId == 5) {
      setAuthorized(true); // allow page to load
    } else {
      router.replace("/"); // redirect to unauthorized
      toast.error("You are not authorized to view this page.");
      handleLogout()
    }
  }, []);

  if (!authorized) return null; // or a loading spinner

  return <>{children}</>;
}
