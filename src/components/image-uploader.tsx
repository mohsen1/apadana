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
  arrayMove,
  rectSwappingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { XIcon } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { UploadedFileData } from 'uploadthing/types';

import { UploadButton } from '@/utils/uploadthing';

const SortableImage = ({
  image,
  onDelete,
}: {
  image: UploadedFileData;
  onDelete: (key: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: image.key });

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
      className='w-1/3 h-1/3 relative m-2'
    >
      <div className='border rounded-lg shadow-md overflow-hidden'>
        <Image
          src={image.url}
          alt={image.name}
          width={100}
          className='object-cover w-full h-full'
          height={100}
        />
      </div>
      <button
        onClick={() => onDelete(image.key)}
        className='absolute -top-3 -right-3 bg-gray-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 focus:bg-red-600 focus:outline-none'
      >
        <XIcon className='w-4 h-4' />
      </button>
    </div>
  );
};

export const ImageUploader = ({
  onChange,
  onError,
}: {
  onChange: (images: UploadedFileData[]) => void;
  onError?: (error: Error) => void;
}) => {
  const [images, setImages] = useState<UploadedFileData[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
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

        const newOrder = arrayMove(items, oldIndex, newIndex);
        onChange(newOrder);
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
      >
        <SortableContext
          items={images.map((img) => img.key)}
          strategy={rectSwappingStrategy}
        >
          <div className='flex flex-wrap gap-4'>
            {images.map((image) => (
              <SortableImage
                key={image.key}
                image={image}
                onDelete={deleteImage}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <UploadButton
        endpoint='imageUploader'
        onClientUploadComplete={(newImages) => {
          const updatedImages = [...images, ...newImages];
          setImages(updatedImages);
          onChange(updatedImages);
        }}
        onUploadError={(error: Error) => {
          onError?.(error);
        }}
      />
    </div>
  );
};
