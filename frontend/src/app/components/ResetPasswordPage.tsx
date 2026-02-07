import React, { useState, useEffect } from "react";
import { PrimaryButton } from "./PrimaryButton";
import apiService from "../../services/apiService";

interface ResetPasswordPageProps {
  onSuccess: () => void;
}

export function ResetPasswordPage({ onSuccess }: ResetPasswordPageProps) {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Extract email and token from URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get("email");
    const tokenParam = urlParams.get("token");

    if (emailParam) {
      setEmail(emailParam);
    }
    if (tokenParam) {
      setToken(tokenParam);
    }

    // If no token or email, show error
    if (!emailParam || !tokenParam) {
      setError(
        "رابط إعادة تعيين كلمة المرور غير صحيح. يرجى طلب رابط جديد من صفحة تسجيل الدخول.",
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!email || !token) {
      setError(
        "رابط إعادة تعيين كلمة المرور غير صحيح. يرجى طلب رابط جديد من صفحة تسجيل الدخول.",
      );
      return;
    }

    if (!password || !passwordConfirmation) {
      setError("الرجاء إدخال كلمة المرور وتأكيد كلمة المرور");
      return;
    }

    if (password.length < 8) {
      setError("يجب أن تكون كلمة المرور 8 أحرف على الأقل");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("كلمة المرور وتأكيد كلمة المرور غير متطابقين");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.resetPassword(
        email,
        token,
        password,
        passwordConfirmation,
      );
      setSuccess(
        response.message || "تم إعادة تعيين كلمة المرور بنجاح! يتم تحويلك لتسجيل الدخول...",
      );
      // Redirect to login after 2 seconds
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: any) {
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 400 || message?.includes("token")) {
        setError(
          "رابط إعادة تعيين كلمة المرور غير صحيح أو منتهي الصلاحية. يرجى طلب رابط جديد.",
        );
      } else if (status === 422) {
        const errors = err.response?.data?.errors;
        if (errors) {
          const firstErrorKey = Object.keys(errors)[0];
          setError(errors[firstErrorKey][0]);
        } else {
          setError(message || "حدث خطأ في التحقق من البيانات");
        }
      } else {
        setError(message || "حدث خطأ أثناء إعادة تعيين كلمة المرور");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4"
      dir="rtl"
      style={{ fontFamily: "Cairo, sans-serif" }}
    >
      <div className="w-full max-w-md">
        {/* Logo/Header Section */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-[var(--primary-blue)] rounded-full mb-4 shadow-lg">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>
          <h1
            className="mb-2"
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "var(--text-dark)",
            }}
          >
            إعادة تعيين كلمة المرور
          </h1>
          <p
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--text-medium)",
            }}
          >
            أدخل كلمة المرور الجديدة الخاصة بك
          </p>
        </div>

        {/* Reset Password Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Success Message */}
          {success && (
            <div
              className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg text-green-700"
              style={{
                fontSize: "var(--font-size-sm)",
                backgroundColor: "#d1fae5",
                borderLeftColor: "#10b981",
              }}
            >
              <span>✓ {success}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div
              className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700"
              style={{
                fontSize: "var(--font-size-sm)",
                backgroundColor: "#fee2e2",
                borderLeftColor: "#dc2626",
              }}
            >
              <span>⚠️ {error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email Input (read-only) */}
            <div className="mb-6">
              <label
                htmlFor="email"
                className="block mb-2"
                style={{
                  fontSize: "var(--font-size-sm)",
                  fontWeight: 600,
                  color: "var(--text-dark)",
                }}
              >
                البريد الإلكتروني
              </label>
              <input
                id="email"
                type="email"
                value={email}
                readOnly
                className="w-full px-4 py-3 border border-[var(--border-gray)] rounded-lg 
                  bg-gray-50 cursor-not-allowed"
                style={{ fontSize: "var(--font-size-md)" }}
                dir="ltr"
              />
            </div>

            {/* New Password Input */}
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block mb-2"
                style={{
                  fontSize: "var(--font-size-sm)",
                  fontWeight: 600,
                  color: "var(--text-dark)",
                }}
              >
                كلمة المرور الجديدة
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-[var(--border-gray)] rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] focus:border-transparent
                    transition-all"
                  placeholder="••••••••"
                  style={{ fontSize: "var(--font-size-md)" }}
                  disabled={isLoading || !!success}
                />
                <label
                  className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 cursor-pointer"
                  style={{ color: "var(--text-medium)" }}
                >
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="w-4 h-4 text-[var(--primary-blue)] border-gray-300 rounded 
                      focus:ring-[var(--primary-blue)] cursor-pointer"
                    disabled={isLoading || !!success}
                  />
                  <span style={{ fontSize: "var(--font-size-sm)" }}>
                    إظهار
                  </span>
                </label>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="mb-6">
              <label
                htmlFor="passwordConfirmation"
                className="block mb-2"
                style={{
                  fontSize: "var(--font-size-sm)",
                  fontWeight: 600,
                  color: "var(--text-dark)",
                }}
              >
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <input
                  id="passwordConfirmation"
                  type={showPasswordConfirmation ? "text" : "password"}
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-[var(--border-gray)] rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] focus:border-transparent
                    transition-all"
                  placeholder="••••••••"
                  style={{ fontSize: "var(--font-size-md)" }}
                  disabled={isLoading || !!success}
                />
                <label
                  className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 cursor-pointer"
                  style={{ color: "var(--text-medium)" }}
                >
                  <input
                    type="checkbox"
                    checked={showPasswordConfirmation}
                    onChange={(e) =>
                      setShowPasswordConfirmation(e.target.checked)
                    }
                    className="w-4 h-4 text-[var(--primary-blue)] border-gray-300 rounded 
                      focus:ring-[var(--primary-blue)] cursor-pointer"
                    disabled={isLoading || !!success}
                  />
                  <span style={{ fontSize: "var(--font-size-sm)" }}>
                    إظهار
                  </span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mb-4">
              <PrimaryButton
                type="submit"
                className="w-full"
                disabled={isLoading || !!success}
              >
                {isLoading
                  ? "جاري إعادة التعيين..."
                  : "إعادة تعيين كلمة المرور"}
              </PrimaryButton>
            </div>
          </form>
        </div>

        {/* Back to Login Link */}
        <div className="mt-6 text-center">
          <p
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--text-medium)",
            }}
          >
            تذكرت كلمة المرور؟{" "}
            <button
              onClick={onSuccess}
              className="hover:underline"
              style={{
                color: "var(--primary-blue)",
                fontWeight: 600,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              العودة لتسجيل الدخول
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
