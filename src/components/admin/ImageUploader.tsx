import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Link as LinkIcon, Loader2, X, CheckCircle } from 'lucide-react';
import { uploadCMSImageToFirebaseStorage } from '../../services/firebaseService';

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folderName?: string;
  placeholder?: string;
  helpText?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  value,
  onChange,
  folderName = 'cms_assets',
  placeholder = 'https://images.unsplash.com/... or upload file',
  helpText,
}) => {
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState<'url' | 'file'>('url');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadSuccess(false);

    try {
      const downloadUrl = await uploadCMSImageToFirebaseStorage(file, folderName);
      onChange(downloadUrl);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to upload image:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2 font-mono text-xs">
      <div className="flex items-center justify-between">
        <label className="text-neutral-400 font-bold uppercase tracking-wider">{label}</label>
        <div className="flex items-center gap-2 bg-neutral-950 p-1 border border-neutral-800 text-[10px]">
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2 py-0.5 uppercase transition-colors ${
              mode === 'url' ? 'bg-[#00e65c] text-black font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            URL LINK
          </button>
          <button
            type="button"
            onClick={() => setMode('file')}
            className={`px-2 py-0.5 uppercase transition-colors ${
              mode === 'file' ? 'bg-[#00e65c] text-black font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            FILE UPLOAD
          </button>
        </div>
      </div>

      {mode === 'url' ? (
        <div className="relative flex items-center">
          <LinkIcon size={14} className="absolute left-3 text-neutral-500" />
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-neutral-950 border border-neutral-800 text-white p-2.5 pl-9 text-xs focus:outline-none focus:border-[#00e65c]"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute right-2 text-neutral-500 hover:text-white p-1"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ) : (
        <div className="relative">
          <label className="flex flex-col items-center justify-center p-4 border border-dashed border-neutral-800 hover:border-[#00e65c] bg-neutral-950 cursor-pointer transition-colors text-center">
            {uploading ? (
              <div className="flex items-center gap-2 text-[#00e65c]">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-xs font-bold">UPLOADING TO FIREBASE STORAGE...</span>
              </div>
            ) : uploadSuccess ? (
              <div className="flex items-center gap-2 text-[#00e65c]">
                <CheckCircle size={18} />
                <span className="text-xs font-bold">UPLOAD SUCCESSFUL!</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-neutral-400 hover:text-white">
                <Upload size={16} className="text-[#00e65c]" />
                <span className="text-xs">CLICK TO UPLOAD IMAGE TO FIREBASE STORAGE</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      )}

      {helpText && <p className="text-[10px] text-neutral-500">{helpText}</p>}

      {/* PREVIEW THUMBNAIL */}
      {value && (
        <div className="flex items-center gap-3 pt-2">
          <div className="relative w-16 h-16 bg-neutral-950 border border-neutral-800 overflow-hidden shrink-0">
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-neutral-400 truncate">{value}</p>
            <span className="text-[9px] text-[#00e65c] uppercase font-bold">IMAGE READY</span>
          </div>
        </div>
      )}
    </div>
  );
};
