const AUTH_COOKIE_OPTIONS = {
  maxAge: 60 * 60 * 24 * 30,
  path: '/',
  sameSite: 'lax' as const,
};

export const useAuthState = () => {
  const authToken = useCookie<string | null>('auth_token', AUTH_COOKIE_OPTIONS);
  const userData = useCookie<any>('user_data', AUTH_COOKIE_OPTIONS);

  const clearAuth = () => {
    authToken.value = null;
    userData.value = null;
  };

  return {
    authToken,
    userData,
    clearAuth,
    authCookieOptions: AUTH_COOKIE_OPTIONS,
  };
};
