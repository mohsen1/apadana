'use client';

import {
  AlertCircle,
  CheckCircle2,
  Upload as UploadIcon,
  X,
} from 'lucide-react';
import { Loader2 } from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

import { getUploadSignedUrl } from '@/app/upload/action';

// Type definitions for file upload state
interface FileUploadState {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  statusMessage?: string;
  key?: string;
  signedUrl?: string;
  uploadedUrl?: string;
}

export const FileUploader: React.FC = () => {
  const [fileStates, setFileStates] = useState<FileUploadState[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    const newFiles: FileUploadState[] = Array.from(selectedFiles).map(
      (file) => ({
        file,
        progress: 0,
        status: 'pending',
      }),
    );

    setFileStates((prevFiles) => [...prevFiles, ...newFiles]);
  };

  // Remove a file from the upload list
  const removeFile = (fileToRemove: File) => {
    setFileStates((prevFiles) =>
      prevFiles.filter((fileState) => fileState.file !== fileToRemove),
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

  // Upload files using AWS S3 SDK with progress tracking
  const uploadFiles = useCallback(async () => {
    if (fileStates.length === 0) return;
    setIsUploading(true);

    try {
      // Get signed URLs for all files
      const response = await getUploadSignedUrl({
        files: fileStates.map((fileState) => ({
          filename: fileState.file.name,
          contentType: fileState.file.type,
        })),
      });

      const urls = response?.data?.urls;

      if (!urls) {
        throw new Error('No URLs returned from signed URL action');
      }

      const newFiles = fileStates.map((fileState, index) => ({
        ...fileState,
        signedUrl: urls[index].url,
        key: urls[index].key,
      }));

      setFileStates(newFiles);

      // Upload each file
      await Promise.all(
        newFiles.map(async (fileState) => {
          try {
            if (!fileState.signedUrl)
              throw new Error('No signed URL available');

            // Update status to uploading
            updateFile(fileState, { status: 'uploading', progress: 0 });

            const xhr = new XMLHttpRequest();

            await new Promise((resolve, reject) => {
              xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                  const progress = Math.round(
                    (event.loaded * 100) / event.total,
                  );
                  updateFile(fileState, { progress });
                }
              });

              xhr.addEventListener('load', (event) => {
                if (xhr.status >= 200 && xhr.status < 300) {
                  const S3_UPLOAD_BUCKET = 'apadana-uploads';
                  const S3_UPLOAD_REGION = 'us-east-1';
                  updateFile(fileState, {
                    status: 'success',
                    progress: 100,
                    statusMessage: 'Upload complete',
                    uploadedUrl: `https://${S3_UPLOAD_BUCKET}.s3.${S3_UPLOAD_REGION}.amazonaws.com/${fileState.key}`,
                  });
                  resolve(null);
                } else {
                  throw new Error(`Upload failed with status ${xhr.status}`);
                }
              });

              xhr.addEventListener('error', () => {
                reject(new Error('Upload failed'));
              });

              xhr.open('PUT', fileState.signedUrl);
              xhr.setRequestHeader('Content-Type', fileState.file.type);
              xhr.send(fileState.file);
            });
          } catch (error) {
            updateFile(fileState, {
              status: 'error',
              statusMessage: 'Upload failed',
            });
          }
        }),
      );
    } catch (error) {
      fileStates.forEach((fileState) => {
        updateFile(fileState, {
          status: 'error',
          statusMessage: 'Failed to get upload URL',
        });
      });
    } finally {
      setIsUploading(false);
    }
  }, [fileStates]);

  // Render file upload progress
  const renderFileProgress = (fileState: FileUploadState) => {
    const statusIcons = {
      pending: <UploadIcon className='h-5 w-5 text-muted-foreground' />,
      uploading: (
        <div className='relative w-5 h-5'>
          <UploadIcon className='h-5 w-5 text-primary' />
          <div
            className='absolute inset-0 rounded-full border-2 border-primary animate-spin'
            style={{ borderTopColor: 'transparent' }}
          />
        </div>
      ),
      success: <CheckCircle2 className='h-5 w-5 text-success' />,
      error: <AlertCircle className='h-5 w-5 text-destructive' />,
    };

    return (
      <div className='flex items-center gap-4 w-full'>
        {statusIcons[fileState.status]}
        <div className='flex-1 space-y-1'>
          <div className='text-sm font-medium truncate'>
            {fileState.file.name}
          </div>
          <div>{fileState.progress}%</div>
          <Progress
            value={fileState.progress}
            className={cn(
              'h-1.5',
              fileState.status === 'success' && 'bg-success',
              fileState.status === 'error' && 'bg-destructive',
            )}
          />
          {fileState.statusMessage && (
            <p
              className={cn(
                'text-xs',
                fileState.status === 'error'
                  ? 'text-destructive'
                  : 'text-muted-foreground',
              )}
            >
              {fileState.statusMessage}
            </p>
          )}
        </div>
        {!isUploading && (
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8'
            onClick={() => removeFile(fileState.file)}
          >
            <X className='h-4 w-4' />
            <span className='sr-only'>Remove file</span>
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className='w-full max-w-md mx-auto p-4 space-y-4'>
      <div className='grid w-full gap-4'>
        <input
          type='file'
          ref={fileInputRef}
          onChange={handleFileSelect}
          className='hidden'
          multiple
        />

        <Button
          variant='outline'
          className='w-full h-32 relative'
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <div className='flex flex-col items-center gap-2'>
            <UploadIcon className='h-6 w-6' />
            <span className='font-medium'>Click to upload files</span>
            <span className='text-xs text-muted-foreground'>
              or drag and drop files here
            </span>
          </div>
        </Button>

        {fileStates.length > 0 && (
          <Card>
            <CardContent className='pt-6 space-y-4'>
              {fileStates.map((fileState, index) => (
                <div key={fileState.file.name + index}>
                  {renderFileProgress(fileState)}
                  {index < fileStates.length - 1 && (
                    <Separator className='my-4' />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {fileStates.length > 0 && (
          <Button
            onClick={uploadFiles}
            disabled={
              isUploading || fileStates.every((f) => f.status === 'success')
            }
          >
            {isUploading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Uploading...
              </>
            ) : (
              <>
                <UploadIcon className='mr-2 h-4 w-4' />
                Upload Files
              </>
            )}
          </Button>
        )}
      </div>
      <div className='flex flex-col gap-2'>
        {fileStates
          .filter((f) => f.status === 'success')
          .map((fileState) => (
            <div key={fileState.file.name} className='w-full'>
              <img
                src={fileState.uploadedUrl}
                alt={fileState.file.name}
                className='w-full'
              />
            </div>
          ))}
      </div>
    </div>
  );
};
