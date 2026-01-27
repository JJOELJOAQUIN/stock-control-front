import { useRef } from "react";

export function useHorizontalScroll() {
  const ref = useRef<HTMLDivElement | null>(null);

  const scrollLeft = () => {
    if (ref.current) ref.current.scrollBy({ left: -150, behavior: "smooth" });
  };

  const scrollRight = () => {
    if (ref.current) ref.current.scrollBy({ left: 150, behavior: "smooth" });
  };

  return { ref, scrollLeft, scrollRight };
}
