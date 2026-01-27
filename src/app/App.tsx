import React, { useState, useEffect } from "react";
import { TopSelectionButton } from "./components/TopSelectionButton";
import { TableContainer } from "./components/TableContainer";
import { NotesTextarea } from "./components/NotesTextarea";
import { InspectionTabs } from "./components/InspectionTabs";
import { PrimaryButton } from "./components/PrimaryButton";
import { SecondaryButton } from "./components/SecondaryButton";
import AddSectionModal from "./components/AddSectionModal";
import { AnimatedAddButton } from "./components/AnimatedAddButton";
import { UserHeader } from "./components/UserHeader";
import { AdminPanel } from "./components/AdminPanel";
import { ImageUploadPage } from "./components/ImageUploadPage";
import { LoginPage } from "./components/LoginPage";
import { RegistrationPage } from "./components/RegistrationPage";
import apiService from "../services/apiService";
import { exportTableToPDF } from "./components/ExportByTable";
import ExportByTableExample from "./components/ExportByTable";
import PrintableTableDemo from "./components/PrintableTableDemo";

interface TableData {
  id: string;
  label: string;
  data: string[][];
  columnHeaders: string[];
  notes: string;
}

interface User {
  email: string;
  username: string;
  role: "admin" | "user";
}

interface UserTableData {
  [userEmail: string]: {
    tables: TableData[];
    activeTableId: string;
  };
}

// activeSection is a dynamic string (section name) or special keys like 'notes','images','admin'

// Store registered users (in real app, this would be in a database)
const registeredUsers: {
  [email: string]: { password: string; role: "admin" | "user" };
} = {
  "user@wordpress.local": { password: "password", role: "user" },
  "admin@wordpress.local": { password: "admin", role: "admin" },
};

