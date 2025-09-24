"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Profile from "../../../../components/Profile/Profile";
import toast from "react-hot-toast";
function PortalsPage() {
  const router = useRouter();

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

    if (roleTypeId != 5) {
       router.replace("/"); // redirect to unauthorized
      toast.error("You are not authorized to view this page.");
      handleLogout()
    }
  }, []);

  return (
    <div>
    </div>
  );
}

export default PortalsPage;
