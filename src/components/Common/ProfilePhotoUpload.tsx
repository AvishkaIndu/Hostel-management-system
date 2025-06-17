import React, { useState, useRef } from 'react';
import { Camera, Upload, X, User } from 'lucide-react';

interface ProfilePhotoUploadProps {
  currentPhoto?: string;
  onPhotoChange: (photo: string | null) => void;
  size?: 'sm' | 'md' | 'lg';
}

const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
  currentPhoto,
  onPhotoChange,
  size = 'md'
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onPhotoChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPhotoChange(null);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <div
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden cursor-pointer group border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
        }`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        {currentPhoto ? (
          <>
            <img
              src={currentPhoto}
              alt="Profile"
              className="w-full h-full object-cover"
            />
            {isHovering && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <Camera className={`${iconSizes[size]} text-white`} />
              </div>
            )}
            {currentPhoto && (
              <button
                onClick={removePhoto}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex flex-col items-center justify-center">
            {isDragging ? (
              <Upload className={`${iconSizes[size]} text-blue-500 mb-1`} />
            ) : (
              <User className={`${iconSizes[size]} text-gray-400 mb-1`} />
            )}
            {size !== 'sm' && (
              <span className="text-xs text-gray-500 dark:text-gray-400 text-center px-2">
                {isDragging ? 'Drop here' : 'Add photo'}
              </span>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />

      {size !== 'sm' && (
        <div className="text-center">
          <button
            onClick={openFileDialog}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {currentPhoto ? 'Change photo' : 'Upload photo'}
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            JPG, PNG up to 5MB
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfilePhotoUpload;
