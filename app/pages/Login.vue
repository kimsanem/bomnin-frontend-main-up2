<template>
  <div class="max-w-md mx-auto">

    <BaseCard>
      <h2 class="text-2xl font-bold mb-6 text-center">
        ចូលគណនី
      </h2>

      <div class="space-y-4">
        <input class="input input-bordered w-full" placeholder="Email" />
        <input type="password" class="input input-bordered w-full" placeholder="Password" />
        <button class="btn btn-primary w-full">
          Login
        </button>
      </div>

      <p class="text-sm text-center mt-4">
        មិនទាន់មានគណនី?
        <NuxtLink to="/register" class="link link-primary">
          Register
        </NuxtLink>
      </p>
    </BaseCard>

  </div>
</template>