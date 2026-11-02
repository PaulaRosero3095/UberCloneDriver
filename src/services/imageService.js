const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export async function uploadImage(uri) {
  if (!uri) return null;
  if (uri.startsWith('http')) return uri; // already uploaded

  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary is not configured (check the .env file)');
  }

  const formData = new FormData();
  // React Native accepts this object shape for files
  formData.append('file', { uri, type: 'image/jpeg', name: 'upload.jpg' });
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', 'uberclone-conductor');

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok || !data.secure_url) {
    throw new Error(data?.error?.message || 'Image upload failed');
  }
  return data.secure_url;
}