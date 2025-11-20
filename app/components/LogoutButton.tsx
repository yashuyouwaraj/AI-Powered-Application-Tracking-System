import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

interface LogoutButtonProps {
  className?: string;
  showLabel?: boolean;
  onLogoutComplete?: () => void;
}

/**
 * LogoutButton Component
 * 
 * A reusable, production-ready logout button that:
 * - Only displays when user is authenticated
 * - Handles auth state checking without UI flicker
 * - Clears authentication on click
 * - Redirects to auth page after logout
 * - Provides optional callback on logout completion
 * 
 * @example
 * ```tsx
 * <LogoutButton className="custom-class" showLabel={true} />
 * ```
 */
const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  className = "",
  showLabel = true,
  onLogoutComplete
}) => {
  const navigate = useNavigate();
  const { auth, isLoading } = usePuterStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Check auth status on component mount to prevent flicker
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Auth status is checked by usePuterStore on init
        // We just need to wait for it to be ready
        const checkInterval = setInterval(() => {
          if (!isLoading) {
            setHasCheckedAuth(true);
            clearInterval(checkInterval);
          }
        }, 100);

        // Safety timeout - don't wait forever
        setTimeout(() => {
          setHasCheckedAuth(true);
          clearInterval(checkInterval);
        }, 5000);
      } catch (err) {
        console.error("Auth check error:", err);
        setHasCheckedAuth(true);
      }
    };

    checkAuthStatus();
  }, [isLoading]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      // Call the auth signOut method
      await auth.signOut();

      // Optional callback
      onLogoutComplete?.();

      // Add small delay for visual feedback
      setTimeout(() => {
        // Redirect to auth page
        navigate("/auth", { replace: true });
      }, 300);
    } catch (err) {
      console.error("Logout error:", err);
      setIsLoggingOut(false);
      // Still redirect even if error occurs
      setTimeout(() => {
        navigate("/auth", { replace: true });
      }, 500);
    }
  };

  // Don't render until auth check is complete (prevent flicker)
  if (!hasCheckedAuth) {
    return null;
  }

  // Only show if authenticated
  if (!auth.isAuthenticated || !auth.user) {
    return null;
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`
        logout-button
        px-4 py-2 rounded-lg font-medium
        bg-red-500 hover:bg-red-600 active:bg-red-700
        text-white
        transition-all duration-200 ease-in-out
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center gap-2
        ${className}
      `}
      aria-label="Logout"
      title={`Logout as ${auth.user?.username || "User"}`}
    >
      {/* Icon */}
      <svg
        className={`w-4 h-4 ${isLoggingOut ? "animate-spin" : ""}`}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>

      {/* Label */}
      {showLabel && (
        <span className="text-sm">
          {isLoggingOut ? "Logging out..." : "Logout"}
        </span>
      )}
    </button>
  );
};

export default LogoutButton;
