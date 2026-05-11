export const $api = async (request: string, opts: any = {}) => {
    const config = useRuntimeConfig();
    const token = useCookie('auth_token');
    const user = useCookie('user_data');

    try {
        return await $fetch(request, {
            baseURL: config.public.apiBase,
            ...opts,
            headers: {
                'Accept': 'application/json',
                ...(token.value ? { 'Authorization': `Bearer ${token.value}` } : {}),
                ...opts.headers,
            }
        });
    } catch (error: any) {
        if (error.response?.status === 401) {
            console.warn('Session Expired or Unauthorized!');
            token.value = null;
            user.value = null;
        }

        throw error;
    }
};