function App() {
  // Normalize API responses that may be arrays or wrapped objects
  const normalizeTables = (resp: any): any[] => {
    if (!resp) return [];
    if (Array.isArray(resp)) return resp;
    if (Array.isArray(resp.data)) return resp.data;
    if (Array.isArray(resp.tables)) return resp.tables;
    if (resp.data && Array.isArray(resp.data.data)) return resp.data.data;
    return [];
  };
  // Map internal activeSection codes to server/category display names
  const resolveCategory = (sectionName: string | null) => {
    if (!sectionName) return sectionName;
    if (sectionName === "building1") return "عمارة 1";
    if (sectionName === "building2") return "عمارة 2";
    if (sectionName === "school") return "مدرسة";
    if (sectionName === "notes") return "ملاحظات";
    return sectionName;
  };
  // Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authView, setAuthView] = useState<"login" | "register">("login");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [sections, setSections] = useState<string[]>([]);
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [sectionError, setSectionError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [generalNotes, setGeneralNotes] = useState<string>("");

  // Store tables per user
  const [userTablesData, setUserTablesData] = useState<UserTableData>({
    "user@wordpress.local": {
      tables: [
        {
          id: "table-1",
          label: "جدول 1",
          data: Array(12)
            .fill(null)
            .map(() => Array(20).fill("")),
          columnHeaders: Array(20).fill(""),
          notes: "",
        },
      ],
      activeTableId: "table-1",
    },
    "admin@wordpress.local": {
      tables: [
        {
          id: "table-1",
          label: "جدول 1",
          data: Array(12)
            .fill(null)
            .map(() => Array(20).fill("")),
          columnHeaders: Array(20).fill(""),
          notes: "",
        },
      ],
      activeTableId: "table-1",
    },
  });

  const handleSectionSelect = (sectionName: string) => {
    setActiveSection(sectionName);

    // Load tables for this section name from backend for current user
    const load = async () => {
      if (!currentUser) return;
      const cat = sectionName;
      try {
        const raw = await apiService.getTablesBySection(cat);
        const serverTables = normalizeTables(raw);
        const mapped = serverTables.map((t: any) => ({
          id: String(t.id),
          label: t.label,
          data:
            t.data ||
            Array(12)
              .fill(null)
              .map(() => Array(20).fill("")),
          columnHeaders: t.column_headers || Array(20).fill(""),
          notes: t.notes || "",
          section: t.section || cat,
          lastUpdated: t.last_updated || t.updated_at || null,
        }));

        setUserTablesData((prev) => ({
          ...prev,
          [currentUser.email]: {
            tables: [
              ...(prev[currentUser.email]?.tables?.filter(
                (x: any) => x.section !== cat,
              ) || []),
              ...mapped,
            ],
            activeTableId: mapped.length > 0 ? mapped[0].id : "",
          },
        }));

        // persist last selected section per user in localStorage
        localStorage.setItem(`last_section_${currentUser.email}`, sectionName);
      } catch (e) {
        console.error("Failed to load tables for section", e);
      }
    };

    load();
  };

  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      try {
        const list = await apiService.getSections();
        // Normalize sections response into array of string names
        const normalizedArray: any[] = (() => {
          if (!list) return [];
          if (Array.isArray(list)) return list;
          if (Array.isArray(list.data)) return list.data;
          if (Array.isArray(list.sections)) return list.sections;
          if (Array.isArray(list.items)) return list.items;
          if (typeof list === "object") return Object.values(list);
          return [];
        })();

        const names: string[] = normalizedArray
          .map((it) => {
            if (!it) return "";
            if (typeof it === "string") return it;
            if (typeof it === "object")
              return it.name || it.title || it.label || String(it);
            return String(it);
          })
          .filter((n) => !!n);

        setSections(names);
        const last = localStorage.getItem(`last_section_${currentUser.email}`);
        if (last && names.includes(last)) {
          handleSectionSelect(last);
          return;
        }
        if (names.length > 0) {
          handleSectionSelect(names[0]);
          return;
        }
        handleSectionSelect("notes");
      } catch (error: any) {
        if (error?.response?.status === 422) {
          // Log server validation message for debugging
          // eslint-disable-next-line no-console
          console.error(
            "[App] GET /sections returned 422:",
            error.response.data,
          );
          try {
            setSectionError(
              error.response.data?.message ||
                (typeof error.response.data === "string"
                  ? error.response.data
                  : "خطأ في بيانات الأقسام"),
            );
          } catch (setErr) {
            // ignore
          }
        } else {
          console.error("Failed to load sections", error);
        }
        handleSectionSelect("notes");
      }
    })();
  }, [currentUser]);

  const handleCreateSectionSubmit = async (name: string) => {
    const trimmed = (name || "").trim();
    if (!trimmed) throw new Error("الاسم لا يمكن أن يكون فارغًا");
    const exists = sections.some(
      (x) =>
        x.localeCompare(trimmed, undefined, { sensitivity: "accent" }) === 0,
    );
    if (exists) throw new Error("القسم موجود بالفعل");
    if (!currentUser) throw new Error("يرجى تسجيل الدخول لإنشاء قسم");
    try {
      const res = await apiService.createSection(trimmed);
      const createdName = res.name || trimmed;
      setSections((prev) => [createdName, ...prev]);
      setActiveSection(createdName);
      setShowAddSection(false);
      // clear any previous section error
      setSectionError(null);
      return createdName;
    } catch (err: any) {
      // If server returned validation or duplicate message, surface it
      const serverMessage = err?.message || err?.response?.data?.message;
      // If backend reports the section already exists, refresh sections and select it
      if (
        serverMessage &&
        serverMessage
          .toString()
          .toLowerCase()
          .includes("section already exists")
      ) {
        try {
          const list = await apiService.getSections();
          // normalize list similar to the useEffect logic
          const normalizedArray: any[] = (() => {
            if (!list) return [];
            if (Array.isArray(list)) return list;
            if (Array.isArray(list.data)) return list.data;
            if (Array.isArray(list.sections)) return list.sections;
            if (Array.isArray(list.items)) return list.items;
            if (typeof list === "object") return Object.values(list);
            return [];
          })();
          const names: string[] = normalizedArray
            .map((it) => {
              if (!it) return "";
              if (typeof it === "string") return it;
              if (typeof it === "object")
                return it.name || it.title || it.label || String(it);
              return String(it);
            })
            .filter((n) => !!n);

          setSections(names);
          // try to find a matching name (case-insensitive, trim)
          const match = names.find(
            (n) => n.trim().toLowerCase() === trimmed.toLowerCase(),
          );
          if (match) {
            setActiveSection(match);
            setShowAddSection(false);
            setSectionError(null);
            return match;
          }
        } catch (refreshErr) {
          // ignore refresh errors, fallthrough to surface original message
        }
      }

      if (serverMessage) {
        setSectionError(serverMessage);
        throw new Error(serverMessage);
      }
      // fallback
      setSectionError("فشل إنشاء القسم");
      throw err;
    }
  };

  const getCurrentUserData = () => {
    if (!currentUser) return null;
    const allData = userTablesData[currentUser.email] || {
      tables: [],
      activeTableId: "",
    };
    if (!activeSection) return allData;
    const category = resolveCategory(activeSection); // normalize to server section name
    const tables = allData.tables.filter((t: any) => t.section === category);
    // Preserve the user's stored activeTableId if it belongs to this category,
    // otherwise default to the first table in the category (if any).
    const activeIdExists = tables.some(
      (t: any) => t.id === allData.activeTableId,
    );
    const activeId = activeIdExists
      ? allData.activeTableId
      : tables.length > 0
        ? tables[0].id
        : "";
    return {
      tables: tables.length > 0 ? tables : [],
      activeTableId: activeId,
    };
  };

  const updateCurrentUserData = (
    updater: (
      data: (typeof userTablesData)[string],
    ) => (typeof userTablesData)[string],
  ) => {
    if (!currentUser) return;
    // updater works on the whole user entry, but we need to merge per-category changes
    const before = userTablesData[currentUser.email] || {
      tables: [],
      activeTableId: "",
    };
    const updated = updater(before);
    setUserTablesData({
      ...userTablesData,
      [currentUser.email]: updated,
    });
  };

  const handleAddTable = () => {
    const userData = getCurrentUserData();
    if (!userData || !currentUser || !activeSection) return;

    if (userData.tables.length < 3) {
      const category = resolveCategory(activeSection);

      // Special handling for general notes section
      if (activeSection === "notes") {
        const notesCategory = "ملاحظات";
        const noteTable = userData.tables.find(
          (t: any) => t.section === notesCategory,
        );
        const payload = [
          {
            id:
              noteTable && !noteTable.id.startsWith("table-")
                ? Number(noteTable.id)
                : undefined,
            label: noteTable?.label || "ملاحظات عامة",
            notes: generalNotes,
          },
        ];

        (async () => {
          try {
            const res = await apiService.saveAllTables(notesCategory, payload);
            const saved = res.saved || [];
            setUserTablesData((prev) => {
              const prevUser = prev[currentUser.email] || {
                tables: [],
                activeTableId: "",
              };
              const other = prevUser.tables.filter(
                (x: any) => x.section !== notesCategory,
              );
              const mapped = saved.map((s: any) => ({
                id: String(s.id),
                label: s.label,
                data:
                  s.data ||
                  Array(12)
                    .fill(null)
                    .map(() => Array(20).fill("")),
                columnHeaders: s.column_headers || Array(20).fill(""),
                notes: s.notes || "",
                section: s.section || notesCategory,
                lastUpdated: s.last_updated || s.updated_at || null,
              }));
              return {
                ...prev,
                [currentUser.email]: {
                  tables: [...other, ...mapped],
                  activeTableId:
                    mapped.length > 0 ? mapped[0].id : prevUser.activeTableId,
                },
              };
            });
            alert("تم الحفظ التلقائي بنجاح");
          } catch (e) {
            console.error("Auto-save failed", e);
            alert("فشل الحفظ التلقائي");
          }
        })();
        return;
      }

      // non-notes: create a new table on the server and merge
      (async () => {
        try {
          // Name the table as "جدول N" where N is next index for this category
          const existing = userData.tables.filter(
            (t: any) => t.section === category,
          );
          const nextIndex = existing.length + 1;
          const newLabel = `جدول ${nextIndex}`;
          const res = await apiService.createTableInSection(category, newLabel);
          const created = res;
          setUserTablesData((prev) => {
            const prevUser = prev[currentUser.email] || {
              tables: [],
              activeTableId: "",
            };
            const other = prevUser.tables.filter(
              (x: any) => x.section !== category,
            );
            const mapped = [
              ...(created
                ? [
                    {
                      id: String(created.id),
                      label: created.label || newLabel,
                      data:
                        created.data ||
                        Array(12)
                          .fill(null)
                          .map(() => Array(20).fill("")),
                      columnHeaders:
                        created.column_headers || Array(20).fill(""),
                      notes: created.notes || "",
                      section: created.section || category,
                      lastUpdated:
                        created.last_updated || created.updated_at || null,
                    },
                  ]
                : []),
            ];
            return {
              ...prev,
              [currentUser.email]: {
                tables: [
                  ...other,
                  ...prevUser.tables.filter((x: any) => x.section === category),
                  ...mapped,
                ],
                activeTableId:
                  mapped.length > 0 ? mapped[0].id : prevUser.activeTableId,
              },
            };
          });
        } catch (e) {
          console.error("Failed to create table", e);
        }
      })();
    }
  };

  const setActiveTableId = (tableId: string) => {
    updateCurrentUserData((data) => ({
      ...data,
      activeTableId: tableId,
    }));
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch (e) {
      console.error("Logout failed", e);
    }
    setCurrentUser(null);
  };

  // Remove a table locally and on server
  const handleRemoveTable = async (tableId: string) => {
    if (!currentUser) return;
    const email = currentUser.email;
    setUserTablesData((prev) => {
      const prevUser = prev[email] || { tables: [], activeTableId: "" };
      const tables = prevUser.tables.filter((t: any) => t.id !== tableId);
      const activeTableId =
        prevUser.activeTableId === tableId
          ? tables[0]?.id || ""
          : prevUser.activeTableId;
      return {
        ...prev,
        [email]: { ...prevUser, tables, activeTableId },
      };
    });

    // If this is a persisted table (numeric id), delete on server
    if (!tableId.startsWith("table-")) {
      try {
        await apiService.deleteTable(Number(tableId));
      } catch (e) {
        console.error("Failed to delete table on server", e);
      }
    }
  };

  // Cell data change
  const handleDataChange = (
    rowIndex: number,
    colIndex: number,
    value: string,
  ) => {
    updateCurrentUserData((data) => {
      const tables = data.tables.map((t: any) => {
        if (t.id !== data.activeTableId) return t;
        const newData = t.data.map((row: string[], rIdx: number) =>
          rIdx === rowIndex
            ? row.map((cell, cIdx) => (cIdx === colIndex ? value : cell))
            : row.slice(),
        );
        return { ...t, data: newData };
      });
      return { ...data, tables };
    });
  };

  // Column header change
  const handleColumnHeaderChange = (colIndex: number, value: string) => {
    updateCurrentUserData((data) => {
      const tables = data.tables.map((t: any) => {
        if (t.id !== data.activeTableId) return t;
        const newHeaders = (t.columnHeaders || []).map(
          (h: string, i: number) => (i === colIndex ? value : h),
        );
        return { ...t, columnHeaders: newHeaders };
      });
      return { ...data, tables };
    });
  };

  // Notes change
  const handleNotesChange = (value: string) => {
    updateCurrentUserData((data) => {
      const tables = data.tables.map((t: any) =>
        t.id !== data.activeTableId ? t : { ...t, notes: value },
      );
      return { ...data, tables };
    });
    setGeneralNotes(value);
  };

  // Export current table to PDF
  const handleExportPDF = async () => {
    if (!activeTable || !currentUser || !activeSection) return;

    // If table is temporary (client-only id like "table-1"), auto-save first
    if (activeTable.id.startsWith("table-")) {
      try {
        await handleAutoSave();
      } catch (e) {
        console.error("Auto-save before export failed", e);
        alert("يرجى حفظ الجدول قبل التصدير");
        return;
      }

      // refresh local reference to activeTable (should have server id now)
      const refreshed = getCurrentUserData();
      const newActive = refreshed?.tables.find(
        (t: any) => t.label === activeTable.label,
      );
      if (!newActive || !newActive.id || newActive.id.startsWith("table-")) {
        alert(
          "تعذر الحصول على معرف الجدول بعد الحفظ. حاول التحديث ثم التصدير.",
        );
        return;
      }
      try {
        await apiService.exportTableToPdf(Number(newActive.id));
      } catch (e) {
        console.error("Export failed", e);
        alert("فشل التصدير إلى PDF");
      }
      return;
    }

    try {
      await apiService.exportTableToPdf(Number(activeTable.id));
    } catch (e) {
      console.error("Export failed", e);
      alert("فشل التصدير إلى PDF");
    }
  };

  // Auto-save current section (tables or general notes)
  const handleAutoSave = async () => {
    if (!currentUser || !activeSection) return;
    const cat = resolveCategory(activeSection);

    if (activeSection === "notes") {
      const payload = [
        {
          id:
            activeTable && !activeTable.id.startsWith("table-")
              ? Number(activeTable.id)
              : undefined,
          label: activeTable?.label || "ملاحظات عامة",
          notes: generalNotes,
        },
      ];
      try {
        const res = await apiService.saveAllTables(cat, payload);
        const saved = res.saved || [];
        setUserTablesData((prev) => {
          const prevUser = prev[currentUser.email] || {
            tables: [],
            activeTableId: "",
          };
          const other = prevUser.tables.filter((x: any) => x.section !== cat);
          const mapped = saved.map((s: any) => ({
            id: String(s.id),
            label: s.label,
            data:
              s.data ||
              Array(12)
                .fill(null)
                .map(() => Array(20).fill("")),
            columnHeaders: s.column_headers || Array(20).fill(""),
            notes: s.notes || "",
            section: s.section || cat,
            lastUpdated: s.last_updated || s.updated_at || null,
          }));
          return {
            ...prev,
            [currentUser.email]: {
              tables: [...other, ...mapped],
              activeTableId:
                mapped.length > 0 ? mapped[0].id : prevUser.activeTableId,
            },
          };
        });
        alert("تم الحفظ التلقائي بنجاح");
      } catch (e) {
        console.error("Auto-save failed", e);
        alert("فشل الحفظ التلقائي");
      }
      return;
    }

    // Non-notes: save all tables in this section
    const email = currentUser.email;
    const allForUser = userTablesData[email] || {
      tables: [],
      activeTableId: "",
    };
    const tablesToSave = allForUser.tables.filter(
      (t: any) => t.section === cat,
    );
    const payload = tablesToSave.map((t: any) => ({
      id: t.id && !t.id.startsWith("table-") ? Number(t.id) : undefined,
      label: t.label,
      data: t.data,
      column_headers: t.columnHeaders,
      notes: t.notes || "",
    }));

    try {
      const res = await apiService.saveAllTables(cat, payload);
      const saved = res.saved || [];
      setUserTablesData((prev) => {
        const prevUser = prev[email] || { tables: [], activeTableId: "" };
        const other = prevUser.tables.filter((x: any) => x.section !== cat);
        const mapped = saved.map((s: any) => ({
          id: String(s.id),
          label: s.label,
          data:
            s.data ||
            Array(12)
              .fill(null)
              .map(() => Array(20).fill("")),
          columnHeaders: s.column_headers || Array(20).fill(""),
          notes: s.notes || "",
          section: s.section || cat,
          lastUpdated: s.last_updated || s.updated_at || null,
        }));
        return {
          ...prev,
          [email]: {
            tables: [...other, ...mapped],
            activeTableId:
              mapped.length > 0 ? mapped[0].id : prevUser.activeTableId,
          },
        };
      });
      alert("تم الحفظ التلقائي بنجاح");
    } catch (e) {
      console.error("Auto-save failed", e);
      alert("فشل الحفظ التلقائي");
    }
  };

  // Get all users for admin panel
  const getAllUsersData = () => {
    return Object.entries(userTablesData).map(([email, data]) => ({
      email,
      username: email.split("@")[0],
      tableCount: data.tables.length,
      lastActive: "اليوم", // Mock data
    }));
  };

  // Registration handler (top-level)
  const handleRegister = async (
    name: string,
    username: string,
    email: string,
    password: string,
    passwordConfirmation: string,
  ) => {
    try {
      setIsLoading(true);
      setRegisterSuccess(null);
      setRegisterError(null);
      // Call backend API to register
      const response = await apiService.register(
        name,
        username,
        email,
        password,
        passwordConfirmation,
      );
      setCurrentUser({
        email: response.user.email,
        username: response.user.username,
        role: response.user.role,
      });

      // initialize empty server-backed tables list for new user
      setUserTablesData({
        ...userTablesData,
        [email]: { tables: [], activeTableId: "" },
      });

      // Set success message
      setRegisterSuccess("تم إنشاء الحساب بنجاح! 🎉");

      // Delay to show success message, then switch to main app
      setTimeout(() => {
        setAuthError(null);
      }, 2000);
    } catch (error: any) {
      const status = error.response?.status;
      const responseData = error.response?.data;
      const message = responseData?.message;
      const errors = responseData?.errors;

      // Provide specific error messages based on backend response
      if (status === 422 && errors) {
        // Get the first error message from the validation errors
        const errorKeys = Object.keys(errors);
        if (errorKeys.length > 0) {
          const firstErrorKey = errorKeys[0];
          const errorMessage = errors[firstErrorKey][0];
          setRegisterError(errorMessage);
        } else {
          setRegisterError(
            message || "بيانات غير صحيحة. يرجى التحقق من المدخلات",
          );
        }
      } else if (status === 409 || message?.includes("unique")) {
        setRegisterError("هذا البريد الإلكتروني مسجل بالفعل في النظام");
      } else if (status === 422) {
        setRegisterError(
          message || "بيانات غير صحيحة. يرجى التحقق من المدخلات",
        );
      } else if (status === 500) {
        setRegisterError("حدث خطأ في الخادم. يرجى المحاولة لاحقاً");
      } else {
        setRegisterError(message || "فشل التسجيل. حاول مرة أخرى");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Authentication handlers
  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const response = await apiService.login(email, password);
      const user = {
        email: response.user.email,
        username: response.user.username,
        role: response.user.role,
      };
      setCurrentUser(user);

      // Fetch user's tables from backend
      const rawAll = await apiService.getTables();
      const serverTables = normalizeTables(rawAll);
      const mapped = serverTables.map((t: any) => ({
        id: String(t.id),
        label: t.label,
        data:
          t.data ||
          Array(12)
            .fill(null)
            .map(() => Array(20).fill("")),
        columnHeaders: t.column_headers || Array(20).fill(""),
        notes: t.notes || "",
        section: t.section || "",
        lastUpdated: t.last_updated || t.updated_at || null,
      }));

      setUserTablesData((prev) => ({
        ...prev,
        [email]: {
          tables: mapped,
          activeTableId: mapped.length > 0 ? mapped[0].id : "",
        },
      }));

      // restore last selected section from localStorage for this user
      const last = localStorage.getItem(`last_section_${email}`) as
        | string
        | null;

      // determine which section to load now: last (if any) or derive from first table
      let selectedSection: string | null = null;
      if (last) selectedSection = last;
      else if (mapped.length > 0) {
        const firstSection = mapped[0].section;
        if (firstSection === "عمارة 1") selectedSection = "building1";
        else if (firstSection === "عمارة 2") selectedSection = "building2";
        else if (firstSection === "مدرسة") selectedSection = "school";
      }

      if (selectedSection) {
        setActiveSection(selectedSection);
        const cat =
          selectedSection === "notes"
            ? "ملاحظات"
            : selectedSection === "building1"
              ? "عمارة 1"
              : selectedSection === "building2"
                ? "عمارة 2"
                : "مدرسة";

        if (selectedSection === "notes") {
          const rawNotes = await apiService.getTablesBySection("ملاحظات");
          const serverNotes = normalizeTables(rawNotes);
          if (serverNotes && serverNotes.length > 0) {
            setGeneralNotes(serverNotes[0].notes || "");
            setUserTablesData((prev) => ({
              ...prev,
              [email]: {
                tables: [
                  ...(prev[email]?.tables?.filter(
                    (x: any) => x.section !== "ملاحظات",
                  ) || []),
                  ...serverNotes.map((t: any) => ({
                    id: String(t.id),
                    label: t.label,
                    data:
                      t.data ||
                      Array(12)
                        .fill(null)
                        .map(() => Array(20).fill("")),
                    columnHeaders: t.column_headers || Array(20).fill(""),
                    notes: t.notes || "",
                    section: t.section || "ملاحظات",
                    lastUpdated: t.last_updated || t.updated_at || null,
                  })),
                ],
                activeTableId:
                  serverNotes.length > 0 ? String(serverNotes[0].id) : "",
              },
            }));
          }
        } else {
          const rawSection = await apiService.getTablesBySection(cat);
          const serverTablesBySection = normalizeTables(rawSection);
          const mappedSection = serverTablesBySection.map((t: any) => ({
            id: String(t.id),
            label: t.label,
            data:
              t.data ||
              Array(12)
                .fill(null)
                .map(() => Array(20).fill("")),
            columnHeaders: t.column_headers || Array(20).fill(""),
            notes: t.notes || "",
            section: t.section || cat,
            lastUpdated: t.last_updated || t.updated_at || null,
          }));

          setUserTablesData((prev) => ({
            ...prev,
            [email]: {
              tables: [
                ...(prev[email]?.tables?.filter(
                  (x: any) => x.section !== cat,
                ) || []),
                ...mappedSection,
              ],
              activeTableId:
                mappedSection.length > 0
                  ? mappedSection[0].id
                  : prev[email]?.activeTableId || "",
            },
          }));
        }
      }
    } catch (error: any) {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 401 || message === "Invalid credentials") {
        setAuthError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      } else if (status === 404 || message === "User not found") {
        setAuthError("البريد الإلكتروني غير موجود. يرجى التسجيل أولاً");
      } else {
        setAuthError(message || "فشل تسجيل الدخول");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show login/registration pages if not logged in
  if (!currentUser) {
    if (authView === "login") {
      return (
        <LoginPage
          onLogin={handleLogin}
          onSwitchToRegister={() => {
            setAuthView("register");
            setAuthError(null);
          }}
          error={authError}
          onErrorDismiss={() => setAuthError(null)}
        />
      );
    } else {
      return (
        <RegistrationPage
          onRegister={handleRegister}
          onSwitchToLogin={() => {
            setAuthView("login");
            setRegisterSuccess(null);
            setRegisterError(null);
          }}
          success={registerSuccess}
          onSuccessDismiss={() => setRegisterSuccess(null)}
          backendError={registerError}
          onBackendErrorDismiss={() => setRegisterError(null)}
        />
      );
    }
  }

  const userData = getCurrentUserData();
  if (!userData) return null;

  const activeTable = userData.tables.find(
    (t) => t.id === userData.activeTableId,
  );

  // Get table title based on active section
  const getTableTitle = () => {
    switch (activeSection) {
      case "building1":
        return "عمارة 1";
      case "building2":
        return "عمارة 2";
      case "school":
        return "مدرسة";
      default:
        return "";
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: "Cairo, sans-serif" }}
    >
      {/* User Header */}
      <UserHeader
        user={currentUser}
        onLogout={handleLogout}
        isLoading={isLoading}
      />

      <div className="max-w-[1600px] mx-auto p-8" dir="rtl">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="mb-2"
            style={{
              fontSize: "var(--font-size-lg)",
              fontWeight: 600,
              color: "var(--text-dark)",
            }}
          >
            إدارة جداول الفحص الديناميكية
          </h1>
          <p
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--text-medium)",
            }}
          >
            نظام إدارة الفحوصات والتقارير الهندسية
          </p>
        </div>

        {/* Top Selection Section */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
          <h2
            className="mb-4"
            style={{
              fontSize: "var(--font-size-md)",
              fontWeight: 600,
              color: "var(--text-dark)",
            }}
          >
            اختر القسم
          </h2>
          <div className="flex gap-4 flex-wrap">
            {/* Dynamic sections loaded from API */}
            {sections.map((s) => (
              <TopSelectionButton
                key={s}
                isActive={activeSection === s}
                onClick={() => handleSectionSelect(s)}
              >
                {s}
              </TopSelectionButton>
            ))}

            {/* Special buttons */}
            <TopSelectionButton
              isActive={activeSection === "notes"}
              onClick={() => handleSectionSelect("notes")}
            >
              ملاحظات
            </TopSelectionButton>
            <TopSelectionButton
              isActive={activeSection === "images"}
              onClick={() => handleSectionSelect("images")}
            >
              📷 الصور
            </TopSelectionButton>
            {currentUser?.role === "admin" && (
              <TopSelectionButton
                isActive={activeSection === "admin"}
                onClick={() => handleSectionSelect("admin")}
              >
                ⚙️ الإدارة
              </TopSelectionButton>
            )}

            {/* Add section button */}
            <TopSelectionButton
              onClick={() => {
                setShowAddSection(true);
                setNewSectionName("");
                setSectionError(null);
              }}
            >
              إضافة قسم جديد
            </TopSelectionButton>
          </div>

          <AddSectionModal
            open={showAddSection}
            onClose={() => setShowAddSection(false)}
            onCreate={handleCreateSectionSubmit}
            existing={sections}
          />
        </div>

        {/* Admin Panel */}
        {activeSection === "admin" && currentUser?.role === "admin" && (
          <AdminPanel users={getAllUsersData()} />
        )}

        {/* Image Upload Page */}
        {activeSection === "images" && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <ImageUploadPage />
          </div>
        )}

        {/* Main Content - Only show when section is selected */}
        {activeSection &&
          activeSection !== "notes" &&
          activeSection !== "images" &&
          activeSection !== "admin" && (
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              {/* Tabs for multiple tables */}
              <InspectionTabs
                tabs={userData.tables}
                activeTab={userData.activeTableId}
                onTabChange={setActiveTableId}
                onRemoveTab={handleRemoveTable}
                canRemove={userData.tables.length > 1}
              />

              {/* Table Title - Centered and Prominent */}
              <div className="text-center mb-6">
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "var(--text-dark)",
                  }}
                >
                  {getTableTitle()}
                </h2>
              </div>

              {/* Table Section */}
              <div className="mb-6">
                {activeTable && (
                  <div
                    id={`export-table-${activeTable.id}`}
                    data-name={activeTable.label}
                    data-table-json={JSON.stringify({
                      headers: activeTable.columnHeaders || [],
                      data: activeTable.data || [],
                      name: activeTable.label || "",
                    })}
                    dir="rtl"
                  >
                    <TableContainer
                      rows={12}
                      columns={20}
                      data={activeTable.data}
                      columnHeaders={activeTable.columnHeaders}
                      onDataChange={handleDataChange}
                      onColumnHeaderChange={handleColumnHeaderChange}
                    />
                  </div>
                )}
              </div>

              {/* Add Table Button */}
              {userData.tables.length < 3 && (
                <div className="mb-6">
                  <AnimatedAddButton onClick={handleAddTable}>
                    إضافة جدول
                  </AnimatedAddButton>
                </div>
              )}

              {/* Notes Section */}
              <div className="mb-6">
                {activeTable && (
                  <NotesTextarea
                    value={activeTable.notes}
                    onChange={handleNotesChange}
                  />
                )}
              </div>

              {/* Actions Section */}
              <div className="flex gap-4 justify-start border-t border-[var(--light-gray)] pt-6">
                <PrimaryButton
                  onClick={() => {
                    if (!activeTable) return;
                    exportTableToPDF(`export-table-${activeTable.id}`);
                  }}
                >
                  تصدير إلى PDF
                </PrimaryButton>
                <SecondaryButton onClick={handleAutoSave}>
                  حفظ تلقائي
                </SecondaryButton>
              </div>
            </div>
          )}

        {/* Notes-only Section */}
        {activeSection === "notes" && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3
              className="mb-4"
              style={{
                fontSize: "var(--font-size-md)",
                fontWeight: 600,
                color: "var(--text-dark)",
              }}
            >
              ملاحظات عامة
            </h3>
            <NotesTextarea
              value={generalNotes}
              onChange={(v) => setGeneralNotes(v)}
              placeholder="أدخل الملاحظات العامة هنا..."
            />
            <div className="mt-6">
              <SecondaryButton onClick={handleAutoSave}>
                حفظ الملاحظات
              </SecondaryButton>
            </div>
          </div>
        )}

        {/* Initial State Message */}
        {!activeSection && (
          <div className="bg-white p-12 rounded-lg shadow-sm text-center">
            <p
              style={{
                fontSize: "var(--font-size-lg)",
                color: "var(--text-medium)",
              }}
            >
              الرجاء اختيار قسم من الأعلى للبدء
            </p>
          </div>
        )}
        {/* Example exporter (shows when no section selected) */}
        {!activeSection && (
          <div className="mt-6">
            <ExportByTableExample />
          </div>
        )}
        {/* Printable table demo */}
        {!activeSection && (
          <div className="mt-6">
            <PrintableTableDemo />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
