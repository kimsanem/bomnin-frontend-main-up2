export const $api = async (request: string, opts: any = {}) => {
    const config = useRuntimeConfig();
    const token = useCookie('auth_token');

    try {
        return await $fetch(request, {
            // ១. ភ្ជាប់ Base URL អូតូ (ឧ. http://127.0.0.1:8000)
            baseURL: config.public.apiBase,
            
            // ២. រក្សាបន្ថែម Option ផ្សេងៗដែលគេបោះមក (method, body...)
            ...opts,
            
            // ៣. ភ្ជាប់ Headers & Token អូតូ
            headers: {
                'Accept': 'application/json',
                ...(token.value ? { 'Authorization': `Bearer ${token.value}` } : {}),
                ...opts.headers, // អនុញ្ញាតឱ្យថែម Header ផ្សេងទៀតបានបើត្រូវការ
            }
        });
    } catch (error: any) {
        // ៤. ចាប់ Error ទីតាំងតែមួយ (ឧ. បើ Token ផុតកំណត់ (401) ឱ្យវាលុបចោលអូតូ)
        if (error.response?.status === 401) {
            console.warn("Session Expired or Unauthorized!");
            token.value = null; // លុប Token
            
            // អ្នកអាចថែមកូដ Redirect ទៅកាន់ទំព័រ Login នៅទីនេះបាននាពេលអនាគត
            // const router = useRouter();
            // router.push('/login');
        }
        throw error;
    }
};