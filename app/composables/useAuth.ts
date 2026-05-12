export const useAuth = () => {
  const user = useState("user", () => null)
  const config = useRuntimeConfig()
  const { authToken: token } = useAuthState()

  const fetchUser = async () => {
    try {
      user.value = await $fetch("/user", {
        baseURL: config.public.apiBase,
        headers: {
          Accept: "application/json",
          ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
        },
      })
    } catch {
      user.value = null
    }
  }

  return { user, fetchUser }
}
