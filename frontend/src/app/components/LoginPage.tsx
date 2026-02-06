import React, { useState, useEffect } from "react";
import { PrimaryButton } from "./PrimaryButton";
import { SecondaryButton } from "./SecondaryButton";
import apiService from "../../services/apiService";

interface LoginPageProps {
  onLogin: (email: string, password: string) => void;
  onSwitchToRegister: () => void;
  error?: string | null;
  onErrorDismiss?: () => void;
}

export function LoginPage({
  onLogin,
  onSwitchToRegister,
  error: externalError,
  onErrorDismiss,
}: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotPasswordError, setForgotPasswordError] = useState("");
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoadingForgot, setIsLoadingForgot] = useState(false);

  useEffect(() => {
    if (externalError) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
      }, 5000); // Auto-hide after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [externalError]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("الرجاء إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    if (!email.includes("@")) {
      setError("الرجاء إدخال بريد إلكتروني صحيح");
      return;
    }

    onLogin(email, password);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordError("");
    setForgotPasswordSuccess("");
    setNewPassword("");

    if (!forgotEmail || !forgotEmail.includes("@")) {
      setForgotPasswordError("الرجاء إدخال بريد إلكتروني صحيح");
      return;
    }

    setIsLoadingForgot(true);
    try {
      const response = await apiService.forgotPassword(forgotEmail);
      setForgotPasswordSuccess(
        response.message || "تم إعادة تعيين كلمة المرور بنجاح",
      );
      setNewPassword(response.new_password || "");
      setForgotEmail("");
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || "حدث خطأ أثناء إعادة تعيين كلمة المرور";
      setForgotPasswordError(errorMsg);
    } finally {
      setIsLoadingForgot(false);
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
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
            نظام إدارة الفحوصات
          </h1>
          <p
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--text-medium)",
            }}
          >
            تسجيل الدخول إلى حسابك
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Backend Error Message */}
          {externalError && showError && (
            <div
              className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 flex justify-between items-center animate-pulse"
              style={{
                fontSize: "var(--font-size-sm)",
                backgroundColor: "#fee2e2",
                borderLeftColor: "#dc2626",
              }}
            >
              <span>⚠️ {externalError}</span>
              <button
                onClick={() => {
                  setShowError(false);
                  onErrorDismiss?.();
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#dc2626",
                  cursor: "pointer",
                  fontSize: "18px",
                }}
              >
                ✕
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Local Validation Error Message */}
            {error && (
              <div
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700"
                style={{ fontSize: "var(--font-size-sm)" }}
              >
                {error}
              </div>
            )}

            {/* Email Input */}
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
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-[var(--border-gray)] rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] focus:border-transparent
                  transition-all"
                placeholder="example@domain.com"
                style={{ fontSize: "var(--font-size-md)" }}
                dir="ltr"
              />
            </div>

            {/* Password Input */}
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
                كلمة المرور
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
                  />
                  <span style={{ fontSize: "var(--font-size-sm)" }}>إظهار</span>
                </label>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex justify-between items-center mb-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="ml-2 w-4 h-4 text-[var(--primary-blue)] 
                    border-gray-300 rounded focus:ring-[var(--primary-blue)]"
                />
                <span
                  style={{
                    fontSize: "var(--font-size-sm)",
                    color: "var(--text-medium)",
                  }}
                >
                  تذكرني
                </span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="hover:underline"
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--primary-blue)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                نسيت كلمة المرور؟
              </button>
            </div>

            {/* Login Button */}
            <div className="mb-4">
              <PrimaryButton type="submit" className="w-full">
                تسجيل الدخول
              </PrimaryButton>
            </div>
          </form>
        </div>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--text-medium)",
            }}
          >
            ليس لديك حساب؟{" "}
            <button
              onClick={onSwitchToRegister}
              className="hover:underline"
              style={{
                color: "var(--primary-blue)",
                fontWeight: 600,
              }}
            >
              إنشاء حساب جديد
            </button>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowForgotPassword(false);
            setForgotEmail("");
            setForgotPasswordError("");
            setForgotPasswordSuccess("");
            setNewPassword("");
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2
                style={{
                  fontSize: "var(--font-size-lg)",
                  fontWeight: 700,
                  color: "var(--text-dark)",
                }}
              >
                إعادة تعيين كلمة المرور
              </h2>
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotEmail("");
                  setForgotPasswordError("");
                  setForgotPasswordSuccess("");
                  setNewPassword("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  color: "#666",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            {forgotPasswordSuccess ? (
              <div>
                <div
                  className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700"
                  style={{ fontSize: "var(--font-size-sm)" }}
                >
                  {forgotPasswordSuccess}
                </div>
                {newPassword && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p
                      style={{
                        fontSize: "var(--font-size-sm)",
                        color: "var(--text-dark)",
                        marginBottom: "8px",
                      }}
                    >
                      كلمة المرور الجديدة:
                    </p>
                    <div
                      className="p-3 bg-white border border-blue-300 rounded font-mono text-center text-lg font-bold"
                      style={{ color: "var(--primary-blue)" }}
                    >
                      {newPassword}
                    </div>
                    <p
                      style={{
                        fontSize: "var(--font-size-xs)",
                        color: "var(--text-medium)",
                        marginTop: "8px",
                      }}
                    >
                      يرجى نسخ كلمة المرور وحفظها في مكان آمن
                    </p>
                  </div>
                )}
                <PrimaryButton
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotEmail("");
                    setForgotPasswordError("");
                    setForgotPasswordSuccess("");
                    setNewPassword("");
                  }}
                  className="w-full"
                >
                  إغلاق
                </PrimaryButton>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword}>
                {forgotPasswordError && (
                  <div
                    className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700"
                    style={{ fontSize: "var(--font-size-sm)" }}
                  >
                    {forgotPasswordError}
                  </div>
                )}

                <div className="mb-6">
                  <label
                    htmlFor="forgot-email"
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
                    id="forgot-email"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-[var(--border-gray)] rounded-lg 
                      focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] focus:border-transparent
                      transition-all"
                    placeholder="example@domain.com"
                    style={{ fontSize: "var(--font-size-md)" }}
                    dir="ltr"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <SecondaryButton
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotEmail("");
                      setForgotPasswordError("");
                    }}
                    className="flex-1"
                  >
                    إلغاء
                  </SecondaryButton>
                  <PrimaryButton
                    type="submit"
                    className="flex-1"
                    disabled={isLoadingForgot}
                  >
                    {isLoadingForgot ? "جاري المعالجة..." : "إرسال"}
                  </PrimaryButton>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
