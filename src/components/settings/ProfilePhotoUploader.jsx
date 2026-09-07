import React, { useRef, useState } from 'react';
import { Camera, Upload, Trash2, User, AlertCircle, Check } from 'lucide-react';
import Button from '../ui/Button';

/**
 * ProfilePhotoUploader
 * Accessible image uploader with client-side compression (max 400x400 WebP/JPEG)
 * File type validation, size limit (<2MB), preview, replace, and clear.
 */
export const ProfilePhotoUploader = ({
  currentPhotoURL = null,
  onPhotoChange,
  disabled = false,
  label = 'Profile Photo',
  size = 'md', // 'sm' | 'md' | 'lg'
}) => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(currentPhotoURL);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const dimensionClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  }[size] || 'w-24 h-24';

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target.result;
      };

      reader.onerror = (err) => reject(err);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to WebP or JPEG
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(compressedDataUrl);
      };

      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // 1. Validation: Allowed file types
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please choose a valid image file (JPEG, PNG, or WebP).');
      return;
    }

    // 2. Validation: Max file size (2 MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Selected image exceeds 2MB limit. Please choose a smaller file.');
      return;
    }

    try {
      setProcessing(true);
      const optimizedDataUrl = await compressImage(file);
      setPreview(optimizedDataUrl);
      if (onPhotoChange) {
        onPhotoChange(optimizedDataUrl);
      }
    } catch (err) {
      setError('Could not process image. Please try another file.');
    } finally {
      setProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    if (onPhotoChange) {
      onPhotoChange(null);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-bold text-brand-navy">
        {label}
      </label>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Avatar Preview Display */}
        <div className="relative group">
          <div className={`${dimensionClasses} rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 bg-slate-100 flex items-center justify-center shadow-inner`}>
            {preview ? (
              <img
                src={preview}
                alt="Profile Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-slate-400" />
            )}
          </div>

          {/* Quick Overlay Change Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || processing}
            className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-semibold"
            aria-label="Upload new photo"
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="space-y-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Upload}
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || processing}
              loading={processing}
            >
              {preview ? 'Change Photo' : 'Upload Photo'}
            </Button>

            {preview && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                icon={Trash2}
                onClick={handleRemove}
                disabled={disabled || processing}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              >
                Remove
              </Button>
            )}
          </div>

          <p className="text-[11px] text-brand-slate">
            Recommended square ratio. Max 2MB (JPEG, PNG, WebP).
          </p>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || processing}
      />

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default ProfilePhotoUploader;
