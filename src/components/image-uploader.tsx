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
import { useCallback, useState } from 'react';
import { UploadedFileData } from 'uploadthing/types';

import { cn } from '@/lib/utils';

import ImageLoader from '@/components/ImageLoader';

import { UploadButton } from '@/utils/uploadthing';

interface UploadedFileDataWithServerData
  extends Omit<UploadedFileData, 'appUrl'> {
  /**
   * This is available after the file has been uploaded
   */
  serverData?: {
    uploadedBy: string;
  };
}

interface ImageUploaderProps {
  initialImages?: UploadedFileDataWithServerData[];
  onChange: (images: UploadedFileDataWithServerData[]) => void;
  onError?: (error: Error | null) => void;
}

const SortableImage = ({
  image,
  onDelete,
  isCover,
}: {
  image: UploadedFileDataWithServerData;
  onDelete: (key: string) => void;
  isCover: boolean;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: image.key });

  const onDeleteCb = useCallback(() => {
    onDelete(image.key);
  }, [onDelete, image.key]);

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
        <div className='relative w-full h-full bg-gray-100 dark:bg-gray-800'>
          <ImageLoader
            src={image.url}
            alt={image.name}
            fill
            className='object-contain'
          />
          {isCover && (
            <div className='absolute bottom-0 left-0 right-0 bg-black/50 dark:bg-black/70 text-white text-center py-1'>
              Cover Photo
            </div>
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
  type OptimisticUploadedFileData = UploadedFileDataWithServerData & {
    optimistic?: boolean;
  };
  const [images, setImages] = useState<OptimisticUploadedFileData[]>(
    initialImages || [],
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingProgress, setUploadingProgress] = useState(0);

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

  const deleteImage = (key: string) => {
    const updatedImages = images.filter((image) => image.key !== key);
    setImages(updatedImages);
    onChange(updatedImages);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setImages((items) => {
        const oldIndex = items.findIndex((item) => item.key === active.id);
        const newIndex = items.findIndex((item) => item.key === over?.id);

        const newOrder = arraySwap(items, oldIndex, newIndex);
        onChange(newOrder);
        return newOrder;
      });
    }
  };

  return (
    <div className='space-y-4'>
      <div
        className=' text-center py-1'
        style={{
          opacity: isUploading ? 1 : 0,
          backgroundRepeat: 'no-repeat',
          backgroundImage: 'linear-gradient(0deg, #3b82f6, #3b82f6)',
          backgroundSize: `${uploadingProgress}% 100%`,
        }}
      >
        Uploading...
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        autoScroll={false}
      >
        <SortableContext
          items={images.map((img) => img.key)}
          strategy={rectSwappingStrategy}
        >
          <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
            {images.map((image, index) => (
              <SortableImage
                key={image.key}
                image={image}
                onDelete={deleteImage}
                isCover={index === 0}
              />
            ))}
            <div className='aspect-square relative m-2'>
              <UploadButton
                endpoint='imageUploader'
                onBeforeUploadBegin={(files) => {
                  setIsUploading(true);
                  const newOptimisticImages = files.map((file) => ({
                    key: `optimistic-${Date.now()}-${file.name}`,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    customId: `optimistic-${Date.now()}-${file.name}`,
                    url: URL.createObjectURL(file),
                    optimistic: true,
                    fileHash: '',
                  }));
                  setImages((prev) => [...prev, ...newOptimisticImages]);
                  onChange([...images, ...newOptimisticImages]);
                  return files;
                }}
                onClientUploadComplete={(
                  newImages: OptimisticUploadedFileData[],
                ) => {
                  const updatedImages = [...images, ...newImages].filter(
                    (img) => !img.optimistic,
                  );
                  setImages(updatedImages);
                  onChange(updatedImages);
                  onError?.(null);
                  setIsUploading(false);
                }}
                onUploadProgress={(progress) => {
                  setUploadingProgress(progress);
                }}
                onUploadError={(error: Error) => {
                  // Remove optimistic images
                  const updatedImages = images.filter((img) => !img.optimistic);
                  setImages(updatedImages);
                  onChange(updatedImages);

                  if (error?.message.includes('FileSizeMismatch')) {
                    onError?.(new Error('Uploaded file size is too large'));
                  } else if (error) {
                    onError?.(error);
                  }
                  setIsUploading(false);
                }}
                disabled={isUploading}
                className={`
                  aspect-square w-full 
                  [&>*:first-child]:w-full [&>*:first-child]:h-full [&>*:first-child]:flex
                  [&>*:first-child]:items-center [&>*:first-child]:justify-center
                `}
                content={{
                  button({ ready, isUploading }) {
                    const buttonClasses = cn(
                      'w-full h-full flex flex-col gap-2 items-center justify-center',
                      'border-2 border-dashed border-gray-300 dark:border-gray-500',
                      'bg-gray-50 dark:bg-gray-900/95',
                      'hover:bg-gray-100 dark:hover:bg-gray-800/80',
                      'hover:border-blue-500 dark:hover:border-blue-400',
                      ready ? 'cursor-pointer' : 'cursor-not-allowed',
                      isUploading ? 'opacity-50' : '',
                    );

                    return (
                      <div className={buttonClasses}>
                        <PlusIcon className='w-8 h-8 text-xl min-h-8 min-w-8 text-blue-100 dark:text-blue-400' />
                        <span className='text-gray-700 dark:text-gray-200 text-sm w-full text-center'>
                          Upload {images.length ? 'more' : ''} images
                        </span>
                      </div>
                    );
                  },
                }}
              />
            </div>
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};
