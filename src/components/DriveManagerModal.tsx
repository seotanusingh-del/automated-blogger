import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Folder, 
  Upload, 
  Image as ImageIcon, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  Copy, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Cloud,
  Layers
} from 'lucide-react';
import { 
  DriveFile, 
  listDriveFiles, 
  uploadImageToDrive, 
  getDriveDirectEmbedUrl, 
  parseDriveFolderId,
  TARGET_DRIVE_PROJECT_ID 
} from '../services/drive';

interface DriveManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  authToken?: string | null;
  activePostTitle?: string;
  onSelectImageForActivePost: (imageUrl: string) => void;
  onAutoAssignImagesToQueue?: (imageUrls: string[]) => void;
}

export const DriveManagerModal: React.FC<DriveManagerModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  authToken,
  activePostTitle,
  onSelectImageForActivePost,
  onAutoAssignImagesToQueue
}) => {
  const [folderInput, setFolderInput] = useState<string>(() => {
    return localStorage.getItem('easyflight_drive_folder') || TARGET_DRIVE_PROJECT_ID;
  });
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch images from folder
  const loadFiles = async (folder: string) => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const cleanId = parseDriveFolderId(folder);
      if (authToken) {
        const items = await listDriveFiles(authToken, cleanId);
        setFiles(items);
      }
      localStorage.setItem('easyflight_drive_folder', cleanId);
    } catch (err: any) {
      console.warn('Drive scan note:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadFiles(folderInput);
    }
  }, [isOpen]);

  // Local image upload handler
  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setFeedback(null);
    try {
      if (authToken) {
        const cleanId = parseDriveFolderId(folderInput);
        const uploaded = await uploadImageToDrive(authToken, file, cleanId);
        setFiles(prev => [uploaded, ...prev]);
        const cdnUrl = getDriveDirectEmbedUrl(uploaded.id);
        onSelectImageForActivePost(cdnUrl);
        setSelectedFileId(uploaded.id);
        setFeedback({
          type: 'success',
          message: `Uploaded "${file.name}" to Google Drive successfully!`
        });
      } else {
        const localUrl = URL.createObjectURL(file);
        const mockFile: DriveFile = {
          id: `local-${Date.now()}`,
          name: file.name,
          mimeType: file.type,
          thumbnailLink: localUrl,
          webContentLink: localUrl
        };
        setFiles(prev => [mockFile, ...prev]);
        onSelectImageForActivePost(localUrl);
        setSelectedFileId(mockFile.id);
        setFeedback({
          type: 'success',
          message: `Local image "${file.name}" selected as blog banner!`
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Image upload failed.'
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCopyUrl = (id: string) => {
    const url = getDriveDirectEmbedUrl(id);
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleApplyToActivePost = (fileId: string) => {
    const cdnUrl = getDriveDirectEmbedUrl(fileId);
    onSelectImageForActivePost(cdnUrl);
    setSelectedFileId(fileId);
    setFeedback({
      type: 'success',
      message: 'Drive image applied to current blog post banner!'
    });
  };

  const handleBatchAssign = () => {
    if (files.length === 0 || !onAutoAssignImagesToQueue) return;
    const urls = files.map(f => getDriveDirectEmbedUrl(f.id));
    onAutoAssignImagesToQueue(urls);
    setFeedback({
      type: 'success',
      message: `Assigned ${files.length} Google Drive images across your blog queue!`
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-3xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors ${
          isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                Google Drive &amp; Image Asset Connector
              </h3>
              <p className="text-xs text-slate-400">
                Provide a Google Drive folder URL / ID or upload image files directly for your blog banners
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition ${
              isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-sm">

          {/* Feedback */}
          {feedback && (
            <div
              className={`p-3.5 rounded-xl border flex items-center gap-2 text-xs ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Folder Connection Bar */}
          <div className={`p-4 rounded-xl border space-y-3 ${
            isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold flex items-center gap-1.5">
                <Folder className="w-4 h-4 text-sky-500" />
                <span>Google Drive Folder ID or Folder URL</span>
              </label>
              <button
                onClick={() => {
                  setFolderInput(TARGET_DRIVE_PROJECT_ID);
                  loadFiles(TARGET_DRIVE_PROJECT_ID);
                }}
                className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline font-semibold"
              >
                Reset to Default Folder
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={folderInput}
                onChange={(e) => setFolderInput(e.target.value)}
                placeholder="Paste Drive Folder URL or Folder ID"
                className={`flex-1 p-2.5 text-xs font-mono rounded-lg border outline-none ${
                  isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                }`}
              />
              <button
                onClick={() => loadFiles(folderInput)}
                disabled={isLoading || !authToken}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Scan Folder</span>
              </button>
            </div>

            {/* Upload image to Drive folder */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700/60 text-xs">
              <span className="text-slate-400">Need to add new images to this Drive folder?</span>
              <label className="cursor-pointer px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-1.5 transition shadow">
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? 'Uploading to Drive...' : 'Upload Image to Drive'}</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  disabled={isUploading || !authToken}
                  onChange={handleUploadFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Drive Assets Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-sky-500" />
                <span className="font-bold text-xs">
                  Available Drive Images ({files.length})
                </span>
              </div>

              {files.length > 0 && onAutoAssignImagesToQueue && (
                <button
                  onClick={handleBatchAssign}
                  className="text-xs px-2.5 py-1 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 font-semibold flex items-center gap-1 border border-sky-500/30 transition"
                  title="Assign Drive images sequentially to all generated airline posts in queue"
                >
                  <Layers className="w-3.5 h-3.5" />
                  Auto-Assign to All Posts in Queue
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="text-center py-12 text-xs text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-sky-500" />
                <span>Scanning Google Drive folder...</span>
              </div>
            ) : files.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {files.map((file) => {
                  const cdnUrl = getDriveDirectEmbedUrl(file.id);
                  const isApplied = selectedFileId === file.id;

                  return (
                    <div
                      key={file.id}
                      className={`rounded-xl border overflow-hidden flex flex-col justify-between transition ${
                        isApplied
                          ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-500/5'
                          : isDarkMode
                          ? 'border-slate-800 bg-slate-800/40 hover:border-slate-700'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      {/* Image Preview */}
                      <div className="h-32 bg-slate-950 flex items-center justify-center overflow-hidden relative group">
                        <img
                          src={cdnUrl}
                          alt={file.name}
                          className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            // If direct embed is not publicly shared, fall back to thumbnail
                            if (file.thumbnailLink) {
                              (e.target as HTMLImageElement).src = file.thumbnailLink;
                            }
                          }}
                        />
                        <button
                          onClick={() => handleCopyUrl(file.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-white hover:bg-black text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition flex items-center gap-1"
                          title="Copy Direct Image CDN URL"
                        >
                          {copiedId === file.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>

                      {/* File Info & Action */}
                      <div className="p-3 space-y-2">
                        <div className="text-xs font-semibold truncate" title={file.name}>
                          {file.name}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                          <span>{file.size ? `${Math.round(Number(file.size) / 1024)} KB` : 'Image'}</span>
                          <a
                            href={file.webContentLink || `https://drive.google.com/file/d/${file.id}/view`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sky-500 hover:underline flex items-center gap-0.5"
                          >
                            Drive <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>

                        <button
                          onClick={() => handleApplyToActivePost(file.id)}
                          className={`w-full py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                            isApplied
                              ? 'bg-emerald-600 text-white'
                              : 'bg-sky-600 hover:bg-sky-500 text-white shadow'
                          }`}
                        >
                          {isApplied ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Active Post Image
                            </>
                          ) : (
                            'Use for Current Blog'
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-xl border-slate-300 dark:border-slate-800 space-y-2">
                <ImageIcon className="w-8 h-8 mx-auto text-slate-400" />
                <p>No images found in folder ID <strong>{parseDriveFolderId(folderInput)}</strong>.</p>
                <p className="text-[11px] text-slate-500">
                  Upload an image file using the button above or provide another Drive Folder ID with images.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div
          className={`px-6 py-3 border-t flex items-center justify-between text-xs ${
            isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <span className="text-slate-400">
            Active Blog: <strong className="text-sky-500 truncate max-w-xs">{activePostTitle || 'Current Article'}</strong>
          </span>
          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded-lg border font-semibold transition ${
              isDarkMode
                ? 'bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-200'
                : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
            }`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
