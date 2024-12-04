import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Type definitions for file upload state
interface FileUploadState {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  statusMessage?: string;
}

export const FileUploader: React.FC = () => {
  const [files, setFiles] = useState<FileUploadState[]>([]);
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

    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  // Remove a file from the upload list
  const removeFile = (fileToRemove: File) => {
    setFiles((prevFiles) =>
      prevFiles.filter((fileState) => fileState.file !== fileToRemove),
    );
  };

  // Upload files using streaming fetch
  const uploadFiles = useCallback(async () => {
    if (files.length === 0) return;

    setIsUploading(true);

    // Create a FormData object to send files
    const formData = new FormData();
    files.forEach((fileState) => {
      formData.append('files', fileState.file);
    });

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      // Check if the response is a ReadableStream
      if (!response.body) {
        throw new Error('No response body');
      }

      // Create a reader to consume the stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      // Update file states based on stream messages
      const updateFileStates = (message: string) => {
        setFiles((prevFiles) =>
          prevFiles.map((fileState) => {
            // Check for specific file upload messages
            if (message.includes(fileState.file.name)) {
              if (message.includes('uploaded successfully')) {
                return {
                  ...fileState,
                  status: 'success',
                  statusMessage: 'Upload complete',
                  progress: 100,
                };
              }

              // Parse upload progress
              const progressMatch = message.match(/(\d+) bytes/);
              if (progressMatch) {
                const uploadedBytes = parseInt(progressMatch[1], 10);
                const progress = Math.min(
                  100,
                  Math.round((uploadedBytes / fileState.file.size) * 100),
                );

                return {
                  ...fileState,
                  status: 'uploading',
                  progress,
                };
              }
            }

            // Handle generic error messages
            if (message.includes('Error')) {
              return {
                ...fileState,
                status: 'error',
                statusMessage: message,
              };
            }

            return fileState;
          }),
        );
      };

      // Read the stream
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);

        // Split chunk into lines and process each
        chunk.split('\n').forEach((line) => {
          if (line.trim()) {
            updateFileStates(line);
          }
        });
      }
    } catch (error) {
      // Handle any fetch or streaming errors
      console.error('Upload error:', error);
      setFiles((prevFiles) =>
        prevFiles.map((fileState) => ({
          ...fileState,
          status: 'error',
          statusMessage:
            error instanceof Error ? error.message : 'Unknown error',
        })),
      );
    } finally {
      setIsUploading(false);
    }
  }, [files]);

  // Render file upload progress
  const renderFileProgress = (fileState: FileUploadState) => {
    const statusIcons = {
      pending: <Upload className='h-5 w-5 text-muted-foreground' />,
      uploading: (
        <div className='relative w-5 h-5'>
          <Upload className='h-5 w-5 text-primary' />
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
            <Upload className='h-6 w-6' />
            <span className='font-medium'>Click to upload files</span>
            <span className='text-xs text-muted-foreground'>
              or drag and drop files here
            </span>
          </div>
        </Button>

        {files.length > 0 && (
          <Card>
            <CardContent className='pt-6 space-y-4'>
              {files.map((fileState, index) => (
                <div key={fileState.file.name + index}>
                  {renderFileProgress(fileState)}
                  {index < files.length - 1 && <Separator className='my-4' />}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {files.length > 0 && (
          <Button
            onClick={uploadFiles}
            disabled={isUploading || files.every((f) => f.status === 'success')}
          >
            {isUploading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Uploading...
              </>
            ) : (
              <>
                <Upload className='mr-2 h-4 w-4' />
                Upload Files
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
