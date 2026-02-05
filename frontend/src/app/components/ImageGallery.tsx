import React, { useState, useEffect, useRef } from "react";
import apiService from "../../services/apiService";

interface Image {
  id: number;
  original_name: string;
  url: string;
  description?: string;
  created_at: string;
  size: number;
}

export function ImageGallery() {
  const [images, setImages] = useState<Image[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [blobUrls, setBlobUrls] = useState<{ [key: number]: string }>({});
  const blobUrlsRef = useRef(blobUrls);
  const loadingIdsRef = useRef<Set<number>>(new Set());

  blobUrlsRef.current = blobUrls;

  useEffect(() => {
    loadImages();
  }, []);

  useEffect(() => {
    images.forEach((image) => {
      if (blobUrlsRef.current[image.id]) return;
      if (loadingIdsRef.current.has(image.id)) return;
      loadingIdsRef.current.add(image.id);
      getDisplayUrl(image.id);
    });
  }, [images]);

  useEffect(() => {
    return () => {
      Object.values(blobUrlsRef.current).forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  const getDisplayUrl = async (imageId: number): Promise<string> => {
    if (blobUrlsRef.current[imageId]) {
      return blobUrlsRef.current[imageId];
    }

    try {
      const response = await apiService["api"].get(`/images/${imageId}/file`, {
        responseType: "blob",
      });

      const blob = response.data;
      const blobUrl = URL.createObjectURL(blob);

      setBlobUrls((prev) => {
        const next = { ...prev, [imageId]: blobUrl };
        loadingIdsRef.current.delete(imageId);
        return next;
      });

      return blobUrl;
    } catch (error) {
      console.error("[ImageGallery] Error fetching image:", error);
      loadingIdsRef.current.delete(imageId);
      return "";
    }
  };

  const loadImages = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getImages();
      console.log("[ImageGallery] API Response:", response);
      let imageList: Image[] = [];

      if (Array.isArray(response)) {
        imageList = response;
      } else if (response?.data && Array.isArray(response.data)) {
        imageList = response.data;
      } else if (response?.success && Array.isArray(response.data)) {
        imageList = response.data;
      }

      console.log("[ImageGallery] Parsed images:", imageList);
      setImages(Array.isArray(imageList) ? imageList : []);
    } catch (error) {
      console.error("Failed to load images:", error);
      setImages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("الرجاء اختيار صورة صحيحة");
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadSuccess(null);

      await apiService.uploadImage(file);
      setUploadSuccess("تم تحميل الصورة بنجاح");
      event.target.value = "";
      await loadImages();

      // Clear success message after 3 seconds
      setTimeout(() => setUploadSuccess(null), 3000);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "فشل في تحميل الصورة";
      setUploadError(errorMsg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (id: number) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه الصورة؟")) {
      return;
    }

    try {
      setIsDeleting(id);
      await apiService.deleteImage(id);
      setImages((prev) => prev.filter((img) => img.id !== id));
      if (selectedImage?.id === id) {
        setSelectedImage(null);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "فشل في حذف الصورة";
      setUploadError(errorMsg);
    } finally {
      setIsDeleting(null);
    }
  };

  const formatFileSize = (bytes: number | undefined): string => {
    if (bytes == null || Number.isNaN(Number(bytes))) return "—";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.max(0, Math.min(2, Math.floor(Math.log(bytes) / Math.log(k))));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string | undefined): string => {
    if (dateString == null || dateString === "") return "—";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full space-y-6" dir="rtl">
      {/* Upload Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2
          className="text-lg font-bold mb-4"
          style={{ color: "var(--text-dark)" }}
        >
          تحميل صور جديدة
        </h2>

        {/* Upload Area */}
        <label className="block border-2 border-dashed border-[var(--light-gray)] rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
          <div className="space-y-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <div>
              <p
                className="font-semibold"
                style={{ color: "var(--text-dark)" }}
              >
                اضغط لاختيار صورة أو اسحب وأفلت
              </p>
              <p
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-medium)",
                }}
              >
                PNG, JPG, GIF حتى 10 MB
              </p>
            </div>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
        </label>

        {/* Messages */}
        {uploadSuccess && (
          <div className="mt-4 p-3 bg-green-100 text-green-800 rounded">
            ✅ {uploadSuccess}
          </div>
        )}
        {uploadError && (
          <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">
            ❌ {uploadError}
          </div>
        )}
      </div>

      {/* Gallery Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2
          className="text-lg font-bold mb-4"
          style={{ color: "var(--text-dark)" }}
        >
          معرض الصور ({images.length})
        </h2>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-blue)] mx-auto"></div>
            <p className="mt-2 text-sm" style={{ color: "var(--text-medium)" }}>
              جاري تحميل الصور...
            </p>
          </div>
        ) : images.length === 0 ? (
          <p
            className="text-center py-8"
            style={{ color: "var(--text-medium)" }}
          >
            لا توجد صور محملة بعد
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="border border-[var(--light-gray)] rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedImage(image)}
              >
                {/* Image Thumbnail */}
                <div className="relative bg-gray-100 aspect-square overflow-hidden">
                  {blobUrls[image.id] ? (
                    <img
                      src={blobUrls[image.id]}
                      alt={image.original_name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-blue)]"></div>
                    </div>
                  )}
                </div>

                {/* Image Info */}
                <div className="p-3">
                  <p
                    className="font-semibold text-sm truncate"
                    style={{ color: "var(--text-dark)" }}
                    title={image.original_name}
                  >
                    {image.original_name}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--text-medium)" }}
                  >
                    {formatFileSize(image.size)}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--text-medium)" }}
                  >
                    {formatDate(image.created_at)}
                  </p>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteImage(image.id);
                    }}
                    disabled={isDeleting === image.id}
                    className="mt-3 w-full px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-sm font-semibold disabled:opacity-50"
                  >
                    {isDeleting === image.id ? "جاري الحذف..." : "حذف"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold" style={{ color: "var(--text-dark)" }}>
                {selectedImage.original_name}
              </h3>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              {blobUrls[selectedImage.id] ? (
                <img
                  src={blobUrls[selectedImage.id]}
                  alt={selectedImage.original_name}
                  className="w-full h-auto rounded"
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-blue)] mx-auto mb-2"></div>
                    <p style={{ color: "var(--text-medium)", fontSize: "var(--font-size-sm)" }}>جاري تحميل الصورة...</p>
                  </div>
                </div>
              )}
              <div className="mt-4 space-y-2">
                <p>
                  <span
                    className="font-semibold"
                    style={{ color: "var(--text-dark)" }}
                  >
                    الحجم:
                  </span>
                  <span style={{ color: "var(--text-medium)" }}>
                    {" "}
                    {formatFileSize(selectedImage.size)}
                  </span>
                </p>
                <p>
                  <span
                    className="font-semibold"
                    style={{ color: "var(--text-dark)" }}
                  >
                    التاريخ:
                  </span>
                  <span style={{ color: "var(--text-medium)" }}>
                    {" "}
                    {formatDate(selectedImage.created_at)}
                  </span>
                </p>
                {selectedImage.description && (
                  <p>
                    <span
                      className="font-semibold"
                      style={{ color: "var(--text-dark)" }}
                    >
                      الوصف:
                    </span>
                    <span style={{ color: "var(--text-medium)" }}>
                      {" "}
                      {selectedImage.description}
                    </span>
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  handleDeleteImage(selectedImage.id);
                  setSelectedImage(null);
                }}
                disabled={isDeleting === selectedImage.id}
                className="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting === selectedImage.id
                  ? "جاري الحذف..."
                  : "حذف الصورة"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
