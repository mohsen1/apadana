import axios from 'axios';

/**
 * Uploads a file to the server and returns the key of the uploaded file.
 */
export async function uploadFiles(file: File): Promise<{ key: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Content-Length': file.size.toString(),
    },
  });

  return response.data as { key: string };
}
