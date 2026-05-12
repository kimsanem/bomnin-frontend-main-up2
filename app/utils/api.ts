export const $api = async (request: string, opts: any = {}) => {
    const config = useRuntimeConfig();
    const { authToken } = useAuthState();

    try {
        return await $fetch(request, {
            baseURL: config.public.apiBase,
            ...opts,
            headers: {
                'Accept': 'application/json',
                ...(authToken.value ? { 'Authorization': `Bearer ${authToken.value}` } : {}),
                ...opts.headers,
            }
        });
    } catch (error: any) {
        if (error.response?.status === 401) {
            console.warn('Session Expired or Unauthorized!');
        }

        throw error;
    }
};
