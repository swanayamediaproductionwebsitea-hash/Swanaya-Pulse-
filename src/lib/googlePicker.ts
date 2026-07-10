import { auth } from './firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

let gapiLoadingPromise: Promise<any> | null = null;
let cachedAccessToken: string | null = null;
let googleUserEmail: string | null = null;

/**
 * Dynamically loads the gapi script
 */
export function loadGapi(): Promise<any> {
  if (gapiLoadingPromise) return gapiLoadingPromise;

  gapiLoadingPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window not defined'));
      return;
    }
    if ((window as any).gapi) {
      resolve((window as any).gapi);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      resolve((window as any).gapi);
    };
    script.onerror = (err) => {
      gapiLoadingPromise = null;
      reject(err);
    };
    document.body.appendChild(script);
  });

  return gapiLoadingPromise;
}

/**
 * Loads the picker library module via gapi
 */
export function loadPickerLibrary(): Promise<any> {
  return new Promise((resolve, reject) => {
    loadGapi()
      .then((gapi) => {
        gapi.load('picker', {
          callback: () => {
            if ((window as any).google && (window as any).google.picker) {
              resolve((window as any).google.picker);
            } else {
              reject(new Error('Google Picker library failed to initialize on window.google'));
            }
          },
          onerror: (err: any) => {
            reject(err);
          }
        });
      })
      .catch(reject);
  });
}

/**
 * Set or clear cached OAuth token
 */
export function setCachedToken(token: string | null, email: string | null = null) {
  cachedAccessToken = token;
  if (email) {
    googleUserEmail = email;
    localStorage.setItem('swanaya_google_email', email);
    localStorage.setItem('swanaya_google_oauth_linked', 'true');
  } else {
    googleUserEmail = null;
    localStorage.removeItem('swanaya_google_email');
    localStorage.setItem('swanaya_google_oauth_linked', 'false');
  }
}

export function getCachedToken(): string | null {
  return cachedAccessToken;
}

export function getGoogleUserEmail(): string {
  return googleUserEmail || localStorage.getItem('swanaya_google_email') || '';
}

/**
 * Authenticates user via Google popup specifically for Drive & Picker access
 */
export async function authenticateGoogle(): Promise<string> {
  if (cachedAccessToken) return cachedAccessToken;

  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/drive.file');
  provider.addScope('https://www.googleapis.com/auth/drive.metadata.readonly');
  provider.setCustomParameters({
    prompt: 'select_account'
  });

  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  if (!credential?.accessToken) {
    throw new Error('No access token returned from Google sign-in');
  }

  const token = credential.accessToken;
  const email = result.user.email;
  setCachedToken(token, email);
  return token;
}

export function clearGoogleAuth() {
  setCachedToken(null);
}

/**
 * Launches the official Google Picker dialog and invokes callback on file selection
 */
export async function launchGooglePicker(
  onFilePicked: (file: { name: string; sizeBytes: number; url: string; id: string }) => void,
  onCancel?: () => void,
  onError?: (err: any) => void
) {
  try {
    // 1. Load the Google Picker client scripts
    await loadPickerLibrary();

    // 2. Acquire a valid OAuth Access Token
    const token = await authenticateGoogle();

    // 3. Determine safe iframe communication origin for the Picker builder
    const pickerOrigin =
      window.location.ancestorOrigins &&
      window.location.ancestorOrigins.length > 0
        ? window.location.ancestorOrigins[window.location.ancestorOrigins.length - 1]
        : window.location.origin;

    // 4. Instantiate and configure the Picker
    const picker = new (window as any).google.picker.PickerBuilder()
      .addView((window as any).google.picker.ViewId.DOCS)
      .setOAuthToken(token)
      .setCallback((data: any) => {
        if (data.action === (window as any).google.picker.Action.PICKED) {
          const doc = data.docs[0];
          onFilePicked({
            id: doc.id,
            name: doc.name,
            sizeBytes: doc.sizeBytes || 0,
            url: doc.url || doc.embedUrl || doc.alternateLink || ''
          });
        } else if (data.action === (window as any).google.picker.Action.CANCEL) {
          if (onCancel) onCancel();
        }
      })
      .setOrigin(pickerOrigin)
      .build();

    picker.setVisible(true);
  } catch (err: any) {
    console.error('Failed to launch Google Picker:', err);
    if (onError) onError(err);
  }
}
