'use client';

import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Upload as UploadIcon,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { FileUploadState, useFileUploader } from '@/hooks/useFileUploader';

export const FileUploader: React.FC = () => {
  const {
    fileStates,
    isUploading,
    fileInputRef,
    handleFileSelect,
    removeFile,
  } = useFileUploader();

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
          <Progress
            value={fileState.progress}
            max={100}
            className={cn(
              'h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full',
              fileState.status === 'success' && 'bg-success',
              fileState.status === 'error' && 'bg-red-500',
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
