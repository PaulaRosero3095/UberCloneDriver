// src/services/imageService.js
// AI-assisted: see docs/AI_LOG.md #7
// Uploads a local image to Cloudinary (unsigned preset) and returns its public URL.
// Only the cloud name and the preset live in the app; the API secret is never used here.
// XMLHttpRequest is used on purpose: the global fetch of this Expo version does not accept
// the React Native file object ({ uri, type, name }) inside a FormData.

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

function guessFile(uri) {
  const isPng = uri.toLowerCase().endsWith('.png');
  return { type: isPng ? 'image/png' : 'image/jpeg', name: isPng ? 'upload.png' : 'upload.jpg' };
}

export function uploadImage(uri) {
  if (!uri) return Promise.resolve(null);
  if (uri.startsWith('http')) return Promise.resolve(uri); // already uploaded

  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    return Promise.reject(new Error('Cloudinary is not configured (check the .env file)'));
  }

  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', { uri, ...guessFile(uri) });
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'uberclone-conductor');

    const request = new XMLHttpRequest();
    request.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);
    request.timeout = 30000;

    request.onload = () => {
      let data = null;
      try {
        data = JSON.parse(request.responseText);
      } catch (e) {
        // not JSON: handled below
      }
      if (request.status >= 200 && request.status < 300 && data?.secure_url) {
        resolve(data.secure_url);
      } else {
        reject(new Error(`Image upload failed: ${data?.error?.message || request.status}`));
      }
    };
    request.onerror = () => reject(new Error('Image upload failed: network error'));
    request.ontimeout = () => reject(new Error('Image upload failed: timeout'));

    request.send(formData); // no Content-Type header: React Native sets the boundary
  });
}