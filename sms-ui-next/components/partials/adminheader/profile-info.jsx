"use client";
import { useState, useEffect } from "react";
import { signOut, useSession, SessionProvider } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { faker } from "@faker-js/faker";
import { LockKeyhole } from "lucide-react";
import { Bell, Sun, Moon, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

// Import session utilities
import { getUserData, logout } from "@/utilities/sessionUtils";

const ProfileInfoComponent = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
  const Uid = userData.uid;
  const orgid = userData.orgid

  useEffect(() => {
    // Use the utility function instead of direct sessionStorage access

    console.log(userData)

    const userDatas =userData;
    
    if (userDatas) {
      setUser({...userDatas,username:userDatas.username});
    } else {
      // Fallback user data if no session found
      setUser({
        image: "/path/to/static/image.jpg", // Replace with actual static image path
        name: "Mcc Callem",
        username: "uxuidesigner",
      });
    }
  }, []);


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
    // Clear cookie (CRITICAL for middleware)
    deleteCookie(SESSION_KEYS.USER_DATA);
    
    // Clear sessionStorage
    Object.values(SESSION_KEYS).forEach(key => {
      if (key !== SESSION_KEYS.SESSION_BACKUP) {
        sessionStorage.removeItem(key);
      }
    });
    
    // Clear localStorage backup
    localStorage.removeItem(SESSION_KEYS.SESSION_BACKUP);
    
    console.log('All session data cleared');
  };
  
  const handleLogout = async () => {
    // Use the same clearSession function for consistency
    clearSession();
    
    // Clear any remaining localStorage items
    localStorage.clear();
    
    // Optional: Clear sessionStorage completely (clearSession already handles specific keys)
    sessionStorage.clear();
    
    // await signOut({ redirect: false });
    router.push("/");
  };

  const avatarFallback = user?.username ? user.username[0].toUpperCase() : 'A';

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <div className="flex items-center">
          <Avatar className=" ring-1 ring-primary ring-offset-[3px]  ring-offset-background">
            {/* <AvatarImage src={faker.image.avatarLegacy()} /> */}
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
          {/* {user.image && (
            <Image
              src={user.image}
              alt={user.username ?? ""}
              width={36}
              height={36}
              className="rounded-full"
            />
          )} */}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 p-0" align="end">
        <DropdownMenuLabel className="flex gap-2 items-center mb-1 p-3">
          {/* {user.image && (
            <Image
              src={user.image}
              alt={user.name ?? ""}
              width={36}
              height={36}
              className="rounded-full"
            />
          )} */}
          <div className="flex item-center ">
            {/* <div className="text-sm font-medium text-default-800 capitalize">
              {user.name} 
            </div> */}
            <Link
              href="/dashboard"
              className="text-xs text-default-600 pt-3 hover:text-primary"
            >
              {user.username || 'ABC' } 
            </Link>
           
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {[
            { name: "Profile", icon: "heroicons:user", href: "/admin/Profile" },
            // { name: "Billing", icon: "heroicons:megaphone", href: "/billing" },
            // { name: "Settings", icon: "heroicons:paper-airplane", href: "/settings" },
            // { name: "Keyboard shortcuts", icon: "heroicons:language", href: "/shortcuts" },
            {
              name: "Change Password",
              icon: "carbon:password",
              href: "/admin/changepassword",
            },
          ].map((item, index) => (
            <Link
              href={item.href}
              key={`info-menu-${index}`}
              className="cursor-pointer"
            >
              <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize px-3 py-1.5 dark:hover:bg-background cursor-pointer">
                <Icon icon={item.icon} className="w-4 h-4" />
                {item.name}
              </DropdownMenuItem>
            </Link>
          ))}
        </DropdownMenuGroup>
    
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={handleLogout}
          className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize my-1 px-3 dark:hover:bg-background cursor-pointer"
        >
          <Icon icon="heroicons:power" className="w-4 h-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ProfileInfo = () => (
  <ProfileInfoComponent />
);

export default ProfileInfo;