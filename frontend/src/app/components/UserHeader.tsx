import React from "react";

interface UserData {
  email: string;
  username?: string;
  role: "admin" | "user";
}

interface UserAuthObject {
  user: UserData;
  token?: string;
}

interface UserHeaderProps {
  /**
   * The user prop can be the whole auth object from the API (which contains a nested `user` property)
   * or just the user data object itself.
   */
  user?: UserData | UserAuthObject | null;
  isLoading: boolean;
  onLogout?: () => void;
}

export function UserHeader({ user, isLoading, onLogout }: UserHeaderProps) {
  
  // The user object might be nested inside another "user" property from the API response.
  // This line gracefully handles both cases: `props.user` and `props.user.user`.
  const userData: UserData | null | undefined =
  user && "user" in user && typeof user.user === "object"
  ? (user as UserAuthObject).user
  : (user as UserData);
  
 
  if (isLoading) {
    return (
      <div className="bg-white border-b border-[var(--light-gray)] px-8 py-4 shadow-sm">
        <div
          className="max-w-[1600px] mx-auto flex justify-between items-center animate-pulse"
          dir="rtl"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-28"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
          <div className="h-9 w-24 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    );
  }

  if (!userData) {
    // Render nothing or a minimal header if there's no user and it's not loading.
    // This could be the case for a logged-out state on a public page.
    return null;
  }

  return (
    <div className="bg-white border-b border-[var(--light-gray)] px-8 py-4 shadow-sm">
      <div
        className="max-w-[1600px] mx-auto flex justify-between items-center"
        dir="rtl"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[var(--primary-blue)] text-white rounded-full flex items-center justify-center">
              <span
                style={{ fontSize: "var(--font-size-md)", fontWeight: 600 }}
              >
                {userData.username?.charAt(0).toUpperCase() || "م"}
              </span>
            </div>
            <div>
              <p
                style={{
                  fontSize: "19px",
                  fontWeight: 500,
                  color: "var(--text-dark)",
                }}
              >
                {userData.username || "مستخدم"}
              </p>
              {userData.role === "admin" && (
                <span
                  className="inline-block px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs"
                  style={{ fontSize: "11px" }}
                >
                  مدير النظام
                </span>
              )}
            </div>
          </div>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            className="px-4 py-2 text-[var(--text-medium)] hover:text-[var(--primary-blue)] transition-colors"
            style={{ fontSize: "var(--font-size-sm)" }}
          >
            تسجيل الخروج
          </button>
        )}
      </div>
    </div>
  );
}
