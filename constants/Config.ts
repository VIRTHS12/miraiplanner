const BASE_URL = "https://miraiapi-production.up.railway.app";

export const API_URL = {
    // Jalur Base utama
    BASE_URL: BASE_URL,

    // Gerbang Autentikasi Google OAuth & Session JWT
    LOGIN_GOOGLE: `${BASE_URL}/api/auth/google`,
    AUTH_CALLBACK: `${BASE_URL}/api/auth/google/callback`,
    REFRESH_TOKEN: `${BASE_URL}/api/auth/refresh-token`,

    // Fitur Chatbot & Kalender
    CHAT_SEND: `${BASE_URL}/api/chat/send`,
    CHAT_HISTORY: `${BASE_URL}/api/chat/history`,
    CALENDAR_EVENTS: `${BASE_URL}/api/calendar/events`,
    CALENDAR_EVENT: `${BASE_URL}/api/calendar/event`,
    GET_CONFIG: `${BASE_URL}/api/auth/config`,
};
