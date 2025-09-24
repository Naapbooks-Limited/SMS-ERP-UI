import axios from 'axios';
import GlobalProperties from './GlobalPropperties';

const getToken = () => {
    try {
        const user = sessionStorage.getItem('token') || null;
        if (!user) return null;
        
        const data = JSON.parse(user);
        
        // Validate token format (basic check)
        if (typeof data === 'string' && data.length > 0) {
            return data;
        }
        
        console.warn('Invalid token format found in sessionStorage');
        return null;
    } catch (error) {
        console.error('Error parsing token from sessionStorage:', error);
        return null;
    }
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

const UrlType = {
    TEST: 'TEST',
    LIVE: 'LIVE',
    LOCAL: 'LOCAL'
};

const CallFor = async (requestUrl, method, data, headerType) => {
    let url = '';
    if (GlobalProperties.environment === UrlType.LIVE) {
        url = GlobalProperties.urlParam + requestUrl;
    } else if (GlobalProperties.environment === UrlType.TEST) {
        url = GlobalProperties.testParam + requestUrl;
    } else {
        url = GlobalProperties.localUrlParam + requestUrl;
    }

    const headers = {};

    switch (headerType) {
        case 'withoutAuth':
            headers['Content-Type'] = 'application/json';
            break;
        case 'Auth':
            const token = getToken();
            if (!token) {
                console.warn('No valid token found for authenticated request');
                throw new Error('Authentication token not available');
            }
            headers['authorization'] = 'Bearer ' + token;
            headers['Content-Type'] = 'application/json';
            break;
        case 'authWithoutContentType':
            const authToken = getToken();
            if (!authToken) {
                console.warn('No valid token found for authenticated request');
                throw new Error('Authentication token not available');
            }
            headers['authorization'] = 'Bearer ' + authToken;
            break;
        case 'authWithContentTypeMultipart':
            const multipartToken = getToken();
            if (!multipartToken) {
                console.warn('No valid token found for authenticated request');
                throw new Error('Authentication token not available');
            }
            headers['authorization'] = 'Bearer ' + multipartToken;
            headers['Content-Type'] = 'multipart/form-data';
            break;
        default:
            break;
    }

    // Add debugging logs
    console.log('API Request Details:', {
        url,
        method,
        headers,
        data: data ? (typeof data === 'object' ? JSON.stringify(data, null, 2) : data) : 'No data',
        timestamp: new Date().toISOString()
    });

    try {
        const response = await axios({
            url,
            method,
            headers,
            data,
            timeout: 30000, // Add timeout
        });
        
        console.log('API Response Success:', {
            status: response.status,
            url,
            data: response.data
        });
        
        return response;
    } catch (error) {
        // Enhanced error logging
        console.error('API Request Failed:', {
            url,
            method,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message,
            headers: error.response?.headers,
            requestData: data
        });

        // Handle specific error cases
        if (error.response?.status === 401) {
            console.log('Unauthorized - logging out user');
            handleLogout();
            throw new Error('Session expired. Please login again.');
        } else if (error.response?.status === 500) {
            console.error('Server Error (500):', {
                url,
                requestData: data,
                responseData: error.response?.data
            });
            
            // Return a controlled error response instead of throwing
            return {
                error: true,
                status: 500,
                message: error.response?.data?.message || 'Internal server error occurred. Please try again later.',
                data: error.response?.data || null,
                originalError: error
            };
        } else if (error.response?.status === 404) {
            return {
                error: true,
                status: 404,
                message: 'The requested resource was not found.',
                data: null,
                originalError: error
            };
        } else if (error.response?.status >= 400 && error.response?.status < 500) {
            // Client errors (400-499)
            return {
                error: true,
                status: error.response.status,
                message: error.response?.data?.message || 'Client error occurred.',
                data: error.response?.data || null,
                originalError: error
            };
        } else if (!error.response) {
            // Network errors
            return {
                error: true,
                status: 0,
                message: 'Network error. Please check your connection and try again.',
                data: null,
                originalError: error
            };
        }
        
        // For other errors, still throw to maintain existing behavior
        throw error;
    }
}

export default CallFor;