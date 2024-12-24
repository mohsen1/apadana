'use client';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arraySwap,
  rectSwappingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PlusIcon, XIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { cn } from '@/lib/utils';
import { FileUploadState, useFileUploader } from '@/hooks/useFileUploader';

import ImageLoader from '@/components/ImageLoader';
import { Progress } from '@/components/ui/progress';

export interface ImageUploaderImage {
  key: string;
  name: string;
  url: string;
}

interface ImageUploaderProps {
  initialImages?: ImageUploaderImage[];
  onChange: (images: ImageUploaderImage[]) => void;
  onError?: (error: Error | null) => void;
}

const SortableImage = ({
  fileState,
  onDelete,
  isCover,
}: {
  fileState: FileUploadState;
  onDelete: (key: string) => void;
  isCover: boolean;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: fileState.key ?? '',
  });

  const onDeleteCb = useCallback(() => {
    if (!fileState.key) {
      throw new Error('File state key is undefined');
    }
    onDelete(fileState.key);
  }, [onDelete, fileState.key]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className='relative aspect-square'
    >
      <div className='border-border h-full w-full overflow-hidden rounded-lg border shadow-md'>
        <div
          className={cn('bg-muted h-full w-full', {
            'opacity-75': fileState.status === 'uploading',
          })}
        >
          <ImageLoader
            src={fileState.localUrl ?? ''}
            alt={fileState.file.name}
            fill
            className='object-contain'
          />
          {isCover && (
            <div className='bg-foreground/50 text-background absolute bottom-0 left-0 right-0 rounded-b-lg py-1 text-center'>
              Cover Photo
            </div>
          )}
          {fileState.status === 'uploading' && (
            <Progress
              className='absolute left-0 right-0 top-0 rounded-t-lg'
              value={fileState.progress}
              max={100}
            />
          )}
        </div>
      </div>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDeleteCb();
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
        }}
        type='button'
        className='bg-destructive hover:bg-destructive focus:bg-destructive absolute -right-3 -top-3 flex h-6 w-6 items-center justify-center rounded-full text-white opacity-50 focus:outline-none'
      >
        <XIcon className='h-4 w-4' />
      </button>
    </div>
  );
};

export const ImageUploader = ({ initialImages, onChange, onError }: ImageUploaderProps) => {
  const { fileStates, removeFile, handleFileSelect } = useFileUploader({
    initialFiles:
      initialImages?.map((image) => ({
        key: image.key,
        file: new File([], image.name),
        status: 'success' as const,
        localUrl: image.url,
        uploadedUrl: image.url,
        progress: 100,
      })) ?? [],
    onUploadSuccess: (files) => {
      const images = files
        .filter(
          (file): file is Required<FileUploadState> =>
            file.status === 'success' && file.key !== undefined,
        )
        .map((file) => ({
          key: file.key,
          name: file.file.name,
          url: file.uploadedUrl,
        }));
      onChange(images);
    },
    onUploadError: (error) => {
      onError?.(error);
    },
  });
  const [orderedImages, setOrderedImages] = useState<FileUploadState[]>(fileStates);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    setOrderedImages(fileStates);
  }, [fileStates]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setOrderedImages((items) => {
        const oldIndex = items.findIndex((item) => item.key === active.id);
        const newIndex = items.findIndex((item) => item.key === over?.id);

        const newOrder = arraySwap(items, oldIndex, newIndex);
        onChange(
          newOrder
            .filter(
              (item): item is Required<FileUploadState> =>
                item.status === 'success' && item.key !== undefined,
            )
            .map((item) => ({
              key: item.key,
              name: item.file.name,
              url: item.uploadedUrl,
            })),
        );
        return newOrder;
      });
    }
  };

  return (
    <div className='space-y-4'>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        autoScroll={false}
      >
        <SortableContext
          items={orderedImages
            .filter((img): img is Required<FileUploadState> => img.key !== undefined)
            .map((img) => img.key)}
          strategy={rectSwappingStrategy}
        >
          <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
            {orderedImages.map((fileState, index) => (
              <SortableImage
                key={fileState.key || index}
                fileState={fileState}
                onDelete={removeFile}
                isCover={index === 0}
              />
            ))}
            <label htmlFor='image-uploader-input' className='relative aspect-square cursor-pointer'>
              <div className='border-border h-full w-full overflow-hidden rounded-lg border shadow-md'>
                <div className='bg-muted relative flex h-full w-full place-content-center'>
                  <div className='flex flex-col items-center justify-center'>
                    <PlusIcon className='text-muted-foreground h-10 w-10' />
                    <p className='text-muted-foreground'>Add Photos</p>
                  </div>
                </div>
              </div>
            </label>
            <input
              id='image-uploader-input'
              type='file'
              className='hidden'
              multiple
              accept='image/*'
              onChange={handleFileSelect}
            />
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};
