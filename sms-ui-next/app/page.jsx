"use client";
import React, { useEffect, useState, useTransition, useMemo, useRef } from "react";
import Head from "next/head";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import CallFor from '@/utilities/CallFor';
import { Shopmystationlogin } from "@/components/svg";
import { useRouter } from "next/navigation";

// Move schema outside component to prevent re-creation on each render
const schema = z.object({
  email: z.string().email({ message: "Your email is invalid." }),
  password: z.string().min(4),
  rememberMe: z.boolean(),
});

// Default form values as a constant
const defaultValues = {
  email: "",
  password: "",
  rememberMe: false,
};

// Helper functions for session management
const SESSION_KEYS = {
  USER_DATA: "userData",
  NOP_TOKEN: "nopToken", 
  TOKEN: "token",
  SESSION_BACKUP: "sessionBackup"
};

// Cookie helper functions
const setCookie = (name, value, days = 1) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }
  return null;
};

const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/`;
};

const saveToSession = (userData) => {
  try {
    // Save to cookie for middleware access (CRITICAL)
    setCookie(SESSION_KEYS.USER_DATA, JSON.stringify(userData), 1);
    
    // Also save to sessionStorage for client-side access
    sessionStorage.setItem(SESSION_KEYS.USER_DATA, JSON.stringify(userData));
    sessionStorage.setItem(SESSION_KEYS.NOP_TOKEN, JSON.stringify(userData.nopToken));
    sessionStorage.setItem(SESSION_KEYS.TOKEN, JSON.stringify(userData.token));
   
    // Also backup to localStorage for cross-tab functionality
    const sessionBackup = {
      userData,
      nopToken: userData.nopToken,
      token: userData.token,
      timestamp: Date.now()
    };
    localStorage.setItem(SESSION_KEYS.SESSION_BACKUP, JSON.stringify(sessionBackup));
    
    console.log('User data saved to cookie and storage:', userData);
  } catch (error) {
    console.error('Error saving session data:', error);
  }
};

const restoreSessionFromBackup = () => {
  try {
    // First try cookie (for middleware compatibility)
    const cookieData = getCookie(SESSION_KEYS.USER_DATA);
    if (cookieData) {
      const userData = JSON.parse(cookieData);
      // Validate userData has required fields
      if (userData && userData.roleid !== undefined && userData.token) {
        // Restore to sessionStorage as well
        sessionStorage.setItem(SESSION_KEYS.USER_DATA, JSON.stringify(userData));
        if (userData.nopToken) {
          sessionStorage.setItem(SESSION_KEYS.NOP_TOKEN, JSON.stringify(userData.nopToken));
        }
        sessionStorage.setItem(SESSION_KEYS.TOKEN, JSON.stringify(userData.token));
        return userData;
      } else {
        // Invalid cookie data, clear it
        deleteCookie(SESSION_KEYS.USER_DATA);
      }
    }

    // Fallback to localStorage backup
    const backupStr = localStorage.getItem(SESSION_KEYS.SESSION_BACKUP);
    if (backupStr) {
      const backup = JSON.parse(backupStr);
      if (backup && backup.timestamp && backup.userData) {
        // Check if backup is less than 24 hours old
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
        if (Date.now() - backup.timestamp < TWENTY_FOUR_HOURS) {
          // Validate backup userData
          if (backup.userData.roleid !== undefined && backup.userData.token) {
            console.log('Restoring from localStorage backup');
            // Restore to both cookie and sessionStorage
            setCookie(SESSION_KEYS.USER_DATA, JSON.stringify(backup.userData), 1);
            sessionStorage.setItem(SESSION_KEYS.USER_DATA, JSON.stringify(backup.userData));
            if (backup.nopToken) {
              sessionStorage.setItem(SESSION_KEYS.NOP_TOKEN, JSON.stringify(backup.nopToken));
            }
            sessionStorage.setItem(SESSION_KEYS.TOKEN, JSON.stringify(backup.token));
            return backup.userData;
          }
        } else {
          console.log('Backup expired, removing');
          // Remove expired backup
          localStorage.removeItem(SESSION_KEYS.SESSION_BACKUP);
        }
      }
    }
  } catch (error) {
    console.error("Error restoring session backup:", error);
    // Clear potentially corrupted data
    deleteCookie(SESSION_KEYS.USER_DATA);
    localStorage.removeItem(SESSION_KEYS.SESSION_BACKUP);
  }
  return null;
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

// Function to get current user data
const getCurrentUserData = () => {
  try {
    // First check sessionStorage
    const sessionData = sessionStorage.getItem(SESSION_KEYS.USER_DATA);
    if (sessionData) {
      const userData = JSON.parse(sessionData);
      // Validate userData
      if (userData && userData.roleid !== undefined && userData.token) {
        return userData;
      } else {
        // Invalid session data, clear it
        sessionStorage.removeItem(SESSION_KEYS.USER_DATA);
      }
    }
    
    // Fallback to cookie
    const cookieData = getCookie(SESSION_KEYS.USER_DATA);
    if (cookieData) {
      const userData = JSON.parse(cookieData);
      // Validate userData
      if (userData && userData.roleid !== undefined && userData.token) {
        return userData;
      } else {
        // Invalid cookie data, clear it
        deleteCookie(SESSION_KEYS.USER_DATA);
      }
    }
  } catch (error) {
    console.error("Error getting current user data:", error);
    // Clear potentially corrupted data
    sessionStorage.removeItem(SESSION_KEYS.USER_DATA);
    deleteCookie(SESSION_KEYS.USER_DATA);
  }
  return null;
};

export default function Login() {
  const [isPending, startTransition] = useTransition();
  const [passwordType, setPasswordType] = useState("password");
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const router = useRouter();
  const hasCheckedSession = useRef(false);
  const isRedirecting = useRef(false);
  const loginAttempts = useRef(0);  // Track login attempts
  const maxRetries = 3;  // Maximum number of retry attempts

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues,
  });

  useEffect(() => {
    // Prevent multiple session checks
    if (hasCheckedSession.current || isRedirecting.current) {
      return;
    }

    const checkExistingSession = async () => {
      try {
        console.log('Checking existing session...');
        hasCheckedSession.current = true;
        
        // First check current session
        let userData = getCurrentUserData();
        console.log('Current session data:', userData ? 'Found' : 'Not found');

        // If no current session data, try to restore from backup
        if (!userData) {
          console.log('Attempting to restore from backup...');
          userData = restoreSessionFromBackup();
          
          if (userData) {
            console.log('Session restored from backup');
            // Give a small delay for cookie to be fully set
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        
        // If user data exists, redirect to appropriate dashboard
        if (userData && userData.roleid !== undefined) {
          let route = "/"; // Default route
          switch (userData.roleid) {
            case 4:
              route = "/warehouse/warehousedashboard";
              break;
            case 5:
              route = "/station/stationdashboard";
              break;
            case 0:
              route = "/admin/admindashboard";
              break;
          }
          
          console.log('Valid session found, redirecting to:', route);
          isRedirecting.current = true;
          
          // Force a small delay to ensure middleware can read the cookie
          setTimeout(() => {
            window.location.replace(route);
// Use replace to avoid back button issues
          }, 150);
          return;
        }

        console.log('No valid session found, staying on login page');

        // Load saved credentials for "Remember Me" functionality
        try {
          const savedCredentials = localStorage.getItem("rememberMe");
          if (savedCredentials) {
            const parsed = JSON.parse(savedCredentials);
            if (parsed && !parsed.fromLocalStorage) {
              setValue("email", parsed.email);
              setValue("password", parsed.password);
              setValue("rememberMe", true);
            }
          }
        } catch (error) {
          console.error("Error loading saved credentials:", error);
        }
      } catch (error) {
        console.error("Error in checkExistingSession:", error);
        // Clear potentially corrupted data
        clearSession();
      } finally {
        // Only set to false if we're not redirecting
        if (!isRedirecting.current) {
          setIsCheckingSession(false);
        }
      }
    };

    checkExistingSession();
  }, [setValue, router]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      // If session backup is removed from another tab, it means user logged out
      if (e.key === SESSION_KEYS.SESSION_BACKUP && e.newValue === null) {
        clearSession();
        // Reset the session check flag to allow re-checking
        hasCheckedSession.current = false;
        isRedirecting.current = false;
        setIsCheckingSession(false);
        // Reload the page to reset state
        window.location.reload();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Toggle password visibility
  const togglePasswordType = () => {
    setPasswordType((prevType) => (prevType === "text" ? "password" : "text"));
  };

  // Memoize the form submission handler
  const onSubmit = useMemo(() => async (data) => {
    // Prevent submission if still checking session or already logged in or redirecting
    if (isCheckingSession || getCurrentUserData() || isRedirecting.current) {
      console.log('Login prevented - session check in progress, already logged in, or redirecting');
      return;
    }

    startTransition(async () => {
      try {
        console.log('Attempting login with:', data.email);
        loginAttempts.current += 1;  // Increment attempt counter
        
        const response = await CallFor('v2/account/UserLogin', 'POST', {
          emailid: data.email,
          password: data.password,
        }, 'withoutAuth');

        if (response.status == 200) {
          const userData = response.data;
          loginAttempts.current = 0;  // Reset attempts on successful login
          
          console.log('Login successful, user data received:', {
            roleid: userData.roleid,
            roletypeid: userData.roletypeid,
            uid: userData.uid
          });

          // Check for critical fields
          const requiredFields = ["uid", "orgid", "uaid", "token", "roleid"];

          // Check if any required field is missing or null/undefined
          const missingFields = requiredFields.filter(
            (key) => userData[key] == null || userData[key] == undefined
          );

          if (missingFields.length > 0) {
            console.error("Missing critical user data fields:", missingFields);
            toast.error("Invalid Credentials - Missing required data");
            
            // Check if max retries reached
            if (loginAttempts.current >= maxRetries) {
              console.log('Max login attempts reached. Clearing all storage...');
              clearSession();
              localStorage.clear();  // Clear all localStorage
              toast.error("Max login attempts reached. Please try again.");
              loginAttempts.current = 0;  // Reset counter
              return;
            }
            return;
          }

          // Save session data (CRITICAL: saves to cookie for middleware)
          saveToSession(userData);

          // Handle remember me
          if (data.rememberMe) {
            localStorage.setItem(
              "rememberMe",
              JSON.stringify({ 
                email: data.email, 
                password: data.password, 
                fromLocalStorage: false 
              })
            );
          } else {
            localStorage.removeItem("rememberMe");
          }

          // Handle role-based redirection
          let route = "/"; // Default route
          
          switch (userData.roleid) {
            case 4:
              route = "/warehouse/warehousedashboard";
              break;
            case 5:
              route = "/station/stationdashboard";
              break;
            case 0:
              route = "/admin/admindashboard";
              break;
          }
          
          console.log('Redirecting to:', route);
          toast.success("Login Successful");
          reset();
          
          // Set redirecting flag to prevent further actions
          isRedirecting.current = true;
          
          // Small delay to ensure cookie is set before navigation
          setTimeout(() => {
           window.location.replace(route);

          }, 100);
          
        } else {
          console.error('Login failed with status:', response.status);
          
          // Check if max retries reached
          if (loginAttempts.current >= maxRetries) {
            console.log('Max login attempts reached. Clearing all storage...');
            clearSession();
            localStorage.clear();  // Clear all localStorage
            toast.error("Max login attempts reached. Please try again.");
            loginAttempts.current = 0;  // Reset counter
          } else {
            toast.error(`Login failed. ${maxRetries - loginAttempts.current} attempts remaining.`);
          }
        }
      } catch (error) {
        console.error("Login error:", error);
        
        // Check if max retries reached
        if (loginAttempts.current >= maxRetries) {
          console.log('Max login attempts reached. Clearing all storage...');
          clearSession();
          localStorage.clear();  // Clear all localStorage
          toast.error("Max login attempts reached. Please try again.");
          loginAttempts.current = 0;  // Reset counter
        } else {
          toast.error(`An error occurred. ${maxRetries - loginAttempts.current} attempts remaining.`);
        }
      }
    });
  }, [router, reset, startTransition, isCheckingSession]);

  // Don't render the form if we're redirecting
  if (isRedirecting.current) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#113754]">
        <div className="text-white text-center">
          <div className="mb-4">Redirecting...</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-[#113754]">
        <div className="w-full max-w-sm text-[15px]">
          <div className="mb-10 text-center">
            <Shopmystationlogin />
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label
                className="block text-gray-400 text-sm mb-2"
                htmlFor="email"
              >
                Email
              </label>
              <input
                className="shadow bg-transparent appearance-none border border-white rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
                id="email"
                type="email"
                placeholder="Enter your email"
                disabled={isCheckingSession}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="mb-1">
              <label
                className="block text-gray-400 text-sm mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <input
                className="shadow bg-transparent appearance-none border border-white rounded w-full py-2 px-3 text-white mb-3 leading-tight focus:outline-none focus:shadow-outline"
                id="password"
                type={passwordType}
                placeholder="Enter your password"
                disabled={isCheckingSession}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
              <div className="text-right">
                <button
                  type="button"
                  onClick={togglePasswordType}
                  className="text-sm text-gray-400"
                  disabled={isCheckingSession}
                >
                  {passwordType === "text" ? "Hide Password" : "Show Password"}
                </button>
              </div>
            </div>
            <div className="mb-5">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox text-[#f08434] bg-transparent border-gray-300 rounded"
                  disabled={isCheckingSession}
                  {...register("rememberMe")}
                />
                <span className="ml-2 text-gray-400 text-sm">Remember Me</span>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <button
                className="bg-[#f08434] hover:bg-orange-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                type="submit"
                disabled={isPending || isCheckingSession}
              >
                {isCheckingSession ? "Checking..." : isPending ? "Logging In..." : "Log In"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}