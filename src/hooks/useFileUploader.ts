import { useCallback, useRef, useState } from 'react';

import { getUploadSignedUrl } from '@/app/upload/action';
import { shouldUseFakeUploads } from '@/app/upload/constants';
import { assertError } from '@/utils';

export interface FileUploadState {
  /**
   * The file object being uploaded
   */
  file: File;
  /**
   * Progress of the file upload. Value between 0 and 100.
   */
  progress: number;
  /**
   * Status of the file upload
   */
  status: 'pending' | 'uploading' | 'success' | 'error';
  /**
   * Message describing the status of the file upload
   */
  statusMessage?: string;
  /**
   * Key of the uploaded file on the server
   */
  key?: string;
  /**
   * Signed URL for uploading the file to the server
   */
  signedUrl?: string;
  /**
   * URL of the uploaded file on the server
   */
  uploadedUrl?: string;
  /**
   * Local URL for previewing the file
   */
  localUrl?: string;
}

export const useFileUploader = (
  onUploadSuccess?: (uploadedFiles: FileUploadState[]) => void,
  onUploadError?: (error: Error, failedFiles: FileUploadState[]) => void,
) => {
  const [totalProgress, setTotalProgress] = useState(0);
  const [fileStates, setFileStates] = useState<FileUploadState[]>([]);

  const computeTotalProgress = useCallback(() => {
    const totalProgress = fileStates.reduce((acc, fileState) => {
      return acc + fileState.progress;
    }, 0);
    return Math.round(totalProgress / fileStates.length);
  }, [fileStates]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getUploadedUrl = (key?: string) => {
    if (!key) return undefined;

    const NEXT_PUBLIC_S3_UPLOAD_BUCKET =
      process.env.NEXT_PUBLIC_S3_UPLOAD_BUCKET;
    const NEXT_PUBLIC_S3_UPLOAD_REGION =
      process.env.NEXT_PUBLIC_S3_UPLOAD_REGION;

    if (shouldUseFakeUploads) {
      return `/api/e2e/upload/${key}`;
    }

    return `https://${NEXT_PUBLIC_S3_UPLOAD_BUCKET}.s3.${NEXT_PUBLIC_S3_UPLOAD_REGION}.amazonaws.com/${key}`;
  };

  const uploadSingleFile = useCallback(
    async (
      fileState: FileUploadState,
    ): Promise<FileUploadState | undefined> => {
      try {
        if (!fileState.signedUrl) throw new Error('No signed URL available');

        updateFile(fileState, { status: 'uploading', progress: 0 });

        const xhr = new XMLHttpRequest();

        return new Promise<FileUploadState>((resolve, reject) => {
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded * 100) / event.total);
              updateFile(fileState, { progress });
              setTotalProgress(computeTotalProgress());
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const updates: Partial<FileUploadState> = {
                status: 'success',
                progress: 100,
                statusMessage: 'Upload complete',
                uploadedUrl: getUploadedUrl(fileState.key),
              };
              updateFile(fileState, updates);
              resolve({
                ...fileState,
                ...updates,
              });
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          });

          xhr.addEventListener('error', () => {
            reject(new Error('Upload failed'));
          });

          if (!fileState.signedUrl)
            throw new Error(
              `No signed URL available for file ${fileState.file.name}`,
            );

          xhr.open('PUT', fileState.signedUrl);
          xhr.setRequestHeader('Content-Type', fileState.file.type);
          xhr.send(fileState.file);
        });
      } catch (error) {
        assertError(error);
        updateFile(fileState, {
          status: 'error',
          statusMessage: 'Upload failed',
        });

        onUploadError?.(error, [fileState]);
      }
    },
    [onUploadError, computeTotalProgress],
  );
  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = event.target.files;
      if (!selectedFiles) return;

      const newFiles: FileUploadState[] = Array.from(selectedFiles).map(
        (file) => ({
          file,
          progress: 0,
          status: 'pending',
          localUrl: URL.createObjectURL(file),
        }),
      );

      setFileStates((prevFiles) => [...prevFiles, ...newFiles]);

      try {
        const response = await getUploadSignedUrl({
          files: newFiles.map((fileState) => ({
            filename: fileState.file.name,
            contentType: fileState.file.type,
          })),
        });

        const urls = response?.data?.urls;
        if (!urls) throw new Error('No URLs returned from signed URL action');

        const filesToUpload = newFiles.map((fileState, index) => ({
          ...fileState,
          signedUrl: urls[index].url,
          key: urls[index].key,
        }));

        setFileStates((prevFiles) => {
          const existingFiles = prevFiles.filter(
            (f) => !newFiles.find((nf) => nf.file === f.file),
          );
          return [...existingFiles, ...filesToUpload];
        });

        const uploadedFiles = await Promise.all(
          filesToUpload.map(uploadSingleFile),
        );
        onUploadSuccess?.(uploadedFiles.filter((fs) => fs !== undefined));
      } catch (error) {
        assertError(error);
        newFiles.forEach((fileState) => {
          updateFile(fileState, {
            status: 'error',
            statusMessage: 'Failed to get upload URL',
          });
        });

        onUploadError?.(error, newFiles);
      }
    },
    [onUploadSuccess, onUploadError, uploadSingleFile],
  );

  const removeFile = (key: string) => {
    setFileStates((prevFiles) =>
      prevFiles.filter((fileState) => {
        if (fileState.key === key) {
          if (fileState.localUrl) URL.revokeObjectURL(fileState.localUrl);
          return false;
        }
        return true;
      }),
    );
  };

  const updateFile = (
    file: FileUploadState,
    updates: Partial<FileUploadState>,
  ) => {
    setFileStates((prev) =>
      prev.map((fileState) =>
        fileState.key === file.key ? { ...fileState, ...updates } : fileState,
      ),
    );
  };

  return {
    fileStates,
    fileInputRef,
    handleFileSelect,
    removeFile,
    totalProgress,
  };
};
