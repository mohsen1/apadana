/**
 * @fileoverview This file contains the schemas that are not
 * available in @/prisma/zod.
 *
 * @todo
 * Re-export all of the schemas from @/prisma/zod here
 * and add an ESLint rule to enforce that all schemas are
 * imported from here. Banning imports from @/prisma/zod
 * directly will make it easier to manage the schemas.
 *
 * All of the extensions and custom schemas should be defined
 * here.
 *
 * Avoid defining more custom schemas here and try to use the
 * ones available in @/prisma/zod. Since those schemas are
 * generated from the Prisma models, they are more likely to
 * be up to date with the latest changes in the database.
 */
import { BookingRequestStatus, Currency } from '@prisma/client';
import { z } from 'zod';

import {
  BookingSchema,
  EmailAddressSchema,
  ListingIncludeSchema,
  ListingSchema,
  UploadedPhotoSchema,
  UserSchema,
} from '@/prisma/zod';
import { compareTimeStrings, TimeString } from '@/utils/time';

//#region Base Schemas
export const UploadImageSchema = UploadedPhotoSchema.omit({
  listingId: true,
  id: true,
});

// Ideally we want to use Rich Comments in the Prisma Schema
// to validate the check-in and check-out times. but unfortunately
// this package doesn't support multi-line rich comments.
export const BaseListingSchema = ListingSchema.refine(
  (data) => /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(data.checkInTime),
  {
    message: 'Check-in time must be in HH:MM format',
  },
)
  .refine((data) => /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(data.checkOutTime), {
    message: 'Check-out time must be in HH:MM format',
  })
  .refine(
    (data) =>
      compareTimeStrings(data.checkInTime as TimeString, data.checkOutTime as TimeString) >= 0,
    {
      message: 'Check-out time must be after check-in time',
    },
  );
//#endregion

//#region Authentication & User Schemas

