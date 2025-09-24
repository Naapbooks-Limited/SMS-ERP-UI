// sessionUtils.js - Utility functions for session management

export const SESSION_KEYS = {
  USER_DATA: "userData",
  NOP_TOKEN: "nopToken", 
  TOKEN: "token",
  SESSION_BACKUP: "sessionBackup"
};

// Save session data to both sessionStorage and localStorage backup
export const saveToSession = (userData) => {
  try {
    // Save to sessionStorage
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
  } catch (error) {
    console.error("Error saving session data:", error);
  }
};

// Restore session from localStorage backup to sessionStorage
export const restoreSessionFromBackup = () => {
  try {
    const backup = JSON.parse(localStorage.getItem(SESSION_KEYS.SESSION_BACKUP));
    if (backup && backup.timestamp) {
      // Check if backup is less than 24 hours old (adjust as needed)
      const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
      if (Date.now() - backup.timestamp < TWENTY_FOUR_HOURS) {
        // Restore to sessionStorage
        sessionStorage.setItem(SESSION_KEYS.USER_DATA, JSON.stringify(backup.userData));
        sessionStorage.setItem(SESSION_KEYS.NOP_TOKEN, JSON.stringify(backup.nopToken));
        sessionStorage.setItem(SESSION_KEYS.TOKEN, JSON.stringify(backup.token));
        return backup.userData;
      } else {
        // Remove expired backup
        localStorage.removeItem(SESSION_KEYS.SESSION_BACKUP);
      }
    }
  } catch (error) {
    console.error("Error restoring session backup:", error);
  }
  return null;
};

// Get user data from sessionStorage, with fallback to localStorage backup
export const getUserData = () => {
  try {
    // First try sessionStorage
    let userData = JSON.parse(sessionStorage.getItem(SESSION_KEYS.USER_DATA));
    
    // If not found, try to restore from backup
    if (!userData) {
      userData = restoreSessionFromBackup();
    }
    
    return userData;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};

// Get token from sessionStorage, with fallback to localStorage backup
export const getToken = () => {
  try {
    // First try sessionStorage
    let token = JSON.parse(sessionStorage.getItem(SESSION_KEYS.TOKEN));
    
    // If not found, try to restore from backup
    if (!token) {
      const userData = restoreSessionFromBackup();
      token = userData ? userData.token : null;
    }
    
    return token;
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

// Get nopToken from sessionStorage, with fallback to localStorage backup
export const getNopToken = () => {
  try {
    // First try sessionStorage
    let nopToken = JSON.parse(sessionStorage.getItem(SESSION_KEYS.NOP_TOKEN));
    
    // If not found, try to restore from backup
    if (!nopToken) {
      const userData = restoreSessionFromBackup();
      nopToken = userData ? userData.nopToken : null;
    }
    
    return nopToken;
  } catch (error) {
    console.error("Error getting nopToken:", error);
    return null;
  }
};

// Clear all session data
export const clearSession = () => {
  try {
    // Clear sessionStorage
    Object.values(SESSION_KEYS).forEach(key => {
      if (key !== SESSION_KEYS.SESSION_BACKUP) {
        sessionStorage.removeItem(key);
      }
    });
    
    // Clear localStorage backup
    localStorage.removeItem(SESSION_KEYS.SESSION_BACKUP);
  } catch (error) {
    console.error("Error clearing session:", error);
  }
};

// Logout function that clears session and redirects
export const logout = (router = null) => {
  clearSession();
  
  // Clear remember me if needed
  // localStorage.removeItem("rememberMe"); // Uncomment if you want to clear remember me on logout
  
  if (router) {
    router.push('/');
  } else {
    window.location.href = '/';
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const userData = getUserData();
  return userData && userData.token;
};

// Initialize session restoration (call this in your app layout or main component)
export const initializeSessionRestore = () => {
  // Check if sessionStorage is empty but localStorage backup exists
  if (!sessionStorage.getItem(SESSION_KEYS.USER_DATA)) {
    restoreSessionFromBackup();
  }
};