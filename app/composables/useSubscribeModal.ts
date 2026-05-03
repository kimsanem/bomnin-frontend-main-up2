// composables/useSubscribeModal.ts
export const useSubscribeModal = () => {
  const isOpen = useState('subscribeModalState', () => false);

  const open = () => (isOpen.value = true);
  const close = () => (isOpen.value = false);

  return { isOpen, open, close };
};