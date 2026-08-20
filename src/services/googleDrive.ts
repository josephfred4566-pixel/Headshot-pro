import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request Google Drive scopes
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/drive.readonly');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// Google Drive API helper functions
export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webViewLink?: string;
}

export async function listDriveImages(accessToken: string): Promise<DriveFileItem[]> {
  const query = encodeURIComponent("mimeType contains 'image/' and trashed = false");
  const res = await fetch(`https://www.googleapis.com/upload/drive/v3/files?q=${query}&pageSize=30&fields=files(id,name,mimeType,thumbnailLink,webViewLink)`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // Fallback to standard files list endpoint without upload prefix if needed
  if (!res.ok) {
    const res2 = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&pageSize=30&fields=files(id,name,mimeType,thumbnailLink,webViewLink)`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res2.ok) {
      throw new Error('Failed to list Google Drive images');
    }
    const data = await res2.json();
    return data.files || [];
  }

  const data = await res.json();
  return data.files || [];
}

export async function uploadHeadshotToDrive(
  accessToken: string,
  dataUrl: string,
  fileName: string
): Promise<{ id: string; webViewLink?: string }> {
  // Convert dataUrl to Blob
  const res = await fetch(dataUrl);
  const blob = await res.blob();

  const metadata = {
    name: fileName,
    mimeType: 'image/jpeg',
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', blob);

  const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: form,
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`Failed to upload to Google Drive: ${errText}`);
  }

  return await uploadRes.json();
}
