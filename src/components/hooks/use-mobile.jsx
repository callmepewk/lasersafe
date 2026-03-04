import * as React from "react";

// Named export: useIsMobile
// Detects if viewport is considered mobile using matchMedia and resize fallback
export function useIsMobile(breakpoint = 768) {
  const getIsMobile = () => {
    if (typeof window === "undefined") return false;
    if (typeof window.matchMedia === "function") {
      return window.matchMedia(`(max-width: ${breakpoint - 1}px)`).matches;
    }
    return window.innerWidth < breakpoint;
  };

  const [isMobile, setIsMobile] = React.useState(getIsMobile);

  React.useEffect(() => {
    const onResize = () => setIsMobile(getIsMobile());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);

  return isMobile;
}