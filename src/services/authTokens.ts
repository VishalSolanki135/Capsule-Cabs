export function getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
}

export function setAccessToken(token: string) {
    localStorage.setItem('accessToken', token);
}

export function clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
}
    