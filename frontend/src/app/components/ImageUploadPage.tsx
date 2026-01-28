import React, { useState } from 'react';
import { PrimaryButton } from './PrimaryButton';

interface ImageUploadPageProps {
  onImageUpload?: (file: File) => void;
}

export function ImageUploadPage({ onImageUpload }: ImageUploadPageProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      if (onImageUpload) {
        onImageUpload(file);
      }
    }
  };

  const handleButtonClick = () => {
    document.getElementById('image-upload-input')?.click();
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
  };

  return (
    <div className="w-full">
      <h3 className="mb-6" style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, color: 'var(--text-dark)' }}>
        تحميل الصور والمستندات
      </h3>

      {/* Upload Area */}
      <div className="border-2 border-dashed border-[var(--light-gray)] rounded-lg p-12 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
        {uploadedImage ? (
          <div className="space-y-4">
            <img 
              src={uploadedImage} 
              alt="Uploaded preview" 
              className="max-w-full max-h-96 mx-auto rounded-lg shadow-md"
            />
            <div className="flex gap-4 justify-center">
              <PrimaryButton onClick={handleButtonClick}>
                تغيير الصورة
              </PrimaryButton>
              <button
                onClick={handleRemoveImage}
                className="px-6 py-3 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                style={{ fontSize: 'var(--font-size-md)' }}
              >
                حذف الصورة
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-gray-400">
              <svg
                className="mx-auto h-24 w-24"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="mb-2" style={{ fontSize: 'var(--font-size-lg)', color: 'var(--text-dark)' }}>
                لا توجد صورة محملة
              </p>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-medium)' }}>
                قم بتحميل صورة للفحص أو مستند مرجعي
              </p>
            </div>
            <PrimaryButton onClick={handleButtonClick}>
              ➕ إضافة صورة
            </PrimaryButton>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        id="image-upload-input"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-medium)' }}>
          💡 يمكنك تحميل صور الفحص، المخططات الهندسية، أو أي مستندات مرجعية ذات صلة
        </p>
      </div>
    </div>
  );
}
