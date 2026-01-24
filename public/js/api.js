const API_BASE_URL = '/api';

const api = {
    getToken() {
        const token = localStorage.getItem('token');
        return (token && token !== 'null') ? token : null;
    },

    async get(endpoint) {
        const token = this.getToken();
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Authorization': token ? `Bearer ${token}` : ''
            }
        });
        if (response.status === 401) {
            window.location.href = 'login.html';
            return;
        }
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'API Request Failed');
        }
        return await response.json();
    },

    async post(endpoint, data) {
        const token = this.getToken();
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify(data)
        });
        if (response.status === 401 && endpoint !== '/auth/login') {
            window.location.href = 'login.html';
            return;
        }
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'API Request Failed');
        }
        return await response.json();
    },

    async put(endpoint, data) {
        const token = this.getToken();
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify(data)
        });
        if (response.status === 401) {
            window.location.href = 'login.html';
            return;
        }
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'API Request Failed');
        }
        return await response.json();
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
};
