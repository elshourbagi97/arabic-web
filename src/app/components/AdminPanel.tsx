import React from "react";

interface UserData {
  email: string;
  username: string;
  tableCount: number;
  lastActive: string;
}

interface AdminPanelProps {
  users: UserData[];
}

export function AdminPanel({ users }: AdminPanelProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3
        className="mb-6"
        style={{
          fontSize: "var(--font-size-md)",
          fontWeight: 600,
          color: "var(--text-dark)",
        }}
      >
        لوحة الإدارة - جميع المستخدمين
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full" dir="rtl">
          <thead>
            <tr className="border-b-2 border-[var(--light-gray)]">
              <th
                className="text-right px-4 py-3 bg-gray-50"
                style={{
                  fontSize: "var(--font-size-sm)",
                  fontWeight: 600,
                  color: "var(--text-dark)",
                }}
              >
                اسم المستخدم
              </th>
              <th
                className="text-right px-4 py-3 bg-gray-50"
                style={{
                  fontSize: "var(--font-size-sm)",
                  fontWeight: 600,
                  color: "var(--text-dark)",
                }}
              >
                عدد الجداول
              </th>
              <th
                className="text-right px-4 py-3 bg-gray-50"
                style={{
                  fontSize: "var(--font-size-sm)",
                  fontWeight: 600,
                  color: "var(--text-dark)",
                }}
              >
                آخر نشاط
              </th>
              <th
                className="text-right px-4 py-3 bg-gray-50"
                style={{
                  fontSize: "var(--font-size-sm)",
                  fontWeight: 600,
                  color: "var(--text-dark)",
                }}
              >
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr
                key={index}
                className="border-b border-[var(--light-gray)] hover:bg-gray-50"
              >
                <td
                  className="px-4 py-3"
                  style={{
                    fontSize: "var(--font-size-sm)",
                    color: "var(--text-dark)",
                  }}
                >
                  {user.username}
                </td>
                <td
                  className="px-4 py-3"
                  style={{
                    fontSize: "var(--font-size-sm)",
                    color: "var(--text-medium)",
                  }}
                >
                  {user.tableCount}
                </td>
                <td
                  className="px-4 py-3"
                  style={{
                    fontSize: "var(--font-size-sm)",
                    color: "var(--text-medium)",
                  }}
                >
                  {user.lastActive}
                </td>
                <td className="px-4 py-3">
                  <button
                    className="text-[var(--primary-blue)] hover:underline"
                    style={{ fontSize: "var(--font-size-sm)" }}
                  >
                    عرض البيانات
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-8">
          <p
            style={{
              fontSize: "var(--font-size-md)",
              color: "var(--text-medium)",
            }}
          >
            لا يوجد مستخدمون حالياً
          </p>
        </div>
      )}
    </div>
  );
}
