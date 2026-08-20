import React, { useState, useEffect } from 'react';
import { X, HardDrive, Check, Loader2, Upload, Download, Sparkles, AlertCircle } from 'lucide-react';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, getAccessToken, logout, uploadHeadshotToDrive, listDriveImages, DriveFileItem } from '../services/googleDrive';
import { HeadshotItem } from '../types';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentItem?: HeadshotItem;
  onImportImage?: (imageUrl: string, name: string) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  currentItem,
  onImportImage,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [activeTab, setActiveTab] = useState<'save' | 'import'>('save');

  useEffect(() => {
    const unsubscribe = initAuth(
      (u, token) => {
        setUser(u);
        setAccessToken(token);
        setNeedsAuth(false);
        loadDriveFiles(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  const loadDriveFiles = async (token: string) => {
    try {
      setLoadingFiles(true);
      const files = await listDriveImages(token);
      setDriveFiles(files);
    } catch (err: any) {
      console.error('Error loading drive files:', err);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setErrorMsg(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        setNeedsAuth(false);
        loadDriveFiles(result.accessToken);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-in failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleUploadToDrive = async () => {
    if (!currentItem || !accessToken) return;
    setIsUploading(true);
    setErrorMsg(null);
    setUploadSuccess(null);
    try {
      const fileName = `Headshot-${currentItem.styleName.replace(/\s+/g, '-')}-${Date.now()}.jpg`;
      const result = await uploadHeadshotToDrive(accessToken, currentItem.headshotUrl, fileName);
      setUploadSuccess(`Successfully saved "${fileName}" to Google Drive!`);
      loadDriveFiles(accessToken);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload image to Google Drive');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto backdrop-blur-md bg-black/80 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-stone-800 bg-stone-950 shadow-2xl my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 bg-stone-900/90 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-100 flex items-center gap-2">
                <span>Google Drive Integration</span>
                <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300 border border-blue-500/30">
                  Cloud Sync
                </span>
              </h3>
              <p className="text-xs text-stone-400">
                Save studio portraits to Google Drive or import reference photos directly
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-stone-400 hover:bg-stone-800 hover:text-stone-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {needsAuth ? (
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <HardDrive className="h-8 w-8" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h4 className="text-base font-bold text-white">Connect Your Google Account</h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Sign in with Google to securely save your professional headshots to Google Drive and browse existing images for studio portraits, with permission from the app's users.
                </p>
              </div>

              {errorMsg && (
                <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400 flex items-center justify-center gap-2 max-w-md mx-auto">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Official Google Sign-in Button */}
              <div className="pt-2 flex justify-center">
                <button
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="gsi-material-button flex items-center gap-3 px-6 py-3 rounded-xl bg-white text-stone-900 font-semibold text-xs shadow-lg hover:bg-stone-100 transition-all active:scale-95 disabled:opacity-50"
                >
                  <div className="gsi-material-button-icon">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-4 w-4">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents font-medium">
                    {isLoggingIn ? 'Connecting to Google...' : 'Sign in with Google'}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* User info bar */}
              <div className="flex items-center justify-between rounded-xl border border-stone-800 bg-stone-900 p-3.5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden border border-stone-700 bg-stone-800 flex items-center justify-center font-bold text-white text-sm">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || 'User'} className="h-full w-full object-cover" />
                    ) : (
                      (user?.email || 'U')[0].toUpperCase()
                    )}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">{user?.displayName || 'Google User'}</h5>
                    <p className="text-[10px] text-stone-400">{user?.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => logout()}
                  className="rounded-lg border border-stone-700 bg-stone-800 px-3 py-1.5 text-xs text-stone-300 hover:bg-stone-700 hover:text-white transition-colors"
                >
                  Disconnect
                </button>
              </div>

              {/* Tabs */}
              <div className="flex rounded-xl border border-stone-800 bg-stone-900 p-1">
                <button
                  onClick={() => setActiveTab('save')}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${
                    activeTab === 'save'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Save Headshot to Drive</span>
                </button>
                <button
                  onClick={() => setActiveTab('import')}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${
                    activeTab === 'import'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Import from Drive ({driveFiles.length})</span>
                </button>
              </div>

              {/* Tab 1: Save */}
              {activeTab === 'save' && (
                <div className="space-y-4">
                  {currentItem ? (
                    <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="h-20 w-20 rounded-xl overflow-hidden border border-stone-700 bg-stone-950 shrink-0">
                          <img src={currentItem.headshotUrl} alt="Headshot" className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                            {currentItem.styleName}
                          </span>
                          <h4 className="mt-1 text-sm font-bold text-white">{currentItem.wardrobe}</h4>
                          <p className="text-[11px] text-stone-400">{currentItem.lighting}</p>
                        </div>
                      </div>

                      {uploadSuccess && (
                        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400 flex items-center gap-2">
                          <Check className="h-4 w-4 shrink-0" />
                          <span>{uploadSuccess}</span>
                        </div>
                      )}

                      {errorMsg && (
                        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          <span>{errorMsg}</span>
                        </div>
                      )}

                      <button
                        onClick={handleUploadToDrive}
                        disabled={isUploading}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-lg hover:bg-blue-500 transition-all disabled:opacity-50"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Uploading to Google Drive...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            <span>Save This Headshot to Google Drive</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-stone-400 text-xs">
                      No active headshot selected. Please select a headshot from your studio gallery to save.
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Import */}
              {activeTab === 'import' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-300">Your Drive Images</span>
                    <button
                      onClick={() => accessToken && loadDriveFiles(accessToken)}
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                    >
                      Refresh
                    </button>
                  </div>

                  {loadingFiles ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    </div>
                  ) : driveFiles.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-1">
                      {driveFiles.map((file) => (
                        <div
                          key={file.id}
                          onClick={() => {
                            if (onImportImage && file.thumbnailLink) {
                              onImportImage(file.thumbnailLink.replace('=s220', '=s800'), file.name);
                              onClose();
                            }
                          }}
                          className="group relative aspect-square rounded-xl overflow-hidden border border-stone-800 bg-stone-900 cursor-pointer hover:border-blue-500 transition-all"
                        >
                          {file.thumbnailLink ? (
                            <img src={file.thumbnailLink} alt={file.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-[10px] text-stone-500 p-2 text-center">
                              {file.name}
                            </div>
                          )}
                          <div className="absolute inset-x-0 bottom-0 bg-stone-950/80 p-1 text-[9px] text-stone-300 truncate px-2">
                            {file.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-stone-400 text-xs">
                      No images found in your Google Drive.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
