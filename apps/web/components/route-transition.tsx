import { ViewTransition } from "react";

export function RouteTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition
      enter={{
        "nav-forward": "page-from-bottom",
        "nav-back": "page-from-top",
        default: "slide-up",
      }}
      exit={{
        "nav-forward": "page-to-top",
        "nav-back": "page-to-bottom",
        default: "none",
      }}
      default="none"
    >
      {children}
    </ViewTransition>
  );
}
