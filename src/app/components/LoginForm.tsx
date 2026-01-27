import React, { useState } from "react";
import axios from "axios";

interface UserData {
  email: string;
  username?: string;
  role: "admin" | "user";
}

interface LoginFormProps {
  /**
   * Callback to update the parent state (setUser and setToken)
   */
  onLogin: (user: UserData, token: string) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/login",
        {
          email,
          password,
        },
      );

      console.log("API Response:", response.data);

      // Instead of calling setUser/setToken directly here, we call the prop
      // which will update the state in the parent component
      if (response.data.user && response.data.token) {
        onLogin(response.data.user, response.data.token);
      } else {
        setLoginError("استجابة غير صالحة من الخادم");
      }
    } catch (err: any) {
      console.error(err);
      setLoginError(err.response?.data?.message || "حدث خطأ في تسجيل الدخول");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="max-w-md mx-auto mt-10 p-8 bg-white rounded-lg shadow-md"
      dir="rtl"
    >
      <h2 className="text-2xl font-bold mb-6 text-center text-[var(--text-dark)]">
        تسجيل الدخول
      </h2>

      {loginError && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">
          {loginError}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            البريد الإلكتروني
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            كلمة المرور
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-200 disabled:opacity-50"
        >
          {isLoading ? "جاري التحميل..." : "دخول"}
        </button>
      </form>
    </div>
  );
}
