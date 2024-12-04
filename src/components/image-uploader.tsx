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
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: fileState.key ?? '' });

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
      className='aspect-square relative m-2'
    >
      <div className='border border-gray-200 dark:border-gray-700 rounded-lg shadow-md overflow-hidden w-full h-full'>
        <div
          className={cn(' w-full h-full bg-gray-100 dark:bg-gray-800', {
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
            <div className='absolute bottom-0 left-0 right-0 bg-black/50 dark:bg-black/70 text-white text-center py-1 rounded-b-lg'>
              Cover Photo
            </div>
          )}
          {fileState.status === 'uploading' && (
            <Progress
              className='absolute top-0 left-0 right-0 rounded-t-lg'
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
        className='absolute -top-3 -right-3 bg-gray-500 dark:bg-gray-400 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 dark:hover:bg-red-500 focus:bg-red-600 dark:focus:bg-red-500 focus:outline-none'
      >
        <XIcon className='w-4 h-4' />
      </button>
    </div>
  );
};

export const ImageUploader = ({
  initialImages,
  onChange,
  onError,
}: ImageUploaderProps) => {
  const { fileStates, removeFile, handleFileSelect } = useFileUploader(
    (files) => {
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
    onError,
  );
  const [orderedImages, setOrderedImages] = useState<FileUploadState[]>([
    ...fileStates,
    ...(initialImages ?? []).map((image) => ({
      key: image.key,
      file: new File([], image.name),
      status: 'success' as const,
      localUrl: image.url,
      uploadedUrl: image.url,
      progress: 100,
    })),
  ]);
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
            .filter(
              (img): img is Required<FileUploadState> => img.key !== undefined,
            )
            .map((img) => img.key)}
          strategy={rectSwappingStrategy}
        >
          <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
            {orderedImages.map((fileState, index) => (
              <SortableImage
                key={fileState.key || index}
                fileState={fileState}
                onDelete={removeFile}
                isCover={index === 0}
              />
            ))}
            <label
              htmlFor='image-uploader-input'
              className='aspect-square relative m-2 cursor-pointer'
            >
              <div className=' border border-gray-200 dark:border-gray-700 rounded-lg shadow-md overflow-hidden w-full h-full'>
                <div className='flex place-content-center relative w-full h-full bg-gray-100 dark:bg-gray-800'>
                  <div className='flex flex-col items-center justify-center'>
                    <PlusIcon className='w-10 h-10 text-gray-500 dark:text-gray-400' />
                    <p className='text-gray-500 dark:text-gray-400'>
                      Add Photos
                    </p>
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
