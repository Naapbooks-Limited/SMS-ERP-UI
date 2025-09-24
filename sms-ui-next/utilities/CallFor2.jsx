import axios from 'axios';
import GlobalProperties from './GlobalPropperties';

const getToken = () => {
    const user = sessionStorage.getItem('nopToken') || null;
    const data = user ? JSON.parse(user) : null;
    return data ? data : null;
}

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
    window.location.href = '/';
  };


const UrlType = {
    TEST: 'TEST',
    LIVE: 'LIVE',
    LOCAL: 'LOCAL'
};

const CallFor2 = async (requestUrl, method, data, headerType,responseType = "json") => {
    let url = '';
    // if (GlobalProperties.environment === UrlType.LIVE) {
    //     url = GlobalProperties.urlParam + requestUrl;
    // } else if (GlobalProperties.environment === UrlType.TEST) {
    //     url = GlobalProperties.testParam + requestUrl;
    // } else {
    url = GlobalProperties.ezeo_shopmystation + requestUrl;
    // }

    const headers = {};

    switch (headerType) {
        case 'withoutAuth':
            headers['Content-Type'] = 'application/json';
            break;
        case 'Auth':
            // headers['authorization'] = 'Bearer ' + getToken();
            headers['Token'] = getToken();
            headers['Content-Type'] = 'application/json';
            break;
        case 'authWithoutContentType':
            headers['authorization'] = 'Bearer ' + getToken();
            break;
        case 'authWithContentTypeMultipart':
            headers['Token'] = getToken();
            headers['Content-Type'] = 'multipart/form-data';
            break;
        default:
            break;
    }

    try {
       const response = await axios({
            url,
            method,
            headers,
            data,
            responseType // 🔹 allow blob, json, text etc.
        });
        return response;
    } catch (error) {
        if (error.response?.status === 401) {
            // handleLogout();
        }
        throw error;
    }
}

export default CallFor2;



// 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJDdXN0b21lcklkIjoxLCJleHAiOjE3MzQ3NzY3NDIuMH0.Ry59TosqpfR7rOjt9BznbMWUgzcAYcrokl00AoRplGs'