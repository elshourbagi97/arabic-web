import React, { useState, useEffect } from "react";
import { PrimaryButton } from "./PrimaryButton";

interface RegistrationPageProps {
  onRegister: (
    name: string,
    username: string,
    email: string,
    password: string,
    passwordConfirmation: string,
  ) => void;
  onSwitchToLogin: () => void;
  success?: string | null;
  onSuccessDismiss?: () => void;
  backendError?: string | null;
  onBackendErrorDismiss?: () => void;
}

export function RegistrationPage({
  onRegister,
  onSwitchToLogin,
  success: externalSuccess,
  onSuccessDismiss,
  backendError: externalBackendError,
  onBackendErrorDismiss,
}: RegistrationPageProps) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showBackendError, setShowBackendError] = useState(false);

  useEffect(() => {
    if (externalSuccess) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3000); // Auto-hide after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [externalSuccess]);

  useEffect(() => {
    if (externalBackendError) {
      setShowBackendError(true);
      const timer = setTimeout(() => {
        setShowBackendError(false);
      }, 5000); // Auto-hide after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [externalBackendError]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !username || !email || !password || !confirmPassword) {
      setError("الرجاء ملء جميع الحقول");
      return;
    }

    if (!email.includes("@")) {
      setError("الرجاء إدخال بريد إلكتروني صحيح");
      return;
    }

    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    if (password !== confirmPassword) {
      setError("كلمة المرور وتأكيد كلمة المرور غير متطابقتين");
      return;
    }

    onRegister(name, username, email, password, confirmPassword);
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
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
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
            إنشاء حساب جديد
          </h1>
          <p
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--text-medium)",
            }}
          >
            انضم إلى نظام إدارة الفحوصات
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Success Message */}
          {externalSuccess && showSuccess && (
            <div
              className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg text-green-700 flex justify-between items-center animate-pulse"
              style={{
                fontSize: "var(--font-size-sm)",
                backgroundColor: "#dcfce7",
                borderLeftColor: "#16a34a",
              }}
            >
              <span>✅ {externalSuccess}</span>
              <button
                onClick={() => {
                  setShowSuccess(false);
                  onSuccessDismiss?.();
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#16a34a",
                  cursor: "pointer",
                  fontSize: "18px",
                }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Backend Error Message */}
          {externalBackendError && showBackendError && (
            <div
              className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 flex justify-between items-center animate-pulse"
              style={{
                fontSize: "var(--font-size-sm)",
                backgroundColor: "#fee2e2",
                borderLeftColor: "#dc2626",
              }}
            >
              <span>❌ {externalBackendError}</span>
              <button
                onClick={() => {
                  setShowBackendError(false);
                  onBackendErrorDismiss?.();
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
            {/* Styled Error Message */}
            {error && (
              <div
                className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 flex justify-between items-center animate-pulse"
                style={{
                  fontSize: "var(--font-size-sm)",
                  backgroundColor: "#fee2e2",
                  borderLeftColor: "#dc2626",
                }}
              >
                <span>⚠️ {error}</span>
                <button
                  onClick={() => setError("")}
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

            {/* Name Input */}
            <div className="mb-5">
              <label
                htmlFor="name"
                className="block mb-2"
                style={{
                  fontSize: "var(--font-size-sm)",
                  fontWeight: 600,
                  color: "var(--text-dark)",
                }}
              >
                الاسم الكامل
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-[var(--border-gray)] rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] focus:border-transparent
                  transition-all"
                placeholder="أدخل اسمك الكامل"
                style={{ fontSize: "var(--font-size-md)" }}
              />
            </div>

            {/* Username Input */}
            <div className="mb-5">
              <label
                htmlFor="username"
                className="block mb-2"
                style={{
                  fontSize: "var(--font-size-sm)",
                  fontWeight: 600,
                  color: "var(--text-dark)",
                }}
              >
                اسم المستخدم
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-[var(--border-gray)] rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] focus:border-transparent
                  transition-all"
                placeholder="أدخل اسم المستخدم الفريد"
                style={{ fontSize: "var(--font-size-md)" }}
              />
            </div>

            {/* Email Input */}
            <div className="mb-5">
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
            <div className="mb-5">
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
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-[var(--border-gray)] rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] focus:border-transparent
                  transition-all"
                placeholder="6 أحرف على الأقل"
                style={{ fontSize: "var(--font-size-md)" }}
              />
            </div>

            {/* Confirm Password Input */}
            <div className="mb-5">
              <label
                htmlFor="confirmPassword"
                className="block mb-2"
                style={{
                  fontSize: "var(--font-size-sm)",
                  fontWeight: 600,
                  color: "var(--text-dark)",
                }}
              >
                تأكيد كلمة المرور
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-[var(--border-gray)] rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] focus:border-transparent
                  transition-all"
                placeholder="أعد إدخال كلمة المرور"
                style={{ fontSize: "var(--font-size-md)" }}
              />
            </div>

            {/* Terms */}
            <div className="mb-6">
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 ml-2 w-4 h-4 text-[var(--primary-blue)] 
                    border-gray-300 rounded focus:ring-[var(--primary-blue)]"
                  required
                />
                <span
                  style={{
                    fontSize: "var(--font-size-sm)",
                    color: "var(--text-medium)",
                  }}
                >
                  أوافق على{" "}
                  <a
                    href="#"
                    className="hover:underline"
                    style={{ color: "var(--primary-blue)" }}
                  >
                    الشروط والأحكام
                  </a>{" "}
                  و{" "}
                  <a
                    href="#"
                    className="hover:underline"
                    style={{ color: "var(--primary-blue)" }}
                  >
                    سياس�� الخصوصية
                  </a>
                </span>
              </label>
            </div>

            {/* Register Button */}
            <div className="mb-4">
              <PrimaryButton type="submit" className="w-full">
                إنشاء الحساب
              </PrimaryButton>
            </div>
          </form>
        </div>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--text-medium)",
            }}
          >
            لديك حساب بالفعل؟{" "}
            <button
              onClick={onSwitchToLogin}
              className="hover:underline"
              style={{
                color: "var(--primary-blue)",
                fontWeight: 600,
              }}
            >
              تسجيل الدخول
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
