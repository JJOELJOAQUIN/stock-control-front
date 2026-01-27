import { useState, useCallback } from "react";

export const useModal = () => {
  const [open, setOpen] = useState(false);

  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);

  return {
    open,
    setOpen,
    openModal,
    closeModal,
  };
};

export default useModal;