export const ClientUserSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  imageUrl: z.string().nullable(),
  email: z.string().describe('The primary email address of the user'),
  emailAddresses: z.array(
    z.object({
      id: z.string(),
      emailAddress: z.string(),
      isPrimary: z.boolean(),
      verified: z.boolean(),
    }),
  ),
  isAdmin: z.boolean().describe('Whether the user is an admin'),

  // Ensure that these fields are not included in the schema
  password: z.never().describe('not included in the client user schema').optional(),
  createdAt: z.never().describe('not included in the client user schema').optional(),
  updatedAt: z.never().describe('not included in the client user schema').optional(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
export const SignUpSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    password:
      process.env.NODE_ENV === 'development'
        ? z.string().min(1, 'Password is required')
        : z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
export const SuccessfulLoginSchema = z.object({
  user: ClientUserSchema,
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const ResetPasswordFormSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const UpdateUserSchema = UserSchema.partial().extend({
  id: z.string(),
});

const DevPasswordSchema = z.string().min(1, 'Password is required');
const ProdPasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be less than 100 characters');

export const PasswordSchema =
  process.env.NODE_ENV === 'development' ? DevPasswordSchema : ProdPasswordSchema;
//#endregion

//#region Listing Schemas
export const GetListingSchema = z.object({
  id: z.string(),
  include: ListingIncludeSchema.optional(),
});

export const PaginationSchema = z.object({
  take: z
    .number()
    .int()
    .min(1, 'Take must be at least 1')
    .max(100, 'Take must be less than 100')
    .default(10)
    .describe('Limit of how many items to return'),
  skip: z
    .number()
    .int()
    .min(0, 'Can not skip less than 0')
    .default(0)
    .describe('Offset of how many items to skip'),
  search: z.string().optional().describe('Search query for filtering items'),
});

export const PaginationQueryParamsSchema = z.object({
  take: z.coerce.number().optional().default(10).describe('Limit of how many items to return'),
  skip: z.coerce.number().optional().default(0).describe('Offset of how many items to skip'),
  search: z.string().optional().describe('Search query for filtering items'),
});

export const EditListingSchema = ListingSchema.merge(
  z.object({
    owner: UserSchema.omit({
      password: true,
    }),
  }),
)
  .partial()
  .extend({
    id: z.string(),
  });

export const CreateListingSchema = ListingSchema.omit({
  id: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
})
  .extend({
    currency: z.nativeEnum(Currency).optional(),
    images: z.array(UploadImageSchema),
  })
  .partial({
    checkInTime: true,
    checkOutTime: true,
    locationRadius: true,
    petPolicy: true,
    slug: true,
    timeZone: true,
  });

/**
 * This is used in the frontend where values are stringified in the URL
 * and need to be coerced to the correct type.
 */
export const CreateListingSchemaWithCoercion = CreateListingSchema.extend({
  allowPets: z.coerce.boolean(),
  published: z.coerce.boolean(),
  showExactLocation: z.coerce.boolean(),
  pricePerNight: z.coerce.number().or(z.number().nullish()),
  minimumStay: z.coerce.number().int().or(z.number().nullish()),
  maximumGuests: z.coerce.number().int().or(z.number().nullish()),
  locationRadius: z.coerce.number().or(z.number().nullish()),
  latitude: z.coerce.number().or(z.number().nullish()),
  longitude: z.coerce.number().or(z.number().nullish()),
  amenities: z.array(z.string()).optional(),
  images: z
    .array(
      z.object({
        key: z.string(),
        url: z.string(),
        name: z.string(),
      }),
    )
    .min(1, 'At least one image is required')
    .default([]),
});

export const EditListingImagesSchema = z.object({
  listingId: z.string(),
  images: z.array(UploadImageSchema),
});

export const EditInventorySchema = z.object({
  listingId: z.string(),
  inventory: z.array(
    z.object({
      date: z.coerce.date(),
      isAvailable: z.boolean().optional().default(true),
      price: z.number(),
      bookingId: z.string().nullable().optional(),
    }),
  ),
});
//#endregion

//#region Booking Schemas
export const CreateBookingSchema = BookingSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  userId: true,
  bookingRequestId: true,
});

export const UpdateBookingSchema = BookingSchema.extend({
  id: z.string(),
});

export const CancelBookingSchema = z.object({
  bookingId: z.string(),
});

export const GetBookingsSchema = z.object({
  listingId: z.string(),
  take: z.number().optional().default(10),
  skip: z.number().optional().default(0),
});
//#endregion

//#region Booking Request Schemas
export const GetBookingRequestSchema = z.object({
  id: z.string(),
});

export const AlterBookingRequestSchema = z.object({
  bookingRequestId: z.string(),
  checkIn: z.date(),
  checkOut: z.date(),
  guestCount: z.number(),
  message: z.string().optional(),
});

export const CreateBookingRequestSchema = z.object({
  listingId: z.string(),
  checkIn: z.date(),
  checkOut: z.date(),
  guests: z.number(),
  pets: z.boolean(),
  message: z.string(),
});

export const GetBookingRequestsSchema = z.object({
  take: z.number().optional(),
  skip: z.number().optional(),
  status: z.nativeEnum(BookingRequestStatus).optional(),
  listingId: z.string().optional(),
  include: z
    .object({
      user: z.boolean().optional(),
      listing: z.boolean().optional(),
    })
    .optional(),
});

export const BookingRequestResponseSchema = z.object({
  data: z.object({
    bookingRequest: z
      .object({
        id: z.string(),
        userId: z.string(),
        listingId: z.string(),
        checkIn: z.date(),
        checkOut: z.date(),
        guests: z.number(),
        status: z.nativeEnum(BookingRequestStatus),
        message: z.string(),
        pets: z.boolean(),
        totalPrice: z.number(),
        createdAt: z.date(),
        updatedAt: z.date(),
        alterationOf: z.string().nullable(),
        listing: z
          .object({
            id: z.string(),
            title: z.string(),
          })
          .optional(),
        user: z
          .object({
            id: z.string(),
            firstName: z.string().nullable(),
            lastName: z.string().nullable(),
          })
          .optional(),
      })
      .nullable(),
  }),
});

export const ChangeBookingRequestStatusSchema = z.object({
  bookingRequestId: z.string(),
  status: z.nativeEnum(BookingRequestStatus),
});
//#endregion

//#region Email Schemas
export const LocalEmailSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  subject: z.string(),
  html: z.string(),
});
//#endregion

//#region Type Exports
export type SignupFormData = z.infer<typeof SignUpSchema>;
export type UploadImage = z.infer<typeof UploadImageSchema>;
export type CreateBooking = z.infer<typeof CreateBookingSchema>;
export type GetListing = z.infer<typeof GetListingSchema>;
export type CreateListing = z.infer<typeof CreateListingSchema>;
export type CreateListingWithCoercion = z.infer<typeof CreateListingSchemaWithCoercion>;
export type EditInventory = z.infer<typeof EditInventorySchema>;
export type EditListingImages = z.infer<typeof EditListingImagesSchema>;
export type GetBookingRequest = z.infer<typeof GetBookingRequestSchema>;
export type AlterBookingRequest = z.infer<typeof AlterBookingRequestSchema>;
export type CreateBookingRequest = z.infer<typeof CreateBookingRequestSchema>;
export type GetBookingRequests = z.infer<typeof GetBookingRequestsSchema>;
export type BookingRequestResponse = z.infer<typeof BookingRequestResponseSchema>;
export type ChangeBookingRequestStatus = z.infer<typeof ChangeBookingRequestStatusSchema>;
export type GetBookings = z.infer<typeof GetBookingsSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type ClientUser = z.infer<typeof ClientUserSchema>;
export type EmailAddress = z.infer<typeof EmailAddressSchema>;
//#endregion
