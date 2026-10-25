"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/app/store/hooks";
import { apiSlice } from "@/app/store/apiSlice";
import { useToast } from "@/app/context/ToastContext";

export function DashboardShortcuts() {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Intercept Ctrl+R or Cmd+R (excluding Ctrl+Shift+R for hard browser reload)
      if (!e.shiftKey && (e.ctrlKey || e.metaKey) && (e.key === "r" || e.key === "R")) {
        e.preventDefault();

        // Invalidate RTK Query cache tags to immediately refetch active dashboard queries
        dispatch(
          apiSlice.util.invalidateTags([
            "Counts",
            "Surveys",
            "AdminSurveys",
            "Suppliers",
            "Vendors",
            "Transactions",
            "AdminUsers",
          ])
        );

        // Notify any active page components listening for refresh
        window.dispatchEvent(new CustomEvent("dashboard:refresh"));

        showToast("Dashboard refreshed", "info");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dispatch, showToast]);

  return null;
}
