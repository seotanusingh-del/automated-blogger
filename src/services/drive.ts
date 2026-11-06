export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webContentLink?: string;
  createdTime?: string;
  size?: string;
}

export const TARGET_DRIVE_PROJECT_ID = '1tZdngmox6JcbH0HfngUOtyJMCgRdWLpw';
export const TARGET_BLOGGER_ID = '1660638823295885987';
export const TARGET_BLOG_URL = 'https://easyflightconnectblog.blogspot.com';


/**
 * Extracts Google Drive Folder ID from a full Drive URL or returns the bare ID
 */
export function parseDriveFolderId(input: string): string {
  if (!input || !input.trim()) return TARGET_DRIVE_PROJECT_ID;
  const trimmed = input.trim();
  const folderMatch = trimmed.match(/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch && folderMatch[1]) {
    return folderMatch[1];
  }
  return trimmed;
}

/**
 * Lists image files from the user's Drive folder
 */
export async function listDriveFiles(accessToken: string, folderId: string = TARGET_DRIVE_PROJECT_ID): Promise<DriveFile[]> {
  const cleanFolderId = parseDriveFolderId(folderId);
  try {
    const q = `'${cleanFolderId}' in parents and mimeType contains 'image/' and trashed = false`;
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType,thumbnailLink,webContentLink,createdTime,size)&pageSize=50`;
    
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!res.ok) {
      // Fallback: search images without strict parent query
      const fallbackUrl = `https://www.googleapis.com/drive/v3/files?fields=files(id,name,mimeType,thumbnailLink,webContentLink,createdTime,size)&pageSize=30&q=mimeType contains 'image/' and trashed = false`;
      const fallbackRes = await fetch(fallbackUrl, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        return fallbackData.files || [];
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Drive API responded with status ${res.status}`);
    }

    const data = await res.json();
    return data.files || [];
  } catch (err) {
    console.warn('Drive listing error:', err);
    throw err;
  }
}

/**
 * Upload an image file directly to the user's Google Drive folder
 */
export async function uploadImageToDrive(accessToken: string, file: File, folderId: string = TARGET_DRIVE_PROJECT_ID): Promise<DriveFile> {
  const cleanFolderId = parseDriveFolderId(folderId);
  const metadata = {
    name: file.name,
    parents: [cleanFolderId],
    mimeType: file.type
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,thumbnailLink,webContentLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: form
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Drive upload failed (${res.status}): ${errorText}`);
  }

  const uploadedFile = await res.json();

  // Try setting public permission so anyone viewing the blog post can view the image
  try {
    await fetch(`https://www.googleapis.com/drive/v3/files/${uploadedFile.id}/permissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone'
      })
    });
  } catch (e) {
    console.warn('Could not set public sharing permission:', e);
  }

  return uploadedFile;
}

/**
 * Format direct CDN embed link from Drive file ID
 */
export function getDriveDirectEmbedUrl(fileId: string): string {
  return `https://lh3.googleusercontent.com/d/${fileId}`;
}

/**
 * Downloads a generated banner image (converts SVG to high-res PNG or downloads image file)
 */
export async function downloadBannerImage(imageUrl: string, filename: string): Promise<void> {
  const safeFilename = filename.replace(/[^a-zA-Z0-9_-]/g, '_');

  if (imageUrl.startsWith('data:image/svg+xml')) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 630;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, 1200, 630);
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${safeFilename}.png`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              setTimeout(() => URL.revokeObjectURL(url), 2000);
              resolve();
            } else {
              reject(new Error('Failed to create image blob.'));
            }
          }, 'image/png');
        } else {
          reject(new Error('Canvas context not available.'));
        }
      };
      img.onerror = () => {
        // Fallback: download as SVG directly
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = `${safeFilename}.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        resolve();
      };
      img.src = imageUrl;
    });
  } else {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = safeFilename.endsWith('.png') || safeFilename.endsWith('.jpg') ? safeFilename : `${safeFilename}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch {
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = safeFilename;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }
}
