import { z } from 'zod';
import type { Prisma } from '@prisma/client';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////


/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const UserRoleScalarFieldEnumSchema = z.enum(['id','role','userId']);

export const UserPermissionScalarFieldEnumSchema = z.enum(['id','permission','userId']);

export const UserScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','firstName','lastName','imageUrl','password']);

export const EmailAddressScalarFieldEnumSchema = z.enum(['id','emailAddress','isPrimary','verification','userId','verified']);

export const ExternalAccountScalarFieldEnumSchema = z.enum(['id','provider','externalId','userId']);

export const UploadedPhotoScalarFieldEnumSchema = z.enum(['id','url','key','name','listingId']);

export const ListingScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','title','slug','description','propertyType','address','latitude','longitude','timeZone','checkInTime','checkOutTime','amenities','pricePerNight','currency','minimumStay','maximumGuests','houseRules','allowPets','petPolicy','published','showExactLocation','locationRadius','ownerId']);

export const ListingInventoryScalarFieldEnumSchema = z.enum(['id','date','isAvailable','price','listingId','bookingId']);

export const BookingScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','checkIn','checkOut','totalPrice','status','userId','bookingRequestId']);

export const BookingRequestScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','message','checkIn','checkOut','guests','pets','totalPrice','status','alterationOf','userId','listingId']);

export const SessionScalarFieldEnumSchema = z.enum(['id','userId','expiresAt','createdAt','lastActive']);

export const PasswordResetScalarFieldEnumSchema = z.enum(['id','userId','token','expiresAt','used']);

export const LocalEmailScalarFieldEnumSchema = z.enum(['id','to','from','subject','html','createdAt']);

export const EarlyAccessSignupScalarFieldEnumSchema = z.enum(['id','email','createdAt']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const QueryModeSchema = z.enum(['default','insensitive']);

export const NullsOrderSchema = z.enum(['first','last']);

export const PermissionSchema = z.enum(['MANAGE_LISTINGS','READ_MEMBERS','MANAGE_BILLING','VIEW_REPORTS','EDIT_SETTINGS','MANAGE_DOMAINS','MANAGE_ORGANIZATION','DELETE_ORGANIZATION','MANAGE_MEMBERS','MANAGE_USERS','MANAGE_ROLES','MANAGE_PERMISSIONS']);

export type PermissionType = `${z.infer<typeof PermissionSchema>}`

export const RoleSchema = z.enum(['ADMIN','HOST','COHOST','GUEST']);

export type RoleType = `${z.infer<typeof RoleSchema>}`

export const CurrencySchema = z.enum(['USD','EUR','GBP','CAD']);

export type CurrencyType = `${z.infer<typeof CurrencySchema>}`

export const BookingStatusSchema = z.enum(['PENDING','ACCEPTED','REJECTED','CANCELLED']);

export type BookingStatusType = `${z.infer<typeof BookingStatusSchema>}`

export const BookingRequestStatusSchema = z.enum(['PENDING','EXPIRED','ACCEPTED','REJECTED','ALTERED']);

export type BookingRequestStatusType = `${z.infer<typeof BookingRequestStatusSchema>}`

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// USER ROLE SCHEMA
/////////////////////////////////////////

export const UserRoleSchema = z.object({
  role: RoleSchema,
  id: z.number().int(),
  userId: z.string(),
})

export type UserRole = z.infer<typeof UserRoleSchema>

/////////////////////////////////////////
// USER PERMISSION SCHEMA
/////////////////////////////////////////

export const UserPermissionSchema = z.object({
  permission: PermissionSchema,
  id: z.number().int(),
  userId: z.string(),
})

export type UserPermission = z.infer<typeof UserPermissionSchema>

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
  id: z.string().cuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  firstName: z.string({required_error: "First name is required" }).nullable(),
  lastName: z.string({required_error: "Last name is required" }).nullable(),
  imageUrl: z.string({required_error: "Image URL must be valid" }).nullable(),
  password: z.string({required_error: "Password must be at least 8 characters" }).nullable(),
})

export type User = z.infer<typeof UserSchema>

/////////////////////////////////////////
// EMAIL ADDRESS SCHEMA
/////////////////////////////////////////

export const EmailAddressSchema = z.object({
  id: z.string().cuid(),
  emailAddress: z.string({required_error: "Email address is required" }).email({ message: "Must be a valid email address" }),
  /**
   * Whether this is the user's primary email address
   */
  isPrimary: z.boolean(),
  /**
   * Verification code for email confirmation
   */
  verification: z.string().nullable(),
  userId: z.string(),
  verified: z.boolean(),
})

export type EmailAddress = z.infer<typeof EmailAddressSchema>

/////////////////////////////////////////
// EXTERNAL ACCOUNT SCHEMA
/////////////////////////////////////////

export const ExternalAccountSchema = z.object({
  id: z.string().cuid(),
  provider: z.string({required_error: "Provider is required" }),
  /**
   * External provider's unique identifier
   */
  externalId: z.string(),
  userId: z.string(),
})

export type ExternalAccount = z.infer<typeof ExternalAccountSchema>

/////////////////////////////////////////
// UPLOADED PHOTO SCHEMA
/////////////////////////////////////////

export const UploadedPhotoSchema = z.object({
  id: z.string().cuid(),
  url: z.string({required_error: "URL is required" }),
  /**
   * Unique storage key for the photo
   */
  key: z.string(),
  /**
   * Original filename
   */
  name: z.string(),
  listingId: z.string().nullable(),
})

export type UploadedPhoto = z.infer<typeof UploadedPhotoSchema>

/////////////////////////////////////////
// LISTING SCHEMA
/////////////////////////////////////////

export const ListingSchema = z.object({
  /**
   * Default currency for the listing
   */
  currency: CurrencySchema,
  id: z.string().cuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  title: z.string({required_error: "Title is required" }),
  slug: z.string({required_error: "Slug is required" }),
  description: z.string({required_error: "Description is required" }),
  propertyType: z.string({required_error: "Property type is required" }),
  address: z.string({required_error: "Address is required" }),
  latitude: z.number({ invalid_type_error: "Latitude must be a number" }).gt(-90, { message: "Latitude must be greater than -90" }).lt(90, { message: "Latitude must be less than 90" }).nullable(),
  longitude: z.number({ invalid_type_error: "Longitude must be a number" }).gt(-180, { message: "Longitude must be greater than -180" }).lt(180, { message: "Longitude must be less than 180" }).nullable(),
  timeZone: z.string({ invalid_type_error: "Time zone is required" }),
  /**
   * HH:MM 24-hour format
   */
  checkInTime: z.string({ invalid_type_error: "Check-in time is required" }),
  /**
   * HH:MM 24-hour format
   */
  checkOutTime: z.string({ invalid_type_error: "Check-out time is required" }),
  /**
   * List of amenities available in the listing
   */
  amenities: z.string().array(),
  pricePerNight: z.number().gt(0, { message: "Price per night must be greater than 0" }),
  minimumStay: z.number().gt(0, { message: "Minimum stay must be greater than 0" }),
  maximumGuests: z.number().gt(0, { message: "Maximum guests must be greater than 0" }),
  houseRules: z.string({ invalid_type_error: "House rules are required" }),
  /**
   * Allow pets in the listing
   */
  allowPets: z.boolean(),
  petPolicy: z.string({ invalid_type_error: "Pet policy is required" }),
  /**
   * is this listing published and visible to guests. Unpublished listings are only visible to the owner.
   */
  published: z.boolean(),
  /**
   * Show listing location on map exactly
   */
  showExactLocation: z.boolean(),
  /**
   * This value is used to determine the radius of the listing on the map.
   * If the user is within this radius, the listing will be shown on the map.
   * If the user is outside this radius, the listing will not be shown on the map.
   */
  locationRadius: z.number(),
  ownerId: z.string(),
})

export type Listing = z.infer<typeof ListingSchema>

/////////////////////////////////////////
// LISTING INVENTORY SCHEMA
/////////////////////////////////////////

export const ListingInventorySchema = z.object({
  id: z.number().int(),
  date: z.coerce.date({ invalid_type_error: "Date is required" }),
  /**
   * is this date available for booking
   */
  isAvailable: z.boolean(),
  /**
   * Price per night for this date
   */
  price: z.number().gt(0, { message: "Price must be greater than 0" }),
  listingId: z.string(),
  bookingId: z.string().nullable(),
})

export type ListingInventory = z.infer<typeof ListingInventorySchema>

/////////////////////////////////////////
// BOOKING SCHEMA
/////////////////////////////////////////

export const BookingSchema = z.object({
  status: BookingStatusSchema,
  id: z.string().cuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  checkIn: z.coerce.date({ invalid_type_error: "Check-in date is required" }),
  checkOut: z.coerce.date({ invalid_type_error: "Check-out date is required" }),
  totalPrice: z.number().positive({ message: "Total price must be greater than 0" }),
  userId: z.string({ invalid_type_error: "User ID is required" }),
  bookingRequestId: z.string().nullable(),
})

export type Booking = z.infer<typeof BookingSchema>

/////////////////////////////////////////
// BOOKING REQUEST SCHEMA
/////////////////////////////////////////

export const BookingRequestSchema = z.object({
  /**
   * Current status of the booking request
   */
  status: BookingRequestStatusSchema,
  id: z.string().cuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  message: z.string({ invalid_type_error: "Message is required" }),
  checkIn: z.coerce.date({ invalid_type_error: "Check-in date is required" }),
  checkOut: z.coerce.date({ invalid_type_error: "Check-out date is required" }),
  guests: z.number().int().min(1, { message: "At least 1 guest is required" }),
  /**
   * Whether pets are included in this booking request
   */
  pets: z.boolean(),
  /**
   * Total price for the booking request calculated from the listing price per night
   */
  totalPrice: z.number().positive({ message: "Total price must be greater than 0" }),
  /**
   * Reference to the original booking request if this is an alteration
   */
  alterationOf: z.string().nullable(),
  userId: z.string(),
  listingId: z.string(),
})

export type BookingRequest = z.infer<typeof BookingRequestSchema>

/////////////////////////////////////////
// SESSION SCHEMA
/////////////////////////////////////////

export const SessionSchema = z.object({
  id: z.string().cuid(),
  userId: z.string(),
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date(),
  lastActive: z.coerce.date(),
})

export type Session = z.infer<typeof SessionSchema>

/////////////////////////////////////////
// PASSWORD RESET SCHEMA
/////////////////////////////////////////

export const PasswordResetSchema = z.object({
  id: z.string().cuid(),
  userId: z.string(),
  token: z.string(),
  expiresAt: z.coerce.date(),
  used: z.boolean(),
})

export type PasswordReset = z.infer<typeof PasswordResetSchema>

/////////////////////////////////////////
// LOCAL EMAIL SCHEMA
/////////////////////////////////////////

/**
 * This is for local development only. Emails are not sent through Resend.
 */
export const LocalEmailSchema = z.object({
  id: z.string().cuid(),
  to: z.string(),
  from: z.string(),
  subject: z.string(),
  html: z.string(),
  createdAt: z.coerce.date(),
})

export type LocalEmail = z.infer<typeof LocalEmailSchema>

/////////////////////////////////////////
// EARLY ACCESS SIGNUP SCHEMA
/////////////////////////////////////////

export const EarlyAccessSignupSchema = z.object({
  id: z.string().cuid(),
  email: z.string(),
  createdAt: z.coerce.date(),
})

export type EarlyAccessSignup = z.infer<typeof EarlyAccessSignupSchema>

/////////////////////////////////////////
// SELECT & INCLUDE
/////////////////////////////////////////

// USER ROLE
//------------------------------------------------------

export const UserRoleIncludeSchema: z.ZodType<Prisma.UserRoleInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const UserRoleArgsSchema: z.ZodType<Prisma.UserRoleDefaultArgs> = z.object({
  select: z.lazy(() => UserRoleSelectSchema).optional(),
  include: z.lazy(() => UserRoleIncludeSchema).optional(),
}).strict();

export const UserRoleSelectSchema: z.ZodType<Prisma.UserRoleSelect> = z.object({
  id: z.boolean().optional(),
  role: z.boolean().optional(),
  userId: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// USER PERMISSION
//------------------------------------------------------

export const UserPermissionIncludeSchema: z.ZodType<Prisma.UserPermissionInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const UserPermissionArgsSchema: z.ZodType<Prisma.UserPermissionDefaultArgs> = z.object({
  select: z.lazy(() => UserPermissionSelectSchema).optional(),
  include: z.lazy(() => UserPermissionIncludeSchema).optional(),
}).strict();

export const UserPermissionSelectSchema: z.ZodType<Prisma.UserPermissionSelect> = z.object({
  id: z.boolean().optional(),
  permission: z.boolean().optional(),
  userId: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// USER
//------------------------------------------------------

export const UserIncludeSchema: z.ZodType<Prisma.UserInclude> = z.object({
  emailAddresses: z.union([z.boolean(),z.lazy(() => EmailAddressFindManyArgsSchema)]).optional(),
  externalAccounts: z.union([z.boolean(),z.lazy(() => ExternalAccountFindManyArgsSchema)]).optional(),
  listings: z.union([z.boolean(),z.lazy(() => ListingFindManyArgsSchema)]).optional(),
  roles: z.union([z.boolean(),z.lazy(() => UserRoleFindManyArgsSchema)]).optional(),
  permissions: z.union([z.boolean(),z.lazy(() => UserPermissionFindManyArgsSchema)]).optional(),
  bookings: z.union([z.boolean(),z.lazy(() => BookingFindManyArgsSchema)]).optional(),
  BookingRequest: z.union([z.boolean(),z.lazy(() => BookingRequestFindManyArgsSchema)]).optional(),
  sessions: z.union([z.boolean(),z.lazy(() => SessionFindManyArgsSchema)]).optional(),
  passwordReset: z.union([z.boolean(),z.lazy(() => PasswordResetFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const UserArgsSchema: z.ZodType<Prisma.UserDefaultArgs> = z.object({
  select: z.lazy(() => UserSelectSchema).optional(),
  include: z.lazy(() => UserIncludeSchema).optional(),
}).strict();

export const UserCountOutputTypeArgsSchema: z.ZodType<Prisma.UserCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => UserCountOutputTypeSelectSchema).nullish(),
}).strict();

export const UserCountOutputTypeSelectSchema: z.ZodType<Prisma.UserCountOutputTypeSelect> = z.object({
  emailAddresses: z.boolean().optional(),
  externalAccounts: z.boolean().optional(),
  listings: z.boolean().optional(),
  roles: z.boolean().optional(),
  permissions: z.boolean().optional(),
  bookings: z.boolean().optional(),
  BookingRequest: z.boolean().optional(),
  sessions: z.boolean().optional(),
  passwordReset: z.boolean().optional(),
}).strict();

export const UserSelectSchema: z.ZodType<Prisma.UserSelect> = z.object({
  id: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  firstName: z.boolean().optional(),
  lastName: z.boolean().optional(),
  imageUrl: z.boolean().optional(),
  password: z.boolean().optional(),
  emailAddresses: z.union([z.boolean(),z.lazy(() => EmailAddressFindManyArgsSchema)]).optional(),
  externalAccounts: z.union([z.boolean(),z.lazy(() => ExternalAccountFindManyArgsSchema)]).optional(),
  listings: z.union([z.boolean(),z.lazy(() => ListingFindManyArgsSchema)]).optional(),
  roles: z.union([z.boolean(),z.lazy(() => UserRoleFindManyArgsSchema)]).optional(),
  permissions: z.union([z.boolean(),z.lazy(() => UserPermissionFindManyArgsSchema)]).optional(),
  bookings: z.union([z.boolean(),z.lazy(() => BookingFindManyArgsSchema)]).optional(),
  BookingRequest: z.union([z.boolean(),z.lazy(() => BookingRequestFindManyArgsSchema)]).optional(),
  sessions: z.union([z.boolean(),z.lazy(() => SessionFindManyArgsSchema)]).optional(),
  passwordReset: z.union([z.boolean(),z.lazy(() => PasswordResetFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
}).strict()

// EMAIL ADDRESS
//------------------------------------------------------

export const EmailAddressIncludeSchema: z.ZodType<Prisma.EmailAddressInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const EmailAddressArgsSchema: z.ZodType<Prisma.EmailAddressDefaultArgs> = z.object({
  select: z.lazy(() => EmailAddressSelectSchema).optional(),
  include: z.lazy(() => EmailAddressIncludeSchema).optional(),
}).strict();

export const EmailAddressSelectSchema: z.ZodType<Prisma.EmailAddressSelect> = z.object({
  id: z.boolean().optional(),
  emailAddress: z.boolean().optional(),
  isPrimary: z.boolean().optional(),
  verification: z.boolean().optional(),
  userId: z.boolean().optional(),
  verified: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// EXTERNAL ACCOUNT
//------------------------------------------------------

export const ExternalAccountIncludeSchema: z.ZodType<Prisma.ExternalAccountInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const ExternalAccountArgsSchema: z.ZodType<Prisma.ExternalAccountDefaultArgs> = z.object({
  select: z.lazy(() => ExternalAccountSelectSchema).optional(),
  include: z.lazy(() => ExternalAccountIncludeSchema).optional(),
}).strict();

export const ExternalAccountSelectSchema: z.ZodType<Prisma.ExternalAccountSelect> = z.object({
  id: z.boolean().optional(),
  provider: z.boolean().optional(),
  externalId: z.boolean().optional(),
  userId: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// UPLOADED PHOTO
//------------------------------------------------------

export const UploadedPhotoIncludeSchema: z.ZodType<Prisma.UploadedPhotoInclude> = z.object({
  Listing: z.union([z.boolean(),z.lazy(() => ListingArgsSchema)]).optional(),
}).strict()

export const UploadedPhotoArgsSchema: z.ZodType<Prisma.UploadedPhotoDefaultArgs> = z.object({
  select: z.lazy(() => UploadedPhotoSelectSchema).optional(),
  include: z.lazy(() => UploadedPhotoIncludeSchema).optional(),
}).strict();

export const UploadedPhotoSelectSchema: z.ZodType<Prisma.UploadedPhotoSelect> = z.object({
  id: z.boolean().optional(),
  url: z.boolean().optional(),
  key: z.boolean().optional(),
  name: z.boolean().optional(),
  listingId: z.boolean().optional(),
  Listing: z.union([z.boolean(),z.lazy(() => ListingArgsSchema)]).optional(),
}).strict()

// LISTING
//------------------------------------------------------

export const ListingIncludeSchema: z.ZodType<Prisma.ListingInclude> = z.object({
  owner: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  images: z.union([z.boolean(),z.lazy(() => UploadedPhotoFindManyArgsSchema)]).optional(),
  inventory: z.union([z.boolean(),z.lazy(() => ListingInventoryFindManyArgsSchema)]).optional(),
  BookingRequest: z.union([z.boolean(),z.lazy(() => BookingRequestFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ListingCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const ListingArgsSchema: z.ZodType<Prisma.ListingDefaultArgs> = z.object({
  select: z.lazy(() => ListingSelectSchema).optional(),
  include: z.lazy(() => ListingIncludeSchema).optional(),
}).strict();

export const ListingCountOutputTypeArgsSchema: z.ZodType<Prisma.ListingCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => ListingCountOutputTypeSelectSchema).nullish(),
}).strict();

export const ListingCountOutputTypeSelectSchema: z.ZodType<Prisma.ListingCountOutputTypeSelect> = z.object({
  images: z.boolean().optional(),
  inventory: z.boolean().optional(),
  BookingRequest: z.boolean().optional(),
}).strict();

export const ListingSelectSchema: z.ZodType<Prisma.ListingSelect> = z.object({
  id: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  title: z.boolean().optional(),
  slug: z.boolean().optional(),
  description: z.boolean().optional(),
  propertyType: z.boolean().optional(),
  address: z.boolean().optional(),
  latitude: z.boolean().optional(),
  longitude: z.boolean().optional(),
  timeZone: z.boolean().optional(),
  checkInTime: z.boolean().optional(),
  checkOutTime: z.boolean().optional(),
  amenities: z.boolean().optional(),
  pricePerNight: z.boolean().optional(),
  currency: z.boolean().optional(),
  minimumStay: z.boolean().optional(),
  maximumGuests: z.boolean().optional(),
  houseRules: z.boolean().optional(),
  allowPets: z.boolean().optional(),
  petPolicy: z.boolean().optional(),
  published: z.boolean().optional(),
  showExactLocation: z.boolean().optional(),
  locationRadius: z.boolean().optional(),
  ownerId: z.boolean().optional(),
  owner: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  images: z.union([z.boolean(),z.lazy(() => UploadedPhotoFindManyArgsSchema)]).optional(),
  inventory: z.union([z.boolean(),z.lazy(() => ListingInventoryFindManyArgsSchema)]).optional(),
  BookingRequest: z.union([z.boolean(),z.lazy(() => BookingRequestFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ListingCountOutputTypeArgsSchema)]).optional(),
}).strict()

// LISTING INVENTORY
//------------------------------------------------------

export const ListingInventoryIncludeSchema: z.ZodType<Prisma.ListingInventoryInclude> = z.object({
  listing: z.union([z.boolean(),z.lazy(() => ListingArgsSchema)]).optional(),
  booking: z.union([z.boolean(),z.lazy(() => BookingArgsSchema)]).optional(),
}).strict()

export const ListingInventoryArgsSchema: z.ZodType<Prisma.ListingInventoryDefaultArgs> = z.object({
  select: z.lazy(() => ListingInventorySelectSchema).optional(),
  include: z.lazy(() => ListingInventoryIncludeSchema).optional(),
}).strict();

export const ListingInventorySelectSchema: z.ZodType<Prisma.ListingInventorySelect> = z.object({
  id: z.boolean().optional(),
  date: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  price: z.boolean().optional(),
  listingId: z.boolean().optional(),
  bookingId: z.boolean().optional(),
  listing: z.union([z.boolean(),z.lazy(() => ListingArgsSchema)]).optional(),
  booking: z.union([z.boolean(),z.lazy(() => BookingArgsSchema)]).optional(),
}).strict()

// BOOKING
//------------------------------------------------------

export const BookingIncludeSchema: z.ZodType<Prisma.BookingInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  bookingRequest: z.union([z.boolean(),z.lazy(() => BookingRequestArgsSchema)]).optional(),
  listingInventory: z.union([z.boolean(),z.lazy(() => ListingInventoryFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => BookingCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const BookingArgsSchema: z.ZodType<Prisma.BookingDefaultArgs> = z.object({
  select: z.lazy(() => BookingSelectSchema).optional(),
  include: z.lazy(() => BookingIncludeSchema).optional(),
}).strict();

export const BookingCountOutputTypeArgsSchema: z.ZodType<Prisma.BookingCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => BookingCountOutputTypeSelectSchema).nullish(),
}).strict();

export const BookingCountOutputTypeSelectSchema: z.ZodType<Prisma.BookingCountOutputTypeSelect> = z.object({
  listingInventory: z.boolean().optional(),
}).strict();

export const BookingSelectSchema: z.ZodType<Prisma.BookingSelect> = z.object({
  id: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  checkIn: z.boolean().optional(),
  checkOut: z.boolean().optional(),
  totalPrice: z.boolean().optional(),
  status: z.boolean().optional(),
  userId: z.boolean().optional(),
  bookingRequestId: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  bookingRequest: z.union([z.boolean(),z.lazy(() => BookingRequestArgsSchema)]).optional(),
  listingInventory: z.union([z.boolean(),z.lazy(() => ListingInventoryFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => BookingCountOutputTypeArgsSchema)]).optional(),
}).strict()

// BOOKING REQUEST
//------------------------------------------------------

export const BookingRequestIncludeSchema: z.ZodType<Prisma.BookingRequestInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  listing: z.union([z.boolean(),z.lazy(() => ListingArgsSchema)]).optional(),
  Booking: z.union([z.boolean(),z.lazy(() => BookingFindManyArgsSchema)]).optional(),
  originalRequest: z.union([z.boolean(),z.lazy(() => BookingRequestArgsSchema)]).optional(),
  alterations: z.union([z.boolean(),z.lazy(() => BookingRequestFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => BookingRequestCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const BookingRequestArgsSchema: z.ZodType<Prisma.BookingRequestDefaultArgs> = z.object({
  select: z.lazy(() => BookingRequestSelectSchema).optional(),
  include: z.lazy(() => BookingRequestIncludeSchema).optional(),
}).strict();

export const BookingRequestCountOutputTypeArgsSchema: z.ZodType<Prisma.BookingRequestCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => BookingRequestCountOutputTypeSelectSchema).nullish(),
}).strict();

export const BookingRequestCountOutputTypeSelectSchema: z.ZodType<Prisma.BookingRequestCountOutputTypeSelect> = z.object({
  Booking: z.boolean().optional(),
  alterations: z.boolean().optional(),
}).strict();

export const BookingRequestSelectSchema: z.ZodType<Prisma.BookingRequestSelect> = z.object({
  id: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  message: z.boolean().optional(),
  checkIn: z.boolean().optional(),
  checkOut: z.boolean().optional(),
  guests: z.boolean().optional(),
  pets: z.boolean().optional(),
  totalPrice: z.boolean().optional(),
  status: z.boolean().optional(),
  alterationOf: z.boolean().optional(),
  userId: z.boolean().optional(),
  listingId: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  listing: z.union([z.boolean(),z.lazy(() => ListingArgsSchema)]).optional(),
  Booking: z.union([z.boolean(),z.lazy(() => BookingFindManyArgsSchema)]).optional(),
  originalRequest: z.union([z.boolean(),z.lazy(() => BookingRequestArgsSchema)]).optional(),
  alterations: z.union([z.boolean(),z.lazy(() => BookingRequestFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => BookingRequestCountOutputTypeArgsSchema)]).optional(),
}).strict()

// SESSION
//------------------------------------------------------

export const SessionIncludeSchema: z.ZodType<Prisma.SessionInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const SessionArgsSchema: z.ZodType<Prisma.SessionDefaultArgs> = z.object({
  select: z.lazy(() => SessionSelectSchema).optional(),
  include: z.lazy(() => SessionIncludeSchema).optional(),
}).strict();

export const SessionSelectSchema: z.ZodType<Prisma.SessionSelect> = z.object({
  id: z.boolean().optional(),
  userId: z.boolean().optional(),
  expiresAt: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  lastActive: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// PASSWORD RESET
//------------------------------------------------------

export const PasswordResetIncludeSchema: z.ZodType<Prisma.PasswordResetInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const PasswordResetArgsSchema: z.ZodType<Prisma.PasswordResetDefaultArgs> = z.object({
  select: z.lazy(() => PasswordResetSelectSchema).optional(),
  include: z.lazy(() => PasswordResetIncludeSchema).optional(),
}).strict();

export const PasswordResetSelectSchema: z.ZodType<Prisma.PasswordResetSelect> = z.object({
  id: z.boolean().optional(),
  userId: z.boolean().optional(),
  token: z.boolean().optional(),
  expiresAt: z.boolean().optional(),
  used: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// LOCAL EMAIL
//------------------------------------------------------

export const LocalEmailSelectSchema: z.ZodType<Prisma.LocalEmailSelect> = z.object({
  id: z.boolean().optional(),
  to: z.boolean().optional(),
  from: z.boolean().optional(),
  subject: z.boolean().optional(),
  html: z.boolean().optional(),
  createdAt: z.boolean().optional(),
}).strict()

// EARLY ACCESS SIGNUP
//------------------------------------------------------

export const EarlyAccessSignupSelectSchema: z.ZodType<Prisma.EarlyAccessSignupSelect> = z.object({
  id: z.boolean().optional(),
  email: z.boolean().optional(),
  createdAt: z.boolean().optional(),
}).strict()


/////////////////////////////////////////
// INPUT TYPES
/////////////////////////////////////////

export const UserRoleWhereInputSchema: z.ZodType<Prisma.UserRoleWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserRoleWhereInputSchema),z.lazy(() => UserRoleWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserRoleWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserRoleWhereInputSchema),z.lazy(() => UserRoleWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  role: z.union([ z.lazy(() => EnumRoleFilterSchema),z.lazy(() => RoleSchema) ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict();

export const UserRoleOrderByWithRelationInputSchema: z.ZodType<Prisma.UserRoleOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict();

export const UserRoleWhereUniqueInputSchema: z.ZodType<Prisma.UserRoleWhereUniqueInput> = z.union([
  z.object({
    id: z.number().int(),
    userId_role: z.lazy(() => UserRoleUserIdRoleCompoundUniqueInputSchema)
  }),
  z.object({
    id: z.number().int(),
  }),
  z.object({
    userId_role: z.lazy(() => UserRoleUserIdRoleCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  id: z.number().int().optional(),
  userId_role: z.lazy(() => UserRoleUserIdRoleCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => UserRoleWhereInputSchema),z.lazy(() => UserRoleWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserRoleWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserRoleWhereInputSchema),z.lazy(() => UserRoleWhereInputSchema).array() ]).optional(),
  role: z.union([ z.lazy(() => EnumRoleFilterSchema),z.lazy(() => RoleSchema) ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict());

export const UserRoleOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserRoleOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => UserRoleCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => UserRoleAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserRoleMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserRoleMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => UserRoleSumOrderByAggregateInputSchema).optional()
}).strict();

export const UserRoleScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserRoleScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => UserRoleScalarWhereWithAggregatesInputSchema),z.lazy(() => UserRoleScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserRoleScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserRoleScalarWhereWithAggregatesInputSchema),z.lazy(() => UserRoleScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  role: z.union([ z.lazy(() => EnumRoleWithAggregatesFilterSchema),z.lazy(() => RoleSchema) ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict();

export const UserPermissionWhereInputSchema: z.ZodType<Prisma.UserPermissionWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserPermissionWhereInputSchema),z.lazy(() => UserPermissionWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserPermissionWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserPermissionWhereInputSchema),z.lazy(() => UserPermissionWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  permission: z.union([ z.lazy(() => EnumPermissionFilterSchema),z.lazy(() => PermissionSchema) ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict();

export const UserPermissionOrderByWithRelationInputSchema: z.ZodType<Prisma.UserPermissionOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  permission: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict();

export const UserPermissionWhereUniqueInputSchema: z.ZodType<Prisma.UserPermissionWhereUniqueInput> = z.union([
  z.object({
    id: z.number().int(),
    userId_permission: z.lazy(() => UserPermissionUserIdPermissionCompoundUniqueInputSchema)
  }),
  z.object({
    id: z.number().int(),
  }),
  z.object({
    userId_permission: z.lazy(() => UserPermissionUserIdPermissionCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  id: z.number().int().optional(),
  userId_permission: z.lazy(() => UserPermissionUserIdPermissionCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => UserPermissionWhereInputSchema),z.lazy(() => UserPermissionWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserPermissionWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserPermissionWhereInputSchema),z.lazy(() => UserPermissionWhereInputSchema).array() ]).optional(),
  permission: z.union([ z.lazy(() => EnumPermissionFilterSchema),z.lazy(() => PermissionSchema) ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict());

export const UserPermissionOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserPermissionOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  permission: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => UserPermissionCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => UserPermissionAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserPermissionMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserPermissionMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => UserPermissionSumOrderByAggregateInputSchema).optional()
}).strict();

export const UserPermissionScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserPermissionScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => UserPermissionScalarWhereWithAggregatesInputSchema),z.lazy(() => UserPermissionScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserPermissionScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserPermissionScalarWhereWithAggregatesInputSchema),z.lazy(() => UserPermissionScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  permission: z.union([ z.lazy(() => EnumPermissionWithAggregatesFilterSchema),z.lazy(() => PermissionSchema) ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict();

export const UserWhereInputSchema: z.ZodType<Prisma.UserWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  firstName: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  lastName: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  imageUrl: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  password: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  emailAddresses: z.lazy(() => EmailAddressListRelationFilterSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountListRelationFilterSchema).optional(),
  listings: z.lazy(() => ListingListRelationFilterSchema).optional(),
  roles: z.lazy(() => UserRoleListRelationFilterSchema).optional(),
  permissions: z.lazy(() => UserPermissionListRelationFilterSchema).optional(),
  bookings: z.lazy(() => BookingListRelationFilterSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestListRelationFilterSchema).optional(),
  sessions: z.lazy(() => SessionListRelationFilterSchema).optional(),
  passwordReset: z.lazy(() => PasswordResetListRelationFilterSchema).optional()
}).strict();

export const UserOrderByWithRelationInputSchema: z.ZodType<Prisma.UserOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  lastName: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  imageUrl: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  password: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  emailAddresses: z.lazy(() => EmailAddressOrderByRelationAggregateInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountOrderByRelationAggregateInputSchema).optional(),
  listings: z.lazy(() => ListingOrderByRelationAggregateInputSchema).optional(),
  roles: z.lazy(() => UserRoleOrderByRelationAggregateInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionOrderByRelationAggregateInputSchema).optional(),
  bookings: z.lazy(() => BookingOrderByRelationAggregateInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestOrderByRelationAggregateInputSchema).optional(),
  sessions: z.lazy(() => SessionOrderByRelationAggregateInputSchema).optional(),
  passwordReset: z.lazy(() => PasswordResetOrderByRelationAggregateInputSchema).optional()
}).strict();

export const UserWhereUniqueInputSchema: z.ZodType<Prisma.UserWhereUniqueInput> = z.object({
  id: z.string().cuid()
})
.and(z.object({
  id: z.string().cuid().optional(),
  AND: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  firstName: z.union([ z.lazy(() => StringNullableFilterSchema),z.string({required_error: "First name is required" }) ]).optional().nullable(),
  lastName: z.union([ z.lazy(() => StringNullableFilterSchema),z.string({required_error: "Last name is required" }) ]).optional().nullable(),
  imageUrl: z.union([ z.lazy(() => StringNullableFilterSchema),z.string({required_error: "Image URL must be valid" }) ]).optional().nullable(),
  password: z.union([ z.lazy(() => StringNullableFilterSchema),z.string({required_error: "Password must be at least 8 characters" }) ]).optional().nullable(),
  emailAddresses: z.lazy(() => EmailAddressListRelationFilterSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountListRelationFilterSchema).optional(),
  listings: z.lazy(() => ListingListRelationFilterSchema).optional(),
  roles: z.lazy(() => UserRoleListRelationFilterSchema).optional(),
  permissions: z.lazy(() => UserPermissionListRelationFilterSchema).optional(),
  bookings: z.lazy(() => BookingListRelationFilterSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestListRelationFilterSchema).optional(),
  sessions: z.lazy(() => SessionListRelationFilterSchema).optional(),
  passwordReset: z.lazy(() => PasswordResetListRelationFilterSchema).optional()
}).strict());

export const UserOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  lastName: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  imageUrl: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  password: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => UserCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserMinOrderByAggregateInputSchema).optional()
}).strict();

export const UserScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => UserScalarWhereWithAggregatesInputSchema),z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserScalarWhereWithAggregatesInputSchema),z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  firstName: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  lastName: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  imageUrl: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  password: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export const EmailAddressWhereInputSchema: z.ZodType<Prisma.EmailAddressWhereInput> = z.object({
  AND: z.union([ z.lazy(() => EmailAddressWhereInputSchema),z.lazy(() => EmailAddressWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => EmailAddressWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EmailAddressWhereInputSchema),z.lazy(() => EmailAddressWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  emailAddress: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  isPrimary: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  verification: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  verified: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict();

export const EmailAddressOrderByWithRelationInputSchema: z.ZodType<Prisma.EmailAddressOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  emailAddress: z.lazy(() => SortOrderSchema).optional(),
  isPrimary: z.lazy(() => SortOrderSchema).optional(),
  verification: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  verified: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict();

export const EmailAddressWhereUniqueInputSchema: z.ZodType<Prisma.EmailAddressWhereUniqueInput> = z.union([
  z.object({
    id: z.string().cuid(),
    emailAddress: z.string({required_error: "Email address is required" }).email({ message: "Must be a valid email address" })
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    emailAddress: z.string({required_error: "Email address is required" }).email({ message: "Must be a valid email address" }),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  emailAddress: z.string({required_error: "Email address is required" }).email({ message: "Must be a valid email address" }).optional(),
  AND: z.union([ z.lazy(() => EmailAddressWhereInputSchema),z.lazy(() => EmailAddressWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => EmailAddressWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EmailAddressWhereInputSchema),z.lazy(() => EmailAddressWhereInputSchema).array() ]).optional(),
  isPrimary: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  verification: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  verified: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict());

export const EmailAddressOrderByWithAggregationInputSchema: z.ZodType<Prisma.EmailAddressOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  emailAddress: z.lazy(() => SortOrderSchema).optional(),
  isPrimary: z.lazy(() => SortOrderSchema).optional(),
  verification: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  verified: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => EmailAddressCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => EmailAddressMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => EmailAddressMinOrderByAggregateInputSchema).optional()
}).strict();

export const EmailAddressScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.EmailAddressScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => EmailAddressScalarWhereWithAggregatesInputSchema),z.lazy(() => EmailAddressScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => EmailAddressScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EmailAddressScalarWhereWithAggregatesInputSchema),z.lazy(() => EmailAddressScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  emailAddress: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  isPrimary: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  verification: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  verified: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
}).strict();

export const ExternalAccountWhereInputSchema: z.ZodType<Prisma.ExternalAccountWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ExternalAccountWhereInputSchema),z.lazy(() => ExternalAccountWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ExternalAccountWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ExternalAccountWhereInputSchema),z.lazy(() => ExternalAccountWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  provider: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  externalId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict();

export const ExternalAccountOrderByWithRelationInputSchema: z.ZodType<Prisma.ExternalAccountOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  provider: z.lazy(() => SortOrderSchema).optional(),
  externalId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict();

export const ExternalAccountWhereUniqueInputSchema: z.ZodType<Prisma.ExternalAccountWhereUniqueInput> = z.union([
  z.object({
    id: z.string().cuid(),
    provider_externalId: z.lazy(() => ExternalAccountProviderExternalIdCompoundUniqueInputSchema)
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    provider_externalId: z.lazy(() => ExternalAccountProviderExternalIdCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  provider_externalId: z.lazy(() => ExternalAccountProviderExternalIdCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => ExternalAccountWhereInputSchema),z.lazy(() => ExternalAccountWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ExternalAccountWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ExternalAccountWhereInputSchema),z.lazy(() => ExternalAccountWhereInputSchema).array() ]).optional(),
  provider: z.union([ z.lazy(() => StringFilterSchema),z.string({required_error: "Provider is required" }) ]).optional(),
  externalId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict());

export const ExternalAccountOrderByWithAggregationInputSchema: z.ZodType<Prisma.ExternalAccountOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  provider: z.lazy(() => SortOrderSchema).optional(),
  externalId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => ExternalAccountCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ExternalAccountMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ExternalAccountMinOrderByAggregateInputSchema).optional()
}).strict();

export const ExternalAccountScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ExternalAccountScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => ExternalAccountScalarWhereWithAggregatesInputSchema),z.lazy(() => ExternalAccountScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ExternalAccountScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ExternalAccountScalarWhereWithAggregatesInputSchema),z.lazy(() => ExternalAccountScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  provider: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  externalId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict();

export const UploadedPhotoWhereInputSchema: z.ZodType<Prisma.UploadedPhotoWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UploadedPhotoWhereInputSchema),z.lazy(() => UploadedPhotoWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UploadedPhotoWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UploadedPhotoWhereInputSchema),z.lazy(() => UploadedPhotoWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  url: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  key: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  listingId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  Listing: z.union([ z.lazy(() => ListingNullableScalarRelationFilterSchema),z.lazy(() => ListingWhereInputSchema) ]).optional().nullable(),
}).strict();

export const UploadedPhotoOrderByWithRelationInputSchema: z.ZodType<Prisma.UploadedPhotoOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  url: z.lazy(() => SortOrderSchema).optional(),
  key: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  listingId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  Listing: z.lazy(() => ListingOrderByWithRelationInputSchema).optional()
}).strict();

export const UploadedPhotoWhereUniqueInputSchema: z.ZodType<Prisma.UploadedPhotoWhereUniqueInput> = z.union([
  z.object({
    id: z.string().cuid(),
    key: z.string()
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    key: z.string(),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  key: z.string().optional(),
  AND: z.union([ z.lazy(() => UploadedPhotoWhereInputSchema),z.lazy(() => UploadedPhotoWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UploadedPhotoWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UploadedPhotoWhereInputSchema),z.lazy(() => UploadedPhotoWhereInputSchema).array() ]).optional(),
  url: z.union([ z.lazy(() => StringFilterSchema),z.string({required_error: "URL is required" }) ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  listingId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  Listing: z.union([ z.lazy(() => ListingNullableScalarRelationFilterSchema),z.lazy(() => ListingWhereInputSchema) ]).optional().nullable(),
}).strict());

export const UploadedPhotoOrderByWithAggregationInputSchema: z.ZodType<Prisma.UploadedPhotoOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  url: z.lazy(() => SortOrderSchema).optional(),
  key: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  listingId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => UploadedPhotoCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UploadedPhotoMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UploadedPhotoMinOrderByAggregateInputSchema).optional()
}).strict();

export const UploadedPhotoScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UploadedPhotoScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => UploadedPhotoScalarWhereWithAggregatesInputSchema),z.lazy(() => UploadedPhotoScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UploadedPhotoScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UploadedPhotoScalarWhereWithAggregatesInputSchema),z.lazy(() => UploadedPhotoScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  url: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  key: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  listingId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export const ListingWhereInputSchema: z.ZodType<Prisma.ListingWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ListingWhereInputSchema),z.lazy(() => ListingWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ListingWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ListingWhereInputSchema),z.lazy(() => ListingWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  title: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  slug: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  propertyType: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  address: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  latitude: z.union([ z.lazy(() => FloatNullableFilterSchema),z.number() ]).optional().nullable(),
  longitude: z.union([ z.lazy(() => FloatNullableFilterSchema),z.number() ]).optional().nullable(),
  timeZone: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  checkInTime: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  checkOutTime: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  amenities: z.lazy(() => StringNullableListFilterSchema).optional(),
  pricePerNight: z.union([ z.lazy(() => FloatFilterSchema),z.number() ]).optional(),
  currency: z.union([ z.lazy(() => EnumCurrencyFilterSchema),z.lazy(() => CurrencySchema) ]).optional(),
  minimumStay: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  maximumGuests: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  houseRules: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  allowPets: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  petPolicy: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  published: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  showExactLocation: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  locationRadius: z.union([ z.lazy(() => FloatFilterSchema),z.number() ]).optional(),
  ownerId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  owner: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  images: z.lazy(() => UploadedPhotoListRelationFilterSchema).optional(),
  inventory: z.lazy(() => ListingInventoryListRelationFilterSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestListRelationFilterSchema).optional()
}).strict();

export const ListingOrderByWithRelationInputSchema: z.ZodType<Prisma.ListingOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  propertyType: z.lazy(() => SortOrderSchema).optional(),
  address: z.lazy(() => SortOrderSchema).optional(),
  latitude: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  longitude: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  timeZone: z.lazy(() => SortOrderSchema).optional(),
  checkInTime: z.lazy(() => SortOrderSchema).optional(),
  checkOutTime: z.lazy(() => SortOrderSchema).optional(),
  amenities: z.lazy(() => SortOrderSchema).optional(),
  pricePerNight: z.lazy(() => SortOrderSchema).optional(),
  currency: z.lazy(() => SortOrderSchema).optional(),
  minimumStay: z.lazy(() => SortOrderSchema).optional(),
  maximumGuests: z.lazy(() => SortOrderSchema).optional(),
  houseRules: z.lazy(() => SortOrderSchema).optional(),
  allowPets: z.lazy(() => SortOrderSchema).optional(),
  petPolicy: z.lazy(() => SortOrderSchema).optional(),
  published: z.lazy(() => SortOrderSchema).optional(),
  showExactLocation: z.lazy(() => SortOrderSchema).optional(),
  locationRadius: z.lazy(() => SortOrderSchema).optional(),
  ownerId: z.lazy(() => SortOrderSchema).optional(),
  owner: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  images: z.lazy(() => UploadedPhotoOrderByRelationAggregateInputSchema).optional(),
  inventory: z.lazy(() => ListingInventoryOrderByRelationAggregateInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestOrderByRelationAggregateInputSchema).optional()
}).strict();

export const ListingWhereUniqueInputSchema: z.ZodType<Prisma.ListingWhereUniqueInput> = z.object({
  id: z.string().cuid()
})
.and(z.object({
  id: z.string().cuid().optional(),
  AND: z.union([ z.lazy(() => ListingWhereInputSchema),z.lazy(() => ListingWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ListingWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ListingWhereInputSchema),z.lazy(() => ListingWhereInputSchema).array() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  title: z.union([ z.lazy(() => StringFilterSchema),z.string({required_error: "Title is required" }) ]).optional(),
  slug: z.union([ z.lazy(() => StringFilterSchema),z.string({required_error: "Slug is required" }) ]).optional(),
  description: z.union([ z.lazy(() => StringFilterSchema),z.string({required_error: "Description is required" }) ]).optional(),
  propertyType: z.union([ z.lazy(() => StringFilterSchema),z.string({required_error: "Property type is required" }) ]).optional(),
  address: z.union([ z.lazy(() => StringFilterSchema),z.string({required_error: "Address is required" }) ]).optional(),
  latitude: z.union([ z.lazy(() => FloatNullableFilterSchema),z.number({ invalid_type_error: "Latitude must be a number" }).gt(-90, { message: "Latitude must be greater than -90" }).lt(90, { message: "Latitude must be less than 90" }) ]).optional().nullable(),
  longitude: z.union([ z.lazy(() => FloatNullableFilterSchema),z.number({ invalid_type_error: "Longitude must be a number" }).gt(-180, { message: "Longitude must be greater than -180" }).lt(180, { message: "Longitude must be less than 180" }) ]).optional().nullable(),
  timeZone: z.union([ z.lazy(() => StringFilterSchema),z.string({ invalid_type_error: "Time zone is required" }) ]).optional(),
  checkInTime: z.union([ z.lazy(() => StringFilterSchema),z.string({ invalid_type_error: "Check-in time is required" }) ]).optional(),
  checkOutTime: z.union([ z.lazy(() => StringFilterSchema),z.string({ invalid_type_error: "Check-out time is required" }) ]).optional(),
  amenities: z.lazy(() => StringNullableListFilterSchema).optional(),
  pricePerNight: z.union([ z.lazy(() => FloatFilterSchema),z.number().gt(0, { message: "Price per night must be greater than 0" }) ]).optional(),
  currency: z.union([ z.lazy(() => EnumCurrencyFilterSchema),z.lazy(() => CurrencySchema) ]).optional(),
  minimumStay: z.union([ z.lazy(() => IntFilterSchema),z.number().gt(0, { message: "Minimum stay must be greater than 0" }) ]).optional(),
  maximumGuests: z.union([ z.lazy(() => IntFilterSchema),z.number().gt(0, { message: "Maximum guests must be greater than 0" }) ]).optional(),
  houseRules: z.union([ z.lazy(() => StringFilterSchema),z.string({ invalid_type_error: "House rules are required" }) ]).optional(),
  allowPets: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  petPolicy: z.union([ z.lazy(() => StringFilterSchema),z.string({ invalid_type_error: "Pet policy is required" }) ]).optional(),
  published: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  showExactLocation: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  locationRadius: z.union([ z.lazy(() => FloatFilterSchema),z.number() ]).optional(),
  ownerId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  owner: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  images: z.lazy(() => UploadedPhotoListRelationFilterSchema).optional(),
  inventory: z.lazy(() => ListingInventoryListRelationFilterSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestListRelationFilterSchema).optional()
}).strict());

export const ListingOrderByWithAggregationInputSchema: z.ZodType<Prisma.ListingOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  propertyType: z.lazy(() => SortOrderSchema).optional(),
  address: z.lazy(() => SortOrderSchema).optional(),
  latitude: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  longitude: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  timeZone: z.lazy(() => SortOrderSchema).optional(),
  checkInTime: z.lazy(() => SortOrderSchema).optional(),
  checkOutTime: z.lazy(() => SortOrderSchema).optional(),
  amenities: z.lazy(() => SortOrderSchema).optional(),
  pricePerNight: z.lazy(() => SortOrderSchema).optional(),
  currency: z.lazy(() => SortOrderSchema).optional(),
  minimumStay: z.lazy(() => SortOrderSchema).optional(),
  maximumGuests: z.lazy(() => SortOrderSchema).optional(),
  houseRules: z.lazy(() => SortOrderSchema).optional(),
  allowPets: z.lazy(() => SortOrderSchema).optional(),
  petPolicy: z.lazy(() => SortOrderSchema).optional(),
  published: z.lazy(() => SortOrderSchema).optional(),
  showExactLocation: z.lazy(() => SortOrderSchema).optional(),
  locationRadius: z.lazy(() => SortOrderSchema).optional(),
  ownerId: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => ListingCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => ListingAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ListingMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ListingMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => ListingSumOrderByAggregateInputSchema).optional()
}).strict();

export const ListingScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ListingScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => ListingScalarWhereWithAggregatesInputSchema),z.lazy(() => ListingScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ListingScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ListingScalarWhereWithAggregatesInputSchema),z.lazy(() => ListingScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  title: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  slug: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  propertyType: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  address: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  latitude: z.union([ z.lazy(() => FloatNullableWithAggregatesFilterSchema),z.number() ]).optional().nullable(),
  longitude: z.union([ z.lazy(() => FloatNullableWithAggregatesFilterSchema),z.number() ]).optional().nullable(),
  timeZone: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  checkInTime: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  checkOutTime: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  amenities: z.lazy(() => StringNullableListFilterSchema).optional(),
  pricePerNight: z.union([ z.lazy(() => FloatWithAggregatesFilterSchema),z.number() ]).optional(),
  currency: z.union([ z.lazy(() => EnumCurrencyWithAggregatesFilterSchema),z.lazy(() => CurrencySchema) ]).optional(),
  minimumStay: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  maximumGuests: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  houseRules: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  allowPets: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  petPolicy: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  published: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  showExactLocation: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  locationRadius: z.union([ z.lazy(() => FloatWithAggregatesFilterSchema),z.number() ]).optional(),
  ownerId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict();

export const ListingInventoryWhereInputSchema: z.ZodType<Prisma.ListingInventoryWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ListingInventoryWhereInputSchema),z.lazy(() => ListingInventoryWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ListingInventoryWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ListingInventoryWhereInputSchema),z.lazy(() => ListingInventoryWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  date: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  isAvailable: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  price: z.union([ z.lazy(() => FloatFilterSchema),z.number() ]).optional(),
  listingId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  bookingId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  listing: z.union([ z.lazy(() => ListingScalarRelationFilterSchema),z.lazy(() => ListingWhereInputSchema) ]).optional(),
  booking: z.union([ z.lazy(() => BookingNullableScalarRelationFilterSchema),z.lazy(() => BookingWhereInputSchema) ]).optional().nullable(),
}).strict();

export const ListingInventoryOrderByWithRelationInputSchema: z.ZodType<Prisma.ListingInventoryOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  date: z.lazy(() => SortOrderSchema).optional(),
  isAvailable: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  listingId: z.lazy(() => SortOrderSchema).optional(),
  bookingId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  listing: z.lazy(() => ListingOrderByWithRelationInputSchema).optional(),
  booking: z.lazy(() => BookingOrderByWithRelationInputSchema).optional()
}).strict();

export const ListingInventoryWhereUniqueInputSchema: z.ZodType<Prisma.ListingInventoryWhereUniqueInput> = z.union([
  z.object({
    id: z.number().int(),
    listingId_date: z.lazy(() => ListingInventoryListingIdDateCompoundUniqueInputSchema)
  }),
  z.object({
    id: z.number().int(),
  }),
  z.object({
    listingId_date: z.lazy(() => ListingInventoryListingIdDateCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  id: z.number().int().optional(),
  listingId_date: z.lazy(() => ListingInventoryListingIdDateCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => ListingInventoryWhereInputSchema),z.lazy(() => ListingInventoryWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ListingInventoryWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ListingInventoryWhereInputSchema),z.lazy(() => ListingInventoryWhereInputSchema).array() ]).optional(),
  date: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date({ invalid_type_error: "Date is required" }) ]).optional(),
  isAvailable: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  price: z.union([ z.lazy(() => FloatFilterSchema),z.number().gt(0, { message: "Price must be greater than 0" }) ]).optional(),
  listingId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  bookingId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  listing: z.union([ z.lazy(() => ListingScalarRelationFilterSchema),z.lazy(() => ListingWhereInputSchema) ]).optional(),
  booking: z.union([ z.lazy(() => BookingNullableScalarRelationFilterSchema),z.lazy(() => BookingWhereInputSchema) ]).optional().nullable(),
}).strict());

export const ListingInventoryOrderByWithAggregationInputSchema: z.ZodType<Prisma.ListingInventoryOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  date: z.lazy(() => SortOrderSchema).optional(),
  isAvailable: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  listingId: z.lazy(() => SortOrderSchema).optional(),
  bookingId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => ListingInventoryCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => ListingInventoryAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ListingInventoryMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ListingInventoryMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => ListingInventorySumOrderByAggregateInputSchema).optional()
}).strict();

export const ListingInventoryScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ListingInventoryScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => ListingInventoryScalarWhereWithAggregatesInputSchema),z.lazy(() => ListingInventoryScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ListingInventoryScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ListingInventoryScalarWhereWithAggregatesInputSchema),z.lazy(() => ListingInventoryScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  date: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  isAvailable: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  price: z.union([ z.lazy(() => FloatWithAggregatesFilterSchema),z.number() ]).optional(),
  listingId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  bookingId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export const BookingWhereInputSchema: z.ZodType<Prisma.BookingWhereInput> = z.object({
  AND: z.union([ z.lazy(() => BookingWhereInputSchema),z.lazy(() => BookingWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => BookingWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BookingWhereInputSchema),z.lazy(() => BookingWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  checkIn: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  checkOut: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  totalPrice: z.union([ z.lazy(() => FloatFilterSchema),z.number() ]).optional(),
  status: z.union([ z.lazy(() => EnumBookingStatusFilterSchema),z.lazy(() => BookingStatusSchema) ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  bookingRequestId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  bookingRequest: z.union([ z.lazy(() => BookingRequestNullableScalarRelationFilterSchema),z.lazy(() => BookingRequestWhereInputSchema) ]).optional().nullable(),
  listingInventory: z.lazy(() => ListingInventoryListRelationFilterSchema).optional()
}).strict();

export const BookingOrderByWithRelationInputSchema: z.ZodType<Prisma.BookingOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  checkIn: z.lazy(() => SortOrderSchema).optional(),
  checkOut: z.lazy(() => SortOrderSchema).optional(),
  totalPrice: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  bookingRequestId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  bookingRequest: z.lazy(() => BookingRequestOrderByWithRelationInputSchema).optional(),
  listingInventory: z.lazy(() => ListingInventoryOrderByRelationAggregateInputSchema).optional()
}).strict();

export const BookingWhereUniqueInputSchema: z.ZodType<Prisma.BookingWhereUniqueInput> = z.object({
  id: z.string().cuid()
})
.and(z.object({
  id: z.string().cuid().optional(),
  AND: z.union([ z.lazy(() => BookingWhereInputSchema),z.lazy(() => BookingWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => BookingWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BookingWhereInputSchema),z.lazy(() => BookingWhereInputSchema).array() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  checkIn: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date({ invalid_type_error: "Check-in date is required" }) ]).optional(),
  checkOut: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date({ invalid_type_error: "Check-out date is required" }) ]).optional(),
  totalPrice: z.union([ z.lazy(() => FloatFilterSchema),z.number().positive({ message: "Total price must be greater than 0" }) ]).optional(),
  status: z.union([ z.lazy(() => EnumBookingStatusFilterSchema),z.lazy(() => BookingStatusSchema) ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string({ invalid_type_error: "User ID is required" }) ]).optional(),
  bookingRequestId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  bookingRequest: z.union([ z.lazy(() => BookingRequestNullableScalarRelationFilterSchema),z.lazy(() => BookingRequestWhereInputSchema) ]).optional().nullable(),
  listingInventory: z.lazy(() => ListingInventoryListRelationFilterSchema).optional()
}).strict());

export const BookingOrderByWithAggregationInputSchema: z.ZodType<Prisma.BookingOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  checkIn: z.lazy(() => SortOrderSchema).optional(),
  checkOut: z.lazy(() => SortOrderSchema).optional(),
  totalPrice: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  bookingRequestId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => BookingCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => BookingAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => BookingMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => BookingMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => BookingSumOrderByAggregateInputSchema).optional()
}).strict();

export const BookingScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.BookingScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => BookingScalarWhereWithAggregatesInputSchema),z.lazy(() => BookingScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => BookingScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BookingScalarWhereWithAggregatesInputSchema),z.lazy(() => BookingScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  checkIn: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  checkOut: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  totalPrice: z.union([ z.lazy(() => FloatWithAggregatesFilterSchema),z.number() ]).optional(),
  status: z.union([ z.lazy(() => EnumBookingStatusWithAggregatesFilterSchema),z.lazy(() => BookingStatusSchema) ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  bookingRequestId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export const BookingRequestWhereInputSchema: z.ZodType<Prisma.BookingRequestWhereInput> = z.object({
  AND: z.union([ z.lazy(() => BookingRequestWhereInputSchema),z.lazy(() => BookingRequestWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => BookingRequestWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BookingRequestWhereInputSchema),z.lazy(() => BookingRequestWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  message: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  checkIn: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  checkOut: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  guests: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  pets: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  totalPrice: z.union([ z.lazy(() => FloatFilterSchema),z.number() ]).optional(),
  status: z.union([ z.lazy(() => EnumBookingRequestStatusFilterSchema),z.lazy(() => BookingRequestStatusSchema) ]).optional(),
  alterationOf: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  listingId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  listing: z.union([ z.lazy(() => ListingScalarRelationFilterSchema),z.lazy(() => ListingWhereInputSchema) ]).optional(),
  Booking: z.lazy(() => BookingListRelationFilterSchema).optional(),
  originalRequest: z.union([ z.lazy(() => BookingRequestNullableScalarRelationFilterSchema),z.lazy(() => BookingRequestWhereInputSchema) ]).optional().nullable(),
  alterations: z.lazy(() => BookingRequestListRelationFilterSchema).optional()
}).strict();

export const BookingRequestOrderByWithRelationInputSchema: z.ZodType<Prisma.BookingRequestOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  message: z.lazy(() => SortOrderSchema).optional(),
  checkIn: z.lazy(() => SortOrderSchema).optional(),
  checkOut: z.lazy(() => SortOrderSchema).optional(),
  guests: z.lazy(() => SortOrderSchema).optional(),
  pets: z.lazy(() => SortOrderSchema).optional(),
  totalPrice: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  alterationOf: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  listingId: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  listing: z.lazy(() => ListingOrderByWithRelationInputSchema).optional(),
  Booking: z.lazy(() => BookingOrderByRelationAggregateInputSchema).optional(),
  originalRequest: z.lazy(() => BookingRequestOrderByWithRelationInputSchema).optional(),
  alterations: z.lazy(() => BookingRequestOrderByRelationAggregateInputSchema).optional()
}).strict();

export const BookingRequestWhereUniqueInputSchema: z.ZodType<Prisma.BookingRequestWhereUniqueInput> = z.object({
  id: z.string().cuid()
})
.and(z.object({
  id: z.string().cuid().optional(),
  AND: z.union([ z.lazy(() => BookingRequestWhereInputSchema),z.lazy(() => BookingRequestWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => BookingRequestWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BookingRequestWhereInputSchema),z.lazy(() => BookingRequestWhereInputSchema).array() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  message: z.union([ z.lazy(() => StringFilterSchema),z.string({ invalid_type_error: "Message is required" }) ]).optional(),
  checkIn: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date({ invalid_type_error: "Check-in date is required" }) ]).optional(),
  checkOut: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date({ invalid_type_error: "Check-out date is required" }) ]).optional(),
  guests: z.union([ z.lazy(() => IntFilterSchema),z.number().int().min(1, { message: "At least 1 guest is required" }) ]).optional(),
  pets: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  totalPrice: z.union([ z.lazy(() => FloatFilterSchema),z.number().positive({ message: "Total price must be greater than 0" }) ]).optional(),
  status: z.union([ z.lazy(() => EnumBookingRequestStatusFilterSchema),z.lazy(() => BookingRequestStatusSchema) ]).optional(),
  alterationOf: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  listingId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  listing: z.union([ z.lazy(() => ListingScalarRelationFilterSchema),z.lazy(() => ListingWhereInputSchema) ]).optional(),
  Booking: z.lazy(() => BookingListRelationFilterSchema).optional(),
  originalRequest: z.union([ z.lazy(() => BookingRequestNullableScalarRelationFilterSchema),z.lazy(() => BookingRequestWhereInputSchema) ]).optional().nullable(),
  alterations: z.lazy(() => BookingRequestListRelationFilterSchema).optional()
}).strict());

export const BookingRequestOrderByWithAggregationInputSchema: z.ZodType<Prisma.BookingRequestOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  message: z.lazy(() => SortOrderSchema).optional(),
  checkIn: z.lazy(() => SortOrderSchema).optional(),
  checkOut: z.lazy(() => SortOrderSchema).optional(),
  guests: z.lazy(() => SortOrderSchema).optional(),
  pets: z.lazy(() => SortOrderSchema).optional(),
  totalPrice: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  alterationOf: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  listingId: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => BookingRequestCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => BookingRequestAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => BookingRequestMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => BookingRequestMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => BookingRequestSumOrderByAggregateInputSchema).optional()
}).strict();

export const BookingRequestScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.BookingRequestScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => BookingRequestScalarWhereWithAggregatesInputSchema),z.lazy(() => BookingRequestScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => BookingRequestScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BookingRequestScalarWhereWithAggregatesInputSchema),z.lazy(() => BookingRequestScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  message: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  checkIn: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  checkOut: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  guests: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  pets: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  totalPrice: z.union([ z.lazy(() => FloatWithAggregatesFilterSchema),z.number() ]).optional(),
  status: z.union([ z.lazy(() => EnumBookingRequestStatusWithAggregatesFilterSchema),z.lazy(() => BookingRequestStatusSchema) ]).optional(),
  alterationOf: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  listingId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict();

export const SessionWhereInputSchema: z.ZodType<Prisma.SessionWhereInput> = z.object({
  AND: z.union([ z.lazy(() => SessionWhereInputSchema),z.lazy(() => SessionWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => SessionWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SessionWhereInputSchema),z.lazy(() => SessionWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  expiresAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  lastActive: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict();

export const SessionOrderByWithRelationInputSchema: z.ZodType<Prisma.SessionOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  lastActive: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict();

export const SessionWhereUniqueInputSchema: z.ZodType<Prisma.SessionWhereUniqueInput> = z.object({
  id: z.string().cuid()
})
.and(z.object({
  id: z.string().cuid().optional(),
  AND: z.union([ z.lazy(() => SessionWhereInputSchema),z.lazy(() => SessionWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => SessionWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SessionWhereInputSchema),z.lazy(() => SessionWhereInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  expiresAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  lastActive: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict());

export const SessionOrderByWithAggregationInputSchema: z.ZodType<Prisma.SessionOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  lastActive: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => SessionCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => SessionMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => SessionMinOrderByAggregateInputSchema).optional()
}).strict();

export const SessionScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.SessionScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => SessionScalarWhereWithAggregatesInputSchema),z.lazy(() => SessionScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => SessionScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SessionScalarWhereWithAggregatesInputSchema),z.lazy(() => SessionScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  expiresAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  lastActive: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const PasswordResetWhereInputSchema: z.ZodType<Prisma.PasswordResetWhereInput> = z.object({
  AND: z.union([ z.lazy(() => PasswordResetWhereInputSchema),z.lazy(() => PasswordResetWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => PasswordResetWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PasswordResetWhereInputSchema),z.lazy(() => PasswordResetWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  token: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  expiresAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  used: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict();

export const PasswordResetOrderByWithRelationInputSchema: z.ZodType<Prisma.PasswordResetOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  used: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict();

export const PasswordResetWhereUniqueInputSchema: z.ZodType<Prisma.PasswordResetWhereUniqueInput> = z.union([
  z.object({
    id: z.string().cuid(),
    token: z.string()
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    token: z.string(),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  token: z.string().optional(),
  AND: z.union([ z.lazy(() => PasswordResetWhereInputSchema),z.lazy(() => PasswordResetWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => PasswordResetWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PasswordResetWhereInputSchema),z.lazy(() => PasswordResetWhereInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  expiresAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  used: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict());

export const PasswordResetOrderByWithAggregationInputSchema: z.ZodType<Prisma.PasswordResetOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  used: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => PasswordResetCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => PasswordResetMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => PasswordResetMinOrderByAggregateInputSchema).optional()
}).strict();

export const PasswordResetScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.PasswordResetScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => PasswordResetScalarWhereWithAggregatesInputSchema),z.lazy(() => PasswordResetScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => PasswordResetScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PasswordResetScalarWhereWithAggregatesInputSchema),z.lazy(() => PasswordResetScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  token: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  expiresAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  used: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
}).strict();

export const LocalEmailWhereInputSchema: z.ZodType<Prisma.LocalEmailWhereInput> = z.object({
  AND: z.union([ z.lazy(() => LocalEmailWhereInputSchema),z.lazy(() => LocalEmailWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => LocalEmailWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => LocalEmailWhereInputSchema),z.lazy(() => LocalEmailWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  to: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  from: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  subject: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  html: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const LocalEmailOrderByWithRelationInputSchema: z.ZodType<Prisma.LocalEmailOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  to: z.lazy(() => SortOrderSchema).optional(),
  from: z.lazy(() => SortOrderSchema).optional(),
  subject: z.lazy(() => SortOrderSchema).optional(),
  html: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const LocalEmailWhereUniqueInputSchema: z.ZodType<Prisma.LocalEmailWhereUniqueInput> = z.object({
  id: z.string().cuid()
})
.and(z.object({
  id: z.string().cuid().optional(),
  AND: z.union([ z.lazy(() => LocalEmailWhereInputSchema),z.lazy(() => LocalEmailWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => LocalEmailWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => LocalEmailWhereInputSchema),z.lazy(() => LocalEmailWhereInputSchema).array() ]).optional(),
  to: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  from: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  subject: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  html: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict());

export const LocalEmailOrderByWithAggregationInputSchema: z.ZodType<Prisma.LocalEmailOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  to: z.lazy(() => SortOrderSchema).optional(),
  from: z.lazy(() => SortOrderSchema).optional(),
  subject: z.lazy(() => SortOrderSchema).optional(),
  html: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => LocalEmailCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => LocalEmailMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => LocalEmailMinOrderByAggregateInputSchema).optional()
}).strict();

export const LocalEmailScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.LocalEmailScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => LocalEmailScalarWhereWithAggregatesInputSchema),z.lazy(() => LocalEmailScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => LocalEmailScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => LocalEmailScalarWhereWithAggregatesInputSchema),z.lazy(() => LocalEmailScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  to: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  from: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  subject: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  html: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const EarlyAccessSignupWhereInputSchema: z.ZodType<Prisma.EarlyAccessSignupWhereInput> = z.object({
  AND: z.union([ z.lazy(() => EarlyAccessSignupWhereInputSchema),z.lazy(() => EarlyAccessSignupWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => EarlyAccessSignupWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EarlyAccessSignupWhereInputSchema),z.lazy(() => EarlyAccessSignupWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  email: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const EarlyAccessSignupOrderByWithRelationInputSchema: z.ZodType<Prisma.EarlyAccessSignupOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EarlyAccessSignupWhereUniqueInputSchema: z.ZodType<Prisma.EarlyAccessSignupWhereUniqueInput> = z.union([
  z.object({
    id: z.string().cuid(),
    email: z.string()
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    email: z.string(),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  email: z.string().optional(),
  AND: z.union([ z.lazy(() => EarlyAccessSignupWhereInputSchema),z.lazy(() => EarlyAccessSignupWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => EarlyAccessSignupWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EarlyAccessSignupWhereInputSchema),z.lazy(() => EarlyAccessSignupWhereInputSchema).array() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict());

export const EarlyAccessSignupOrderByWithAggregationInputSchema: z.ZodType<Prisma.EarlyAccessSignupOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => EarlyAccessSignupCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => EarlyAccessSignupMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => EarlyAccessSignupMinOrderByAggregateInputSchema).optional()
}).strict();

export const EarlyAccessSignupScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.EarlyAccessSignupScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => EarlyAccessSignupScalarWhereWithAggregatesInputSchema),z.lazy(() => EarlyAccessSignupScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => EarlyAccessSignupScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EarlyAccessSignupScalarWhereWithAggregatesInputSchema),z.lazy(() => EarlyAccessSignupScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  email: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const UserRoleCreateInputSchema: z.ZodType<Prisma.UserRoleCreateInput> = z.object({
  role: z.lazy(() => RoleSchema),
  user: z.lazy(() => UserCreateNestedOneWithoutRolesInputSchema)
}).strict();

export const UserRoleUncheckedCreateInputSchema: z.ZodType<Prisma.UserRoleUncheckedCreateInput> = z.object({
  id: z.number().int().optional(),
  role: z.lazy(() => RoleSchema),
  userId: z.string()
}).strict();

export const UserRoleUpdateInputSchema: z.ZodType<Prisma.UserRoleUpdateInput> = z.object({
  role: z.union([ z.lazy(() => RoleSchema),z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutRolesNestedInputSchema).optional()
}).strict();

export const UserRoleUncheckedUpdateInputSchema: z.ZodType<Prisma.UserRoleUncheckedUpdateInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => RoleSchema),z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserRoleCreateManyInputSchema: z.ZodType<Prisma.UserRoleCreateManyInput> = z.object({
  id: z.number().int().optional(),
  role: z.lazy(() => RoleSchema),
  userId: z.string()
}).strict();

export const UserRoleUpdateManyMutationInputSchema: z.ZodType<Prisma.UserRoleUpdateManyMutationInput> = z.object({
  role: z.union([ z.lazy(() => RoleSchema),z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserRoleUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserRoleUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => RoleSchema),z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserPermissionCreateInputSchema: z.ZodType<Prisma.UserPermissionCreateInput> = z.object({
  permission: z.lazy(() => PermissionSchema),
  user: z.lazy(() => UserCreateNestedOneWithoutPermissionsInputSchema)
}).strict();

export const UserPermissionUncheckedCreateInputSchema: z.ZodType<Prisma.UserPermissionUncheckedCreateInput> = z.object({
  id: z.number().int().optional(),
  permission: z.lazy(() => PermissionSchema),
  userId: z.string()
}).strict();

export const UserPermissionUpdateInputSchema: z.ZodType<Prisma.UserPermissionUpdateInput> = z.object({
  permission: z.union([ z.lazy(() => PermissionSchema),z.lazy(() => EnumPermissionFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutPermissionsNestedInputSchema).optional()
}).strict();

export const UserPermissionUncheckedUpdateInputSchema: z.ZodType<Prisma.UserPermissionUncheckedUpdateInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  permission: z.union([ z.lazy(() => PermissionSchema),z.lazy(() => EnumPermissionFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserPermissionCreateManyInputSchema: z.ZodType<Prisma.UserPermissionCreateManyInput> = z.object({
  id: z.number().int().optional(),
  permission: z.lazy(() => PermissionSchema),
  userId: z.string()
}).strict();

export const UserPermissionUpdateManyMutationInputSchema: z.ZodType<Prisma.UserPermissionUpdateManyMutationInput> = z.object({
  permission: z.union([ z.lazy(() => PermissionSchema),z.lazy(() => EnumPermissionFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserPermissionUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserPermissionUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  permission: z.union([ z.lazy(() => PermissionSchema),z.lazy(() => EnumPermissionFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserCreateInputSchema: z.ZodType<Prisma.UserCreateInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  firstName: z.string({required_error: "First name is required" }).optional().nullable(),
  lastName: z.string({required_error: "Last name is required" }).optional().nullable(),
  imageUrl: z.string({required_error: "Image URL must be valid" }).optional().nullable(),
  password: z.string({required_error: "Password must be at least 8 characters" }).optional().nullable(),
  emailAddresses: z.lazy(() => EmailAddressCreateNestedManyWithoutUserInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountCreateNestedManyWithoutUserInputSchema).optional(),
  listings: z.lazy(() => ListingCreateNestedManyWithoutOwnerInputSchema).optional(),
  roles: z.lazy(() => UserRoleCreateNestedManyWithoutUserInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionCreateNestedManyWithoutUserInputSchema).optional(),
  bookings: z.lazy(() => BookingCreateNestedManyWithoutUserInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestCreateNestedManyWithoutUserInputSchema).optional(),
  sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputSchema).optional(),
  passwordReset: z.lazy(() => PasswordResetCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateInputSchema: z.ZodType<Prisma.UserUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  firstName: z.string({required_error: "First name is required" }).optional().nullable(),
  lastName: z.string({required_error: "Last name is required" }).optional().nullable(),
  imageUrl: z.string({required_error: "Image URL must be valid" }).optional().nullable(),
  password: z.string({required_error: "Password must be at least 8 characters" }).optional().nullable(),
  emailAddresses: z.lazy(() => EmailAddressUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  listings: z.lazy(() => ListingUncheckedCreateNestedManyWithoutOwnerInputSchema).optional(),
  roles: z.lazy(() => UserRoleUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  bookings: z.lazy(() => BookingUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  passwordReset: z.lazy(() => PasswordResetUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUpdateInputSchema: z.ZodType<Prisma.UserUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string({required_error: "First name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string({required_error: "Last name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string({required_error: "Image URL must be valid" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string({required_error: "Password must be at least 8 characters" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailAddresses: z.lazy(() => EmailAddressUpdateManyWithoutUserNestedInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountUpdateManyWithoutUserNestedInputSchema).optional(),
  listings: z.lazy(() => ListingUpdateManyWithoutOwnerNestedInputSchema).optional(),
  roles: z.lazy(() => UserRoleUpdateManyWithoutUserNestedInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionUpdateManyWithoutUserNestedInputSchema).optional(),
  bookings: z.lazy(() => BookingUpdateManyWithoutUserNestedInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestUpdateManyWithoutUserNestedInputSchema).optional(),
  sessions: z.lazy(() => SessionUpdateManyWithoutUserNestedInputSchema).optional(),
  passwordReset: z.lazy(() => PasswordResetUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateInputSchema: z.ZodType<Prisma.UserUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string({required_error: "First name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string({required_error: "Last name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string({required_error: "Image URL must be valid" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string({required_error: "Password must be at least 8 characters" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailAddresses: z.lazy(() => EmailAddressUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  listings: z.lazy(() => ListingUncheckedUpdateManyWithoutOwnerNestedInputSchema).optional(),
  roles: z.lazy(() => UserRoleUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  bookings: z.lazy(() => BookingUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  passwordReset: z.lazy(() => PasswordResetUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserCreateManyInputSchema: z.ZodType<Prisma.UserCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  firstName: z.string({required_error: "First name is required" }).optional().nullable(),
  lastName: z.string({required_error: "Last name is required" }).optional().nullable(),
  imageUrl: z.string({required_error: "Image URL must be valid" }).optional().nullable(),
  password: z.string({required_error: "Password must be at least 8 characters" }).optional().nullable()
}).strict();

export const UserUpdateManyMutationInputSchema: z.ZodType<Prisma.UserUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string({required_error: "First name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string({required_error: "Last name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string({required_error: "Image URL must be valid" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string({required_error: "Password must be at least 8 characters" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const UserUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string({required_error: "First name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string({required_error: "Last name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string({required_error: "Image URL must be valid" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string({required_error: "Password must be at least 8 characters" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const EmailAddressCreateInputSchema: z.ZodType<Prisma.EmailAddressCreateInput> = z.object({
  id: z.string().cuid().optional(),
  emailAddress: z.string({required_error: "Email address is required" }).email({ message: "Must be a valid email address" }),
  isPrimary: z.boolean().optional(),
  verification: z.string().optional().nullable(),
  verified: z.boolean().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutEmailAddressesInputSchema)
}).strict();

export const EmailAddressUncheckedCreateInputSchema: z.ZodType<Prisma.EmailAddressUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  emailAddress: z.string({required_error: "Email address is required" }).email({ message: "Must be a valid email address" }),
  isPrimary: z.boolean().optional(),
  verification: z.string().optional().nullable(),
  userId: z.string(),
  verified: z.boolean().optional()
}).strict();

export const EmailAddressUpdateInputSchema: z.ZodType<Prisma.EmailAddressUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emailAddress: z.union([ z.string({required_error: "Email address is required" }).email({ message: "Must be a valid email address" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isPrimary: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  verification: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  verified: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutEmailAddressesNestedInputSchema).optional()
}).strict();

export const EmailAddressUncheckedUpdateInputSchema: z.ZodType<Prisma.EmailAddressUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emailAddress: z.union([ z.string({required_error: "Email address is required" }).email({ message: "Must be a valid email address" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isPrimary: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  verification: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  verified: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const EmailAddressCreateManyInputSchema: z.ZodType<Prisma.EmailAddressCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  emailAddress: z.string({required_error: "Email address is required" }).email({ message: "Must be a valid email address" }),
  isPrimary: z.boolean().optional(),
  verification: z.string().optional().nullable(),
  userId: z.string(),
  verified: z.boolean().optional()
}).strict();

export const EmailAddressUpdateManyMutationInputSchema: z.ZodType<Prisma.EmailAddressUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emailAddress: z.union([ z.string({required_error: "Email address is required" }).email({ message: "Must be a valid email address" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isPrimary: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  verification: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  verified: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const EmailAddressUncheckedUpdateManyInputSchema: z.ZodType<Prisma.EmailAddressUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emailAddress: z.union([ z.string({required_error: "Email address is required" }).email({ message: "Must be a valid email address" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isPrimary: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  verification: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  verified: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ExternalAccountCreateInputSchema: z.ZodType<Prisma.ExternalAccountCreateInput> = z.object({
  id: z.string().cuid().optional(),
  provider: z.string({required_error: "Provider is required" }),
  externalId: z.string(),
  user: z.lazy(() => UserCreateNestedOneWithoutExternalAccountsInputSchema)
}).strict();

export const ExternalAccountUncheckedCreateInputSchema: z.ZodType<Prisma.ExternalAccountUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  provider: z.string({required_error: "Provider is required" }),
  externalId: z.string(),
  userId: z.string()
}).strict();

export const ExternalAccountUpdateInputSchema: z.ZodType<Prisma.ExternalAccountUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  provider: z.union([ z.string({required_error: "Provider is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  externalId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutExternalAccountsNestedInputSchema).optional()
}).strict();

export const ExternalAccountUncheckedUpdateInputSchema: z.ZodType<Prisma.ExternalAccountUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  provider: z.union([ z.string({required_error: "Provider is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  externalId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ExternalAccountCreateManyInputSchema: z.ZodType<Prisma.ExternalAccountCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  provider: z.string({required_error: "Provider is required" }),
  externalId: z.string(),
  userId: z.string()
}).strict();

export const ExternalAccountUpdateManyMutationInputSchema: z.ZodType<Prisma.ExternalAccountUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  provider: z.union([ z.string({required_error: "Provider is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  externalId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ExternalAccountUncheckedUpdateManyInputSchema: z.ZodType<Prisma.ExternalAccountUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  provider: z.union([ z.string({required_error: "Provider is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  externalId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UploadedPhotoCreateInputSchema: z.ZodType<Prisma.UploadedPhotoCreateInput> = z.object({
  id: z.string().cuid().optional(),
  url: z.string({required_error: "URL is required" }),
  key: z.string(),
  name: z.string(),
  Listing: z.lazy(() => ListingCreateNestedOneWithoutImagesInputSchema).optional()
}).strict();

export const UploadedPhotoUncheckedCreateInputSchema: z.ZodType<Prisma.UploadedPhotoUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  url: z.string({required_error: "URL is required" }),
  key: z.string(),
  name: z.string(),
  listingId: z.string().optional().nullable()
}).strict();

export const UploadedPhotoUpdateInputSchema: z.ZodType<Prisma.UploadedPhotoUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  url: z.union([ z.string({required_error: "URL is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  key: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  Listing: z.lazy(() => ListingUpdateOneWithoutImagesNestedInputSchema).optional()
}).strict();

export const UploadedPhotoUncheckedUpdateInputSchema: z.ZodType<Prisma.UploadedPhotoUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  url: z.union([ z.string({required_error: "URL is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  key: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  listingId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const UploadedPhotoCreateManyInputSchema: z.ZodType<Prisma.UploadedPhotoCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  url: z.string({required_error: "URL is required" }),
  key: z.string(),
  name: z.string(),
  listingId: z.string().optional().nullable()
}).strict();

export const UploadedPhotoUpdateManyMutationInputSchema: z.ZodType<Prisma.UploadedPhotoUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  url: z.union([ z.string({required_error: "URL is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  key: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UploadedPhotoUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UploadedPhotoUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  url: z.union([ z.string({required_error: "URL is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  key: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  listingId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const ListingCreateInputSchema: z.ZodType<Prisma.ListingCreateInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  title: z.string({required_error: "Title is required" }),
  slug: z.string({required_error: "Slug is required" }).optional(),
  description: z.string({required_error: "Description is required" }),
  propertyType: z.string({required_error: "Property type is required" }),
  address: z.string({required_error: "Address is required" }),
  latitude: z.number({ invalid_type_error: "Latitude must be a number" }).gt(-90, { message: "Latitude must be greater than -90" }).lt(90, { message: "Latitude must be less than 90" }).optional().nullable(),
  longitude: z.number({ invalid_type_error: "Longitude must be a number" }).gt(-180, { message: "Longitude must be greater than -180" }).lt(180, { message: "Longitude must be less than 180" }).optional().nullable(),
  timeZone: z.string({ invalid_type_error: "Time zone is required" }).optional(),
  checkInTime: z.string({ invalid_type_error: "Check-in time is required" }).optional(),
  checkOutTime: z.string({ invalid_type_error: "Check-out time is required" }).optional(),
  amenities: z.union([ z.lazy(() => ListingCreateamenitiesInputSchema),z.string().array() ]).optional(),
  pricePerNight: z.number().gt(0, { message: "Price per night must be greater than 0" }),
  currency: z.lazy(() => CurrencySchema).optional(),
  minimumStay: z.number().gt(0, { message: "Minimum stay must be greater than 0" }).optional(),
  maximumGuests: z.number().gt(0, { message: "Maximum guests must be greater than 0" }).optional(),
  houseRules: z.string({ invalid_type_error: "House rules are required" }),
  allowPets: z.boolean().optional(),
  petPolicy: z.string({ invalid_type_error: "Pet policy is required" }).optional(),
  published: z.boolean().optional(),
  showExactLocation: z.boolean().optional(),
  locationRadius: z.number().optional(),
  owner: z.lazy(() => UserCreateNestedOneWithoutListingsInputSchema),
  images: z.lazy(() => UploadedPhotoCreateNestedManyWithoutListingInputSchema).optional(),
  inventory: z.lazy(() => ListingInventoryCreateNestedManyWithoutListingInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestCreateNestedManyWithoutListingInputSchema).optional()
}).strict();

export const ListingUncheckedCreateInputSchema: z.ZodType<Prisma.ListingUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  title: z.string({required_error: "Title is required" }),
  slug: z.string({required_error: "Slug is required" }).optional(),
  description: z.string({required_error: "Description is required" }),
  propertyType: z.string({required_error: "Property type is required" }),
  address: z.string({required_error: "Address is required" }),
  latitude: z.number({ invalid_type_error: "Latitude must be a number" }).gt(-90, { message: "Latitude must be greater than -90" }).lt(90, { message: "Latitude must be less than 90" }).optional().nullable(),
  longitude: z.number({ invalid_type_error: "Longitude must be a number" }).gt(-180, { message: "Longitude must be greater than -180" }).lt(180, { message: "Longitude must be less than 180" }).optional().nullable(),
  timeZone: z.string({ invalid_type_error: "Time zone is required" }).optional(),
  checkInTime: z.string({ invalid_type_error: "Check-in time is required" }).optional(),
  checkOutTime: z.string({ invalid_type_error: "Check-out time is required" }).optional(),
  amenities: z.union([ z.lazy(() => ListingCreateamenitiesInputSchema),z.string().array() ]).optional(),
  pricePerNight: z.number().gt(0, { message: "Price per night must be greater than 0" }),
  currency: z.lazy(() => CurrencySchema).optional(),
  minimumStay: z.number().gt(0, { message: "Minimum stay must be greater than 0" }).optional(),
  maximumGuests: z.number().gt(0, { message: "Maximum guests must be greater than 0" }).optional(),
  houseRules: z.string({ invalid_type_error: "House rules are required" }),
  allowPets: z.boolean().optional(),
  petPolicy: z.string({ invalid_type_error: "Pet policy is required" }).optional(),
  published: z.boolean().optional(),
  showExactLocation: z.boolean().optional(),
  locationRadius: z.number().optional(),
  ownerId: z.string(),
  images: z.lazy(() => UploadedPhotoUncheckedCreateNestedManyWithoutListingInputSchema).optional(),
  inventory: z.lazy(() => ListingInventoryUncheckedCreateNestedManyWithoutListingInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestUncheckedCreateNestedManyWithoutListingInputSchema).optional()
}).strict();

export const ListingUpdateInputSchema: z.ZodType<Prisma.ListingUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string({required_error: "Title is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string({required_error: "Slug is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string({required_error: "Description is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  propertyType: z.union([ z.string({required_error: "Property type is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string({required_error: "Address is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latitude: z.union([ z.number({ invalid_type_error: "Latitude must be a number" }).gt(-90, { message: "Latitude must be greater than -90" }).lt(90, { message: "Latitude must be less than 90" }),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  longitude: z.union([ z.number({ invalid_type_error: "Longitude must be a number" }).gt(-180, { message: "Longitude must be greater than -180" }).lt(180, { message: "Longitude must be less than 180" }),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  timeZone: z.union([ z.string({ invalid_type_error: "Time zone is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkInTime: z.union([ z.string({ invalid_type_error: "Check-in time is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkOutTime: z.union([ z.string({ invalid_type_error: "Check-out time is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  amenities: z.union([ z.lazy(() => ListingUpdateamenitiesInputSchema),z.string().array() ]).optional(),
  pricePerNight: z.union([ z.number().gt(0, { message: "Price per night must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  currency: z.union([ z.lazy(() => CurrencySchema),z.lazy(() => EnumCurrencyFieldUpdateOperationsInputSchema) ]).optional(),
  minimumStay: z.union([ z.number().gt(0, { message: "Minimum stay must be greater than 0" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  maximumGuests: z.union([ z.number().gt(0, { message: "Maximum guests must be greater than 0" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  houseRules: z.union([ z.string({ invalid_type_error: "House rules are required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  allowPets: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  petPolicy: z.union([ z.string({ invalid_type_error: "Pet policy is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  published: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  showExactLocation: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  locationRadius: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  owner: z.lazy(() => UserUpdateOneRequiredWithoutListingsNestedInputSchema).optional(),
  images: z.lazy(() => UploadedPhotoUpdateManyWithoutListingNestedInputSchema).optional(),
  inventory: z.lazy(() => ListingInventoryUpdateManyWithoutListingNestedInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestUpdateManyWithoutListingNestedInputSchema).optional()
}).strict();

export const ListingUncheckedUpdateInputSchema: z.ZodType<Prisma.ListingUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string({required_error: "Title is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string({required_error: "Slug is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string({required_error: "Description is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  propertyType: z.union([ z.string({required_error: "Property type is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string({required_error: "Address is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latitude: z.union([ z.number({ invalid_type_error: "Latitude must be a number" }).gt(-90, { message: "Latitude must be greater than -90" }).lt(90, { message: "Latitude must be less than 90" }),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  longitude: z.union([ z.number({ invalid_type_error: "Longitude must be a number" }).gt(-180, { message: "Longitude must be greater than -180" }).lt(180, { message: "Longitude must be less than 180" }),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  timeZone: z.union([ z.string({ invalid_type_error: "Time zone is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkInTime: z.union([ z.string({ invalid_type_error: "Check-in time is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkOutTime: z.union([ z.string({ invalid_type_error: "Check-out time is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  amenities: z.union([ z.lazy(() => ListingUpdateamenitiesInputSchema),z.string().array() ]).optional(),
  pricePerNight: z.union([ z.number().gt(0, { message: "Price per night must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  currency: z.union([ z.lazy(() => CurrencySchema),z.lazy(() => EnumCurrencyFieldUpdateOperationsInputSchema) ]).optional(),
  minimumStay: z.union([ z.number().gt(0, { message: "Minimum stay must be greater than 0" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  maximumGuests: z.union([ z.number().gt(0, { message: "Maximum guests must be greater than 0" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  houseRules: z.union([ z.string({ invalid_type_error: "House rules are required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  allowPets: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  petPolicy: z.union([ z.string({ invalid_type_error: "Pet policy is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  published: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  showExactLocation: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  locationRadius: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  ownerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  images: z.lazy(() => UploadedPhotoUncheckedUpdateManyWithoutListingNestedInputSchema).optional(),
  inventory: z.lazy(() => ListingInventoryUncheckedUpdateManyWithoutListingNestedInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestUncheckedUpdateManyWithoutListingNestedInputSchema).optional()
}).strict();

export const ListingCreateManyInputSchema: z.ZodType<Prisma.ListingCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  title: z.string({required_error: "Title is required" }),
  slug: z.string({required_error: "Slug is required" }).optional(),
  description: z.string({required_error: "Description is required" }),
  propertyType: z.string({required_error: "Property type is required" }),
  address: z.string({required_error: "Address is required" }),
  latitude: z.number({ invalid_type_error: "Latitude must be a number" }).gt(-90, { message: "Latitude must be greater than -90" }).lt(90, { message: "Latitude must be less than 90" }).optional().nullable(),
  longitude: z.number({ invalid_type_error: "Longitude must be a number" }).gt(-180, { message: "Longitude must be greater than -180" }).lt(180, { message: "Longitude must be less than 180" }).optional().nullable(),
  timeZone: z.string({ invalid_type_error: "Time zone is required" }).optional(),
  checkInTime: z.string({ invalid_type_error: "Check-in time is required" }).optional(),
  checkOutTime: z.string({ invalid_type_error: "Check-out time is required" }).optional(),
  amenities: z.union([ z.lazy(() => ListingCreateamenitiesInputSchema),z.string().array() ]).optional(),
  pricePerNight: z.number().gt(0, { message: "Price per night must be greater than 0" }),
  currency: z.lazy(() => CurrencySchema).optional(),
  minimumStay: z.number().gt(0, { message: "Minimum stay must be greater than 0" }).optional(),
  maximumGuests: z.number().gt(0, { message: "Maximum guests must be greater than 0" }).optional(),
  houseRules: z.string({ invalid_type_error: "House rules are required" }),
  allowPets: z.boolean().optional(),
  petPolicy: z.string({ invalid_type_error: "Pet policy is required" }).optional(),
  published: z.boolean().optional(),
  showExactLocation: z.boolean().optional(),
  locationRadius: z.number().optional(),
  ownerId: z.string()
}).strict();

export const ListingUpdateManyMutationInputSchema: z.ZodType<Prisma.ListingUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string({required_error: "Title is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string({required_error: "Slug is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string({required_error: "Description is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  propertyType: z.union([ z.string({required_error: "Property type is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string({required_error: "Address is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latitude: z.union([ z.number({ invalid_type_error: "Latitude must be a number" }).gt(-90, { message: "Latitude must be greater than -90" }).lt(90, { message: "Latitude must be less than 90" }),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  longitude: z.union([ z.number({ invalid_type_error: "Longitude must be a number" }).gt(-180, { message: "Longitude must be greater than -180" }).lt(180, { message: "Longitude must be less than 180" }),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  timeZone: z.union([ z.string({ invalid_type_error: "Time zone is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkInTime: z.union([ z.string({ invalid_type_error: "Check-in time is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkOutTime: z.union([ z.string({ invalid_type_error: "Check-out time is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  amenities: z.union([ z.lazy(() => ListingUpdateamenitiesInputSchema),z.string().array() ]).optional(),
  pricePerNight: z.union([ z.number().gt(0, { message: "Price per night must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  currency: z.union([ z.lazy(() => CurrencySchema),z.lazy(() => EnumCurrencyFieldUpdateOperationsInputSchema) ]).optional(),
  minimumStay: z.union([ z.number().gt(0, { message: "Minimum stay must be greater than 0" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  maximumGuests: z.union([ z.number().gt(0, { message: "Maximum guests must be greater than 0" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  houseRules: z.union([ z.string({ invalid_type_error: "House rules are required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  allowPets: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  petPolicy: z.union([ z.string({ invalid_type_error: "Pet policy is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  published: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  showExactLocation: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  locationRadius: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ListingUncheckedUpdateManyInputSchema: z.ZodType<Prisma.ListingUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string({required_error: "Title is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string({required_error: "Slug is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string({required_error: "Description is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  propertyType: z.union([ z.string({required_error: "Property type is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string({required_error: "Address is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latitude: z.union([ z.number({ invalid_type_error: "Latitude must be a number" }).gt(-90, { message: "Latitude must be greater than -90" }).lt(90, { message: "Latitude must be less than 90" }),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  longitude: z.union([ z.number({ invalid_type_error: "Longitude must be a number" }).gt(-180, { message: "Longitude must be greater than -180" }).lt(180, { message: "Longitude must be less than 180" }),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  timeZone: z.union([ z.string({ invalid_type_error: "Time zone is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkInTime: z.union([ z.string({ invalid_type_error: "Check-in time is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkOutTime: z.union([ z.string({ invalid_type_error: "Check-out time is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  amenities: z.union([ z.lazy(() => ListingUpdateamenitiesInputSchema),z.string().array() ]).optional(),
  pricePerNight: z.union([ z.number().gt(0, { message: "Price per night must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  currency: z.union([ z.lazy(() => CurrencySchema),z.lazy(() => EnumCurrencyFieldUpdateOperationsInputSchema) ]).optional(),
  minimumStay: z.union([ z.number().gt(0, { message: "Minimum stay must be greater than 0" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  maximumGuests: z.union([ z.number().gt(0, { message: "Maximum guests must be greater than 0" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  houseRules: z.union([ z.string({ invalid_type_error: "House rules are required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  allowPets: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  petPolicy: z.union([ z.string({ invalid_type_error: "Pet policy is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  published: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  showExactLocation: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  locationRadius: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  ownerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ListingInventoryCreateInputSchema: z.ZodType<Prisma.ListingInventoryCreateInput> = z.object({
  date: z.coerce.date({ invalid_type_error: "Date is required" }),
  isAvailable: z.boolean().optional(),
  price: z.number().gt(0, { message: "Price must be greater than 0" }),
  listing: z.lazy(() => ListingCreateNestedOneWithoutInventoryInputSchema),
  booking: z.lazy(() => BookingCreateNestedOneWithoutListingInventoryInputSchema).optional()
}).strict();

export const ListingInventoryUncheckedCreateInputSchema: z.ZodType<Prisma.ListingInventoryUncheckedCreateInput> = z.object({
  id: z.number().int().optional(),
  date: z.coerce.date({ invalid_type_error: "Date is required" }),
  isAvailable: z.boolean().optional(),
  price: z.number().gt(0, { message: "Price must be greater than 0" }),
  listingId: z.string(),
  bookingId: z.string().optional().nullable()
}).strict();

export const ListingInventoryUpdateInputSchema: z.ZodType<Prisma.ListingInventoryUpdateInput> = z.object({
  date: z.union([ z.coerce.date({ invalid_type_error: "Date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isAvailable: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.number().gt(0, { message: "Price must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  listing: z.lazy(() => ListingUpdateOneRequiredWithoutInventoryNestedInputSchema).optional(),
  booking: z.lazy(() => BookingUpdateOneWithoutListingInventoryNestedInputSchema).optional()
}).strict();

export const ListingInventoryUncheckedUpdateInputSchema: z.ZodType<Prisma.ListingInventoryUncheckedUpdateInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  date: z.union([ z.coerce.date({ invalid_type_error: "Date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isAvailable: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.number().gt(0, { message: "Price must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  listingId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  bookingId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const ListingInventoryCreateManyInputSchema: z.ZodType<Prisma.ListingInventoryCreateManyInput> = z.object({
  id: z.number().int().optional(),
  date: z.coerce.date({ invalid_type_error: "Date is required" }),
  isAvailable: z.boolean().optional(),
  price: z.number().gt(0, { message: "Price must be greater than 0" }),
  listingId: z.string(),
  bookingId: z.string().optional().nullable()
}).strict();

export const ListingInventoryUpdateManyMutationInputSchema: z.ZodType<Prisma.ListingInventoryUpdateManyMutationInput> = z.object({
  date: z.union([ z.coerce.date({ invalid_type_error: "Date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isAvailable: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.number().gt(0, { message: "Price must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ListingInventoryUncheckedUpdateManyInputSchema: z.ZodType<Prisma.ListingInventoryUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  date: z.union([ z.coerce.date({ invalid_type_error: "Date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isAvailable: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.number().gt(0, { message: "Price must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  listingId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  bookingId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const BookingCreateInputSchema: z.ZodType<Prisma.BookingCreateInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  checkIn: z.coerce.date({ invalid_type_error: "Check-in date is required" }),
  checkOut: z.coerce.date({ invalid_type_error: "Check-out date is required" }),
  totalPrice: z.number().positive({ message: "Total price must be greater than 0" }),
  status: z.lazy(() => BookingStatusSchema).optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutBookingsInputSchema),
  bookingRequest: z.lazy(() => BookingRequestCreateNestedOneWithoutBookingInputSchema).optional(),
  listingInventory: z.lazy(() => ListingInventoryCreateNestedManyWithoutBookingInputSchema).optional()
}).strict();

export const BookingUncheckedCreateInputSchema: z.ZodType<Prisma.BookingUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  checkIn: z.coerce.date({ invalid_type_error: "Check-in date is required" }),
  checkOut: z.coerce.date({ invalid_type_error: "Check-out date is required" }),
  totalPrice: z.number().positive({ message: "Total price must be greater than 0" }),
  status: z.lazy(() => BookingStatusSchema).optional(),
  userId: z.string({ invalid_type_error: "User ID is required" }),
  bookingRequestId: z.string().optional().nullable(),
  listingInventory: z.lazy(() => ListingInventoryUncheckedCreateNestedManyWithoutBookingInputSchema).optional()
}).strict();

export const BookingUpdateInputSchema: z.ZodType<Prisma.BookingUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkIn: z.union([ z.coerce.date({ invalid_type_error: "Check-in date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkOut: z.union([ z.coerce.date({ invalid_type_error: "Check-out date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  totalPrice: z.union([ z.number().positive({ message: "Total price must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => BookingStatusSchema),z.lazy(() => EnumBookingStatusFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutBookingsNestedInputSchema).optional(),
  bookingRequest: z.lazy(() => BookingRequestUpdateOneWithoutBookingNestedInputSchema).optional(),
  listingInventory: z.lazy(() => ListingInventoryUpdateManyWithoutBookingNestedInputSchema).optional()
}).strict();

export const BookingUncheckedUpdateInputSchema: z.ZodType<Prisma.BookingUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkIn: z.union([ z.coerce.date({ invalid_type_error: "Check-in date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkOut: z.union([ z.coerce.date({ invalid_type_error: "Check-out date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  totalPrice: z.union([ z.number().positive({ message: "Total price must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => BookingStatusSchema),z.lazy(() => EnumBookingStatusFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string({ invalid_type_error: "User ID is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  bookingRequestId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  listingInventory: z.lazy(() => ListingInventoryUncheckedUpdateManyWithoutBookingNestedInputSchema).optional()
}).strict();

export const BookingCreateManyInputSchema: z.ZodType<Prisma.BookingCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  checkIn: z.coerce.date({ invalid_type_error: "Check-in date is required" }),
  checkOut: z.coerce.date({ invalid_type_error: "Check-out date is required" }),
  totalPrice: z.number().positive({ message: "Total price must be greater than 0" }),
  status: z.lazy(() => BookingStatusSchema).optional(),
  userId: z.string({ invalid_type_error: "User ID is required" }),
  bookingRequestId: z.string().optional().nullable()
}).strict();

export const BookingUpdateManyMutationInputSchema: z.ZodType<Prisma.BookingUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkIn: z.union([ z.coerce.date({ invalid_type_error: "Check-in date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkOut: z.union([ z.coerce.date({ invalid_type_error: "Check-out date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  totalPrice: z.union([ z.number().positive({ message: "Total price must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => BookingStatusSchema),z.lazy(() => EnumBookingStatusFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const BookingUncheckedUpdateManyInputSchema: z.ZodType<Prisma.BookingUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkIn: z.union([ z.coerce.date({ invalid_type_error: "Check-in date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkOut: z.union([ z.coerce.date({ invalid_type_error: "Check-out date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  totalPrice: z.union([ z.number().positive({ message: "Total price must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => BookingStatusSchema),z.lazy(() => EnumBookingStatusFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string({ invalid_type_error: "User ID is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  bookingRequestId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const BookingRequestCreateInputSchema: z.ZodType<Prisma.BookingRequestCreateInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  message: z.string({ invalid_type_error: "Message is required" }),
  checkIn: z.coerce.date({ invalid_type_error: "Check-in date is required" }),
  checkOut: z.coerce.date({ invalid_type_error: "Check-out date is required" }),
  guests: z.number().int().min(1, { message: "At least 1 guest is required" }),
  pets: z.boolean().optional(),
  totalPrice: z.number().positive({ message: "Total price must be greater than 0" }).optional(),
  status: z.lazy(() => BookingRequestStatusSchema).optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutBookingRequestInputSchema),
  listing: z.lazy(() => ListingCreateNestedOneWithoutBookingRequestInputSchema),
  Booking: z.lazy(() => BookingCreateNestedManyWithoutBookingRequestInputSchema).optional(),
  originalRequest: z.lazy(() => BookingRequestCreateNestedOneWithoutAlterationsInputSchema).optional(),
  alterations: z.lazy(() => BookingRequestCreateNestedManyWithoutOriginalRequestInputSchema).optional()
}).strict();

export const BookingRequestUncheckedCreateInputSchema: z.ZodType<Prisma.BookingRequestUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  message: z.string({ invalid_type_error: "Message is required" }),
  checkIn: z.coerce.date({ invalid_type_error: "Check-in date is required" }),
  checkOut: z.coerce.date({ invalid_type_error: "Check-out date is required" }),
  guests: z.number().int().min(1, { message: "At least 1 guest is required" }),
  pets: z.boolean().optional(),
  totalPrice: z.number().positive({ message: "Total price must be greater than 0" }).optional(),
  status: z.lazy(() => BookingRequestStatusSchema).optional(),
  alterationOf: z.string().optional().nullable(),
  userId: z.string(),
  listingId: z.string(),
  Booking: z.lazy(() => BookingUncheckedCreateNestedManyWithoutBookingRequestInputSchema).optional(),
  alterations: z.lazy(() => BookingRequestUncheckedCreateNestedManyWithoutOriginalRequestInputSchema).optional()
}).strict();

export const BookingRequestUpdateInputSchema: z.ZodType<Prisma.BookingRequestUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string({ invalid_type_error: "Message is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkIn: z.union([ z.coerce.date({ invalid_type_error: "Check-in date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkOut: z.union([ z.coerce.date({ invalid_type_error: "Check-out date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  guests: z.union([ z.number().int().min(1, { message: "At least 1 guest is required" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  pets: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  totalPrice: z.union([ z.number().positive({ message: "Total price must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => BookingRequestStatusSchema),z.lazy(() => EnumBookingRequestStatusFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutBookingRequestNestedInputSchema).optional(),
  listing: z.lazy(() => ListingUpdateOneRequiredWithoutBookingRequestNestedInputSchema).optional(),
  Booking: z.lazy(() => BookingUpdateManyWithoutBookingRequestNestedInputSchema).optional(),
  originalRequest: z.lazy(() => BookingRequestUpdateOneWithoutAlterationsNestedInputSchema).optional(),
  alterations: z.lazy(() => BookingRequestUpdateManyWithoutOriginalRequestNestedInputSchema).optional()
}).strict();

export const BookingRequestUncheckedUpdateInputSchema: z.ZodType<Prisma.BookingRequestUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string({ invalid_type_error: "Message is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkIn: z.union([ z.coerce.date({ invalid_type_error: "Check-in date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkOut: z.union([ z.coerce.date({ invalid_type_error: "Check-out date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  guests: z.union([ z.number().int().min(1, { message: "At least 1 guest is required" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  pets: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  totalPrice: z.union([ z.number().positive({ message: "Total price must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => BookingRequestStatusSchema),z.lazy(() => EnumBookingRequestStatusFieldUpdateOperationsInputSchema) ]).optional(),
  alterationOf: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  listingId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  Booking: z.lazy(() => BookingUncheckedUpdateManyWithoutBookingRequestNestedInputSchema).optional(),
  alterations: z.lazy(() => BookingRequestUncheckedUpdateManyWithoutOriginalRequestNestedInputSchema).optional()
}).strict();

export const BookingRequestCreateManyInputSchema: z.ZodType<Prisma.BookingRequestCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  message: z.string({ invalid_type_error: "Message is required" }),
  checkIn: z.coerce.date({ invalid_type_error: "Check-in date is required" }),
  checkOut: z.coerce.date({ invalid_type_error: "Check-out date is required" }),
  guests: z.number().int().min(1, { message: "At least 1 guest is required" }),
  pets: z.boolean().optional(),
  totalPrice: z.number().positive({ message: "Total price must be greater than 0" }).optional(),
  status: z.lazy(() => BookingRequestStatusSchema).optional(),
  alterationOf: z.string().optional().nullable(),
  userId: z.string(),
  listingId: z.string()
}).strict();

export const BookingRequestUpdateManyMutationInputSchema: z.ZodType<Prisma.BookingRequestUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string({ invalid_type_error: "Message is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkIn: z.union([ z.coerce.date({ invalid_type_error: "Check-in date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkOut: z.union([ z.coerce.date({ invalid_type_error: "Check-out date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  guests: z.union([ z.number().int().min(1, { message: "At least 1 guest is required" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  pets: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  totalPrice: z.union([ z.number().positive({ message: "Total price must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => BookingRequestStatusSchema),z.lazy(() => EnumBookingRequestStatusFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const BookingRequestUncheckedUpdateManyInputSchema: z.ZodType<Prisma.BookingRequestUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string({ invalid_type_error: "Message is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkIn: z.union([ z.coerce.date({ invalid_type_error: "Check-in date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkOut: z.union([ z.coerce.date({ invalid_type_error: "Check-out date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  guests: z.union([ z.number().int().min(1, { message: "At least 1 guest is required" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  pets: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  totalPrice: z.union([ z.number().positive({ message: "Total price must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => BookingRequestStatusSchema),z.lazy(() => EnumBookingRequestStatusFieldUpdateOperationsInputSchema) ]).optional(),
  alterationOf: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  listingId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SessionCreateInputSchema: z.ZodType<Prisma.SessionCreateInput> = z.object({
  id: z.string().cuid().optional(),
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date().optional(),
  lastActive: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutSessionsInputSchema)
}).strict();

export const SessionUncheckedCreateInputSchema: z.ZodType<Prisma.SessionUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string(),
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date().optional(),
  lastActive: z.coerce.date().optional()
}).strict();

export const SessionUpdateInputSchema: z.ZodType<Prisma.SessionUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  lastActive: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutSessionsNestedInputSchema).optional()
}).strict();

export const SessionUncheckedUpdateInputSchema: z.ZodType<Prisma.SessionUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  lastActive: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SessionCreateManyInputSchema: z.ZodType<Prisma.SessionCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string(),
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date().optional(),
  lastActive: z.coerce.date().optional()
}).strict();

export const SessionUpdateManyMutationInputSchema: z.ZodType<Prisma.SessionUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  lastActive: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SessionUncheckedUpdateManyInputSchema: z.ZodType<Prisma.SessionUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  lastActive: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const PasswordResetCreateInputSchema: z.ZodType<Prisma.PasswordResetCreateInput> = z.object({
  id: z.string().cuid().optional(),
  token: z.string(),
  expiresAt: z.coerce.date(),
  used: z.boolean().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutPasswordResetInputSchema)
}).strict();

export const PasswordResetUncheckedCreateInputSchema: z.ZodType<Prisma.PasswordResetUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string(),
  token: z.string(),
  expiresAt: z.coerce.date(),
  used: z.boolean().optional()
}).strict();

export const PasswordResetUpdateInputSchema: z.ZodType<Prisma.PasswordResetUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  used: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutPasswordResetNestedInputSchema).optional()
}).strict();

export const PasswordResetUncheckedUpdateInputSchema: z.ZodType<Prisma.PasswordResetUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  used: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const PasswordResetCreateManyInputSchema: z.ZodType<Prisma.PasswordResetCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string(),
  token: z.string(),
  expiresAt: z.coerce.date(),
  used: z.boolean().optional()
}).strict();

export const PasswordResetUpdateManyMutationInputSchema: z.ZodType<Prisma.PasswordResetUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  used: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const PasswordResetUncheckedUpdateManyInputSchema: z.ZodType<Prisma.PasswordResetUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  used: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const LocalEmailCreateInputSchema: z.ZodType<Prisma.LocalEmailCreateInput> = z.object({
  id: z.string().cuid().optional(),
  to: z.string(),
  from: z.string(),
  subject: z.string(),
  html: z.string(),
  createdAt: z.coerce.date().optional()
}).strict();

export const LocalEmailUncheckedCreateInputSchema: z.ZodType<Prisma.LocalEmailUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  to: z.string(),
  from: z.string(),
  subject: z.string(),
  html: z.string(),
  createdAt: z.coerce.date().optional()
}).strict();

export const LocalEmailUpdateInputSchema: z.ZodType<Prisma.LocalEmailUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  to: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  from: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  subject: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  html: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const LocalEmailUncheckedUpdateInputSchema: z.ZodType<Prisma.LocalEmailUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  to: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  from: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  subject: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  html: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const LocalEmailCreateManyInputSchema: z.ZodType<Prisma.LocalEmailCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  to: z.string(),
  from: z.string(),
  subject: z.string(),
  html: z.string(),
  createdAt: z.coerce.date().optional()
}).strict();

export const LocalEmailUpdateManyMutationInputSchema: z.ZodType<Prisma.LocalEmailUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  to: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  from: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  subject: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  html: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const LocalEmailUncheckedUpdateManyInputSchema: z.ZodType<Prisma.LocalEmailUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  to: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  from: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  subject: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  html: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const EarlyAccessSignupCreateInputSchema: z.ZodType<Prisma.EarlyAccessSignupCreateInput> = z.object({
  id: z.string().cuid().optional(),
  email: z.string(),
  createdAt: z.coerce.date().optional()
}).strict();

export const EarlyAccessSignupUncheckedCreateInputSchema: z.ZodType<Prisma.EarlyAccessSignupUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  email: z.string(),
  createdAt: z.coerce.date().optional()
}).strict();

export const EarlyAccessSignupUpdateInputSchema: z.ZodType<Prisma.EarlyAccessSignupUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const EarlyAccessSignupUncheckedUpdateInputSchema: z.ZodType<Prisma.EarlyAccessSignupUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const EarlyAccessSignupCreateManyInputSchema: z.ZodType<Prisma.EarlyAccessSignupCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  email: z.string(),
  createdAt: z.coerce.date().optional()
}).strict();

export const EarlyAccessSignupUpdateManyMutationInputSchema: z.ZodType<Prisma.EarlyAccessSignupUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const EarlyAccessSignupUncheckedUpdateManyInputSchema: z.ZodType<Prisma.EarlyAccessSignupUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const IntFilterSchema: z.ZodType<Prisma.IntFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict();

export const EnumRoleFilterSchema: z.ZodType<Prisma.EnumRoleFilter> = z.object({
  equals: z.lazy(() => RoleSchema).optional(),
  in: z.lazy(() => RoleSchema).array().optional(),
  notIn: z.lazy(() => RoleSchema).array().optional(),
  not: z.union([ z.lazy(() => RoleSchema),z.lazy(() => NestedEnumRoleFilterSchema) ]).optional(),
}).strict();

export const StringFilterSchema: z.ZodType<Prisma.StringFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const UserScalarRelationFilterSchema: z.ZodType<Prisma.UserScalarRelationFilter> = z.object({
  is: z.lazy(() => UserWhereInputSchema).optional(),
  isNot: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserRoleUserIdRoleCompoundUniqueInputSchema: z.ZodType<Prisma.UserRoleUserIdRoleCompoundUniqueInput> = z.object({
  userId: z.string(),
  role: z.lazy(() => RoleSchema)
}).strict();

export const UserRoleCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserRoleCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserRoleAvgOrderByAggregateInputSchema: z.ZodType<Prisma.UserRoleAvgOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserRoleMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserRoleMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserRoleMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserRoleMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserRoleSumOrderByAggregateInputSchema: z.ZodType<Prisma.UserRoleSumOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const IntWithAggregatesFilterSchema: z.ZodType<Prisma.IntWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional()
}).strict();

export const EnumRoleWithAggregatesFilterSchema: z.ZodType<Prisma.EnumRoleWithAggregatesFilter> = z.object({
  equals: z.lazy(() => RoleSchema).optional(),
  in: z.lazy(() => RoleSchema).array().optional(),
  notIn: z.lazy(() => RoleSchema).array().optional(),
  not: z.union([ z.lazy(() => RoleSchema),z.lazy(() => NestedEnumRoleWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumRoleFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumRoleFilterSchema).optional()
}).strict();

export const StringWithAggregatesFilterSchema: z.ZodType<Prisma.StringWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const EnumPermissionFilterSchema: z.ZodType<Prisma.EnumPermissionFilter> = z.object({
  equals: z.lazy(() => PermissionSchema).optional(),
  in: z.lazy(() => PermissionSchema).array().optional(),
  notIn: z.lazy(() => PermissionSchema).array().optional(),
  not: z.union([ z.lazy(() => PermissionSchema),z.lazy(() => NestedEnumPermissionFilterSchema) ]).optional(),
}).strict();

export const UserPermissionUserIdPermissionCompoundUniqueInputSchema: z.ZodType<Prisma.UserPermissionUserIdPermissionCompoundUniqueInput> = z.object({
  userId: z.string(),
  permission: z.lazy(() => PermissionSchema)
}).strict();

export const UserPermissionCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserPermissionCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  permission: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserPermissionAvgOrderByAggregateInputSchema: z.ZodType<Prisma.UserPermissionAvgOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserPermissionMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserPermissionMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  permission: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserPermissionMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserPermissionMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  permission: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserPermissionSumOrderByAggregateInputSchema: z.ZodType<Prisma.UserPermissionSumOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EnumPermissionWithAggregatesFilterSchema: z.ZodType<Prisma.EnumPermissionWithAggregatesFilter> = z.object({
  equals: z.lazy(() => PermissionSchema).optional(),
  in: z.lazy(() => PermissionSchema).array().optional(),
  notIn: z.lazy(() => PermissionSchema).array().optional(),
  not: z.union([ z.lazy(() => PermissionSchema),z.lazy(() => NestedEnumPermissionWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumPermissionFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumPermissionFilterSchema).optional()
}).strict();

export const DateTimeFilterSchema: z.ZodType<Prisma.DateTimeFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
}).strict();

export const StringNullableFilterSchema: z.ZodType<Prisma.StringNullableFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const EmailAddressListRelationFilterSchema: z.ZodType<Prisma.EmailAddressListRelationFilter> = z.object({
  every: z.lazy(() => EmailAddressWhereInputSchema).optional(),
  some: z.lazy(() => EmailAddressWhereInputSchema).optional(),
  none: z.lazy(() => EmailAddressWhereInputSchema).optional()
}).strict();

export const ExternalAccountListRelationFilterSchema: z.ZodType<Prisma.ExternalAccountListRelationFilter> = z.object({
  every: z.lazy(() => ExternalAccountWhereInputSchema).optional(),
  some: z.lazy(() => ExternalAccountWhereInputSchema).optional(),
  none: z.lazy(() => ExternalAccountWhereInputSchema).optional()
}).strict();

export const ListingListRelationFilterSchema: z.ZodType<Prisma.ListingListRelationFilter> = z.object({
  every: z.lazy(() => ListingWhereInputSchema).optional(),
  some: z.lazy(() => ListingWhereInputSchema).optional(),
  none: z.lazy(() => ListingWhereInputSchema).optional()
}).strict();

export const UserRoleListRelationFilterSchema: z.ZodType<Prisma.UserRoleListRelationFilter> = z.object({
  every: z.lazy(() => UserRoleWhereInputSchema).optional(),
  some: z.lazy(() => UserRoleWhereInputSchema).optional(),
  none: z.lazy(() => UserRoleWhereInputSchema).optional()
}).strict();

export const UserPermissionListRelationFilterSchema: z.ZodType<Prisma.UserPermissionListRelationFilter> = z.object({
  every: z.lazy(() => UserPermissionWhereInputSchema).optional(),
  some: z.lazy(() => UserPermissionWhereInputSchema).optional(),
  none: z.lazy(() => UserPermissionWhereInputSchema).optional()
}).strict();

export const BookingListRelationFilterSchema: z.ZodType<Prisma.BookingListRelationFilter> = z.object({
  every: z.lazy(() => BookingWhereInputSchema).optional(),
  some: z.lazy(() => BookingWhereInputSchema).optional(),
  none: z.lazy(() => BookingWhereInputSchema).optional()
}).strict();

export const BookingRequestListRelationFilterSchema: z.ZodType<Prisma.BookingRequestListRelationFilter> = z.object({
  every: z.lazy(() => BookingRequestWhereInputSchema).optional(),
  some: z.lazy(() => BookingRequestWhereInputSchema).optional(),
  none: z.lazy(() => BookingRequestWhereInputSchema).optional()
}).strict();

export const SessionListRelationFilterSchema: z.ZodType<Prisma.SessionListRelationFilter> = z.object({
  every: z.lazy(() => SessionWhereInputSchema).optional(),
  some: z.lazy(() => SessionWhereInputSchema).optional(),
  none: z.lazy(() => SessionWhereInputSchema).optional()
}).strict();

export const PasswordResetListRelationFilterSchema: z.ZodType<Prisma.PasswordResetListRelationFilter> = z.object({
  every: z.lazy(() => PasswordResetWhereInputSchema).optional(),
  some: z.lazy(() => PasswordResetWhereInputSchema).optional(),
  none: z.lazy(() => PasswordResetWhereInputSchema).optional()
}).strict();

export const SortOrderInputSchema: z.ZodType<Prisma.SortOrderInput> = z.object({
  sort: z.lazy(() => SortOrderSchema),
  nulls: z.lazy(() => NullsOrderSchema).optional()
}).strict();

export const EmailAddressOrderByRelationAggregateInputSchema: z.ZodType<Prisma.EmailAddressOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ExternalAccountOrderByRelationAggregateInputSchema: z.ZodType<Prisma.ExternalAccountOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ListingOrderByRelationAggregateInputSchema: z.ZodType<Prisma.ListingOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserRoleOrderByRelationAggregateInputSchema: z.ZodType<Prisma.UserRoleOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserPermissionOrderByRelationAggregateInputSchema: z.ZodType<Prisma.UserPermissionOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const BookingOrderByRelationAggregateInputSchema: z.ZodType<Prisma.BookingOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const BookingRequestOrderByRelationAggregateInputSchema: z.ZodType<Prisma.BookingRequestOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const SessionOrderByRelationAggregateInputSchema: z.ZodType<Prisma.SessionOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const PasswordResetOrderByRelationAggregateInputSchema: z.ZodType<Prisma.PasswordResetOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  lastName: z.lazy(() => SortOrderSchema).optional(),
  imageUrl: z.lazy(() => SortOrderSchema).optional(),
  password: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  lastName: z.lazy(() => SortOrderSchema).optional(),
  imageUrl: z.lazy(() => SortOrderSchema).optional(),
  password: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  lastName: z.lazy(() => SortOrderSchema).optional(),
  imageUrl: z.lazy(() => SortOrderSchema).optional(),
  password: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const DateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional()
}).strict();

export const StringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.StringNullableWithAggregatesFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional()
}).strict();

export const BoolFilterSchema: z.ZodType<Prisma.BoolFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolFilterSchema) ]).optional(),
}).strict();

export const EmailAddressCountOrderByAggregateInputSchema: z.ZodType<Prisma.EmailAddressCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  emailAddress: z.lazy(() => SortOrderSchema).optional(),
  isPrimary: z.lazy(() => SortOrderSchema).optional(),
  verification: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  verified: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EmailAddressMaxOrderByAggregateInputSchema: z.ZodType<Prisma.EmailAddressMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  emailAddress: z.lazy(() => SortOrderSchema).optional(),
  isPrimary: z.lazy(() => SortOrderSchema).optional(),
  verification: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  verified: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EmailAddressMinOrderByAggregateInputSchema: z.ZodType<Prisma.EmailAddressMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  emailAddress: z.lazy(() => SortOrderSchema).optional(),
  isPrimary: z.lazy(() => SortOrderSchema).optional(),
  verification: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  verified: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const BoolWithAggregatesFilterSchema: z.ZodType<Prisma.BoolWithAggregatesFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolFilterSchema).optional()
}).strict();

export const ExternalAccountProviderExternalIdCompoundUniqueInputSchema: z.ZodType<Prisma.ExternalAccountProviderExternalIdCompoundUniqueInput> = z.object({
  provider: z.string(),
  externalId: z.string()
}).strict();

export const ExternalAccountCountOrderByAggregateInputSchema: z.ZodType<Prisma.ExternalAccountCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  provider: z.lazy(() => SortOrderSchema).optional(),
  externalId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ExternalAccountMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ExternalAccountMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  provider: z.lazy(() => SortOrderSchema).optional(),
  externalId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ExternalAccountMinOrderByAggregateInputSchema: z.ZodType<Prisma.ExternalAccountMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  provider: z.lazy(() => SortOrderSchema).optional(),
  externalId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ListingNullableScalarRelationFilterSchema: z.ZodType<Prisma.ListingNullableScalarRelationFilter> = z.object({
  is: z.lazy(() => ListingWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => ListingWhereInputSchema).optional().nullable()
}).strict();

export const UploadedPhotoCountOrderByAggregateInputSchema: z.ZodType<Prisma.UploadedPhotoCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  url: z.lazy(() => SortOrderSchema).optional(),
  key: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  listingId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UploadedPhotoMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UploadedPhotoMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  url: z.lazy(() => SortOrderSchema).optional(),
  key: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  listingId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UploadedPhotoMinOrderByAggregateInputSchema: z.ZodType<Prisma.UploadedPhotoMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  url: z.lazy(() => SortOrderSchema).optional(),
  key: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  listingId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const FloatNullableFilterSchema: z.ZodType<Prisma.FloatNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const StringNullableListFilterSchema: z.ZodType<Prisma.StringNullableListFilter> = z.object({
  equals: z.string().array().optional().nullable(),
  has: z.string().optional().nullable(),
  hasEvery: z.string().array().optional(),
  hasSome: z.string().array().optional(),
  isEmpty: z.boolean().optional()
}).strict();

export const FloatFilterSchema: z.ZodType<Prisma.FloatFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatFilterSchema) ]).optional(),
}).strict();

export const EnumCurrencyFilterSchema: z.ZodType<Prisma.EnumCurrencyFilter> = z.object({
  equals: z.lazy(() => CurrencySchema).optional(),
  in: z.lazy(() => CurrencySchema).array().optional(),
  notIn: z.lazy(() => CurrencySchema).array().optional(),
  not: z.union([ z.lazy(() => CurrencySchema),z.lazy(() => NestedEnumCurrencyFilterSchema) ]).optional(),
}).strict();

export const UploadedPhotoListRelationFilterSchema: z.ZodType<Prisma.UploadedPhotoListRelationFilter> = z.object({
  every: z.lazy(() => UploadedPhotoWhereInputSchema).optional(),
  some: z.lazy(() => UploadedPhotoWhereInputSchema).optional(),
  none: z.lazy(() => UploadedPhotoWhereInputSchema).optional()
}).strict();

export const ListingInventoryListRelationFilterSchema: z.ZodType<Prisma.ListingInventoryListRelationFilter> = z.object({
  every: z.lazy(() => ListingInventoryWhereInputSchema).optional(),
  some: z.lazy(() => ListingInventoryWhereInputSchema).optional(),
  none: z.lazy(() => ListingInventoryWhereInputSchema).optional()
}).strict();

export const UploadedPhotoOrderByRelationAggregateInputSchema: z.ZodType<Prisma.UploadedPhotoOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ListingInventoryOrderByRelationAggregateInputSchema: z.ZodType<Prisma.ListingInventoryOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ListingCountOrderByAggregateInputSchema: z.ZodType<Prisma.ListingCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  propertyType: z.lazy(() => SortOrderSchema).optional(),
  address: z.lazy(() => SortOrderSchema).optional(),
  latitude: z.lazy(() => SortOrderSchema).optional(),
  longitude: z.lazy(() => SortOrderSchema).optional(),
  timeZone: z.lazy(() => SortOrderSchema).optional(),
  checkInTime: z.lazy(() => SortOrderSchema).optional(),
  checkOutTime: z.lazy(() => SortOrderSchema).optional(),
  amenities: z.lazy(() => SortOrderSchema).optional(),
  pricePerNight: z.lazy(() => SortOrderSchema).optional(),
  currency: z.lazy(() => SortOrderSchema).optional(),
  minimumStay: z.lazy(() => SortOrderSchema).optional(),
  maximumGuests: z.lazy(() => SortOrderSchema).optional(),
  houseRules: z.lazy(() => SortOrderSchema).optional(),
  allowPets: z.lazy(() => SortOrderSchema).optional(),
  petPolicy: z.lazy(() => SortOrderSchema).optional(),
  published: z.lazy(() => SortOrderSchema).optional(),
  showExactLocation: z.lazy(() => SortOrderSchema).optional(),
  locationRadius: z.lazy(() => SortOrderSchema).optional(),
  ownerId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ListingAvgOrderByAggregateInputSchema: z.ZodType<Prisma.ListingAvgOrderByAggregateInput> = z.object({
  latitude: z.lazy(() => SortOrderSchema).optional(),
  longitude: z.lazy(() => SortOrderSchema).optional(),
  pricePerNight: z.lazy(() => SortOrderSchema).optional(),
  minimumStay: z.lazy(() => SortOrderSchema).optional(),
  maximumGuests: z.lazy(() => SortOrderSchema).optional(),
  locationRadius: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ListingMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ListingMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  propertyType: z.lazy(() => SortOrderSchema).optional(),
  address: z.lazy(() => SortOrderSchema).optional(),
  latitude: z.lazy(() => SortOrderSchema).optional(),
  longitude: z.lazy(() => SortOrderSchema).optional(),
  timeZone: z.lazy(() => SortOrderSchema).optional(),
  checkInTime: z.lazy(() => SortOrderSchema).optional(),
  checkOutTime: z.lazy(() => SortOrderSchema).optional(),
  pricePerNight: z.lazy(() => SortOrderSchema).optional(),
  currency: z.lazy(() => SortOrderSchema).optional(),
  minimumStay: z.lazy(() => SortOrderSchema).optional(),
  maximumGuests: z.lazy(() => SortOrderSchema).optional(),
  houseRules: z.lazy(() => SortOrderSchema).optional(),
  allowPets: z.lazy(() => SortOrderSchema).optional(),
  petPolicy: z.lazy(() => SortOrderSchema).optional(),
  published: z.lazy(() => SortOrderSchema).optional(),
  showExactLocation: z.lazy(() => SortOrderSchema).optional(),
  locationRadius: z.lazy(() => SortOrderSchema).optional(),
  ownerId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ListingMinOrderByAggregateInputSchema: z.ZodType<Prisma.ListingMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  propertyType: z.lazy(() => SortOrderSchema).optional(),
  address: z.lazy(() => SortOrderSchema).optional(),
  latitude: z.lazy(() => SortOrderSchema).optional(),
  longitude: z.lazy(() => SortOrderSchema).optional(),
  timeZone: z.lazy(() => SortOrderSchema).optional(),
  checkInTime: z.lazy(() => SortOrderSchema).optional(),
  checkOutTime: z.lazy(() => SortOrderSchema).optional(),
  pricePerNight: z.lazy(() => SortOrderSchema).optional(),
  currency: z.lazy(() => SortOrderSchema).optional(),
  minimumStay: z.lazy(() => SortOrderSchema).optional(),
  maximumGuests: z.lazy(() => SortOrderSchema).optional(),
  houseRules: z.lazy(() => SortOrderSchema).optional(),
  allowPets: z.lazy(() => SortOrderSchema).optional(),
  petPolicy: z.lazy(() => SortOrderSchema).optional(),
  published: z.lazy(() => SortOrderSchema).optional(),
  showExactLocation: z.lazy(() => SortOrderSchema).optional(),
  locationRadius: z.lazy(() => SortOrderSchema).optional(),
  ownerId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ListingSumOrderByAggregateInputSchema: z.ZodType<Prisma.ListingSumOrderByAggregateInput> = z.object({
  latitude: z.lazy(() => SortOrderSchema).optional(),
  longitude: z.lazy(() => SortOrderSchema).optional(),
  pricePerNight: z.lazy(() => SortOrderSchema).optional(),
  minimumStay: z.lazy(() => SortOrderSchema).optional(),
  maximumGuests: z.lazy(() => SortOrderSchema).optional(),
  locationRadius: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const FloatNullableWithAggregatesFilterSchema: z.ZodType<Prisma.FloatNullableWithAggregatesFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _sum: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedFloatNullableFilterSchema).optional()
}).strict();

export const FloatWithAggregatesFilterSchema: z.ZodType<Prisma.FloatWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedFloatFilterSchema).optional(),
  _min: z.lazy(() => NestedFloatFilterSchema).optional(),
  _max: z.lazy(() => NestedFloatFilterSchema).optional()
}).strict();

export const EnumCurrencyWithAggregatesFilterSchema: z.ZodType<Prisma.EnumCurrencyWithAggregatesFilter> = z.object({
  equals: z.lazy(() => CurrencySchema).optional(),
  in: z.lazy(() => CurrencySchema).array().optional(),
  notIn: z.lazy(() => CurrencySchema).array().optional(),
  not: z.union([ z.lazy(() => CurrencySchema),z.lazy(() => NestedEnumCurrencyWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumCurrencyFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumCurrencyFilterSchema).optional()
}).strict();

export const ListingScalarRelationFilterSchema: z.ZodType<Prisma.ListingScalarRelationFilter> = z.object({
  is: z.lazy(() => ListingWhereInputSchema).optional(),
  isNot: z.lazy(() => ListingWhereInputSchema).optional()
}).strict();

export const BookingNullableScalarRelationFilterSchema: z.ZodType<Prisma.BookingNullableScalarRelationFilter> = z.object({
  is: z.lazy(() => BookingWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => BookingWhereInputSchema).optional().nullable()
}).strict();

export const ListingInventoryListingIdDateCompoundUniqueInputSchema: z.ZodType<Prisma.ListingInventoryListingIdDateCompoundUniqueInput> = z.object({
  listingId: z.string(),
  date: z.coerce.date()
}).strict();

export const ListingInventoryCountOrderByAggregateInputSchema: z.ZodType<Prisma.ListingInventoryCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  date: z.lazy(() => SortOrderSchema).optional(),
  isAvailable: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  listingId: z.lazy(() => SortOrderSchema).optional(),
  bookingId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ListingInventoryAvgOrderByAggregateInputSchema: z.ZodType<Prisma.ListingInventoryAvgOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ListingInventoryMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ListingInventoryMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  date: z.lazy(() => SortOrderSchema).optional(),
  isAvailable: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  listingId: z.lazy(() => SortOrderSchema).optional(),
  bookingId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ListingInventoryMinOrderByAggregateInputSchema: z.ZodType<Prisma.ListingInventoryMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  date: z.lazy(() => SortOrderSchema).optional(),
  isAvailable: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  listingId: z.lazy(() => SortOrderSchema).optional(),
  bookingId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ListingInventorySumOrderByAggregateInputSchema: z.ZodType<Prisma.ListingInventorySumOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EnumBookingStatusFilterSchema: z.ZodType<Prisma.EnumBookingStatusFilter> = z.object({
  equals: z.lazy(() => BookingStatusSchema).optional(),
  in: z.lazy(() => BookingStatusSchema).array().optional(),
  notIn: z.lazy(() => BookingStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => BookingStatusSchema),z.lazy(() => NestedEnumBookingStatusFilterSchema) ]).optional(),
}).strict();

export const BookingRequestNullableScalarRelationFilterSchema: z.ZodType<Prisma.BookingRequestNullableScalarRelationFilter> = z.object({
  is: z.lazy(() => BookingRequestWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => BookingRequestWhereInputSchema).optional().nullable()
}).strict();

export const BookingCountOrderByAggregateInputSchema: z.ZodType<Prisma.BookingCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  checkIn: z.lazy(() => SortOrderSchema).optional(),
  checkOut: z.lazy(() => SortOrderSchema).optional(),
  totalPrice: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  bookingRequestId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const BookingAvgOrderByAggregateInputSchema: z.ZodType<Prisma.BookingAvgOrderByAggregateInput> = z.object({
  totalPrice: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const BookingMaxOrderByAggregateInputSchema: z.ZodType<Prisma.BookingMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  checkIn: z.lazy(() => SortOrderSchema).optional(),
  checkOut: z.lazy(() => SortOrderSchema).optional(),
  totalPrice: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  bookingRequestId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const BookingMinOrderByAggregateInputSchema: z.ZodType<Prisma.BookingMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  checkIn: z.lazy(() => SortOrderSchema).optional(),
  checkOut: z.lazy(() => SortOrderSchema).optional(),
  totalPrice: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  bookingRequestId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const BookingSumOrderByAggregateInputSchema: z.ZodType<Prisma.BookingSumOrderByAggregateInput> = z.object({
  totalPrice: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EnumBookingStatusWithAggregatesFilterSchema: z.ZodType<Prisma.EnumBookingStatusWithAggregatesFilter> = z.object({
  equals: z.lazy(() => BookingStatusSchema).optional(),
  in: z.lazy(() => BookingStatusSchema).array().optional(),
  notIn: z.lazy(() => BookingStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => BookingStatusSchema),z.lazy(() => NestedEnumBookingStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumBookingStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumBookingStatusFilterSchema).optional()
}).strict();

export const EnumBookingRequestStatusFilterSchema: z.ZodType<Prisma.EnumBookingRequestStatusFilter> = z.object({
  equals: z.lazy(() => BookingRequestStatusSchema).optional(),
  in: z.lazy(() => BookingRequestStatusSchema).array().optional(),
  notIn: z.lazy(() => BookingRequestStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => BookingRequestStatusSchema),z.lazy(() => NestedEnumBookingRequestStatusFilterSchema) ]).optional(),
}).strict();

export const BookingRequestCountOrderByAggregateInputSchema: z.ZodType<Prisma.BookingRequestCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  message: z.lazy(() => SortOrderSchema).optional(),
  checkIn: z.lazy(() => SortOrderSchema).optional(),
  checkOut: z.lazy(() => SortOrderSchema).optional(),
  guests: z.lazy(() => SortOrderSchema).optional(),
  pets: z.lazy(() => SortOrderSchema).optional(),
  totalPrice: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  alterationOf: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  listingId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const BookingRequestAvgOrderByAggregateInputSchema: z.ZodType<Prisma.BookingRequestAvgOrderByAggregateInput> = z.object({
  guests: z.lazy(() => SortOrderSchema).optional(),
  totalPrice: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const BookingRequestMaxOrderByAggregateInputSchema: z.ZodType<Prisma.BookingRequestMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  message: z.lazy(() => SortOrderSchema).optional(),
  checkIn: z.lazy(() => SortOrderSchema).optional(),
  checkOut: z.lazy(() => SortOrderSchema).optional(),
  guests: z.lazy(() => SortOrderSchema).optional(),
  pets: z.lazy(() => SortOrderSchema).optional(),
  totalPrice: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  alterationOf: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  listingId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const BookingRequestMinOrderByAggregateInputSchema: z.ZodType<Prisma.BookingRequestMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  message: z.lazy(() => SortOrderSchema).optional(),
  checkIn: z.lazy(() => SortOrderSchema).optional(),
  checkOut: z.lazy(() => SortOrderSchema).optional(),
  guests: z.lazy(() => SortOrderSchema).optional(),
  pets: z.lazy(() => SortOrderSchema).optional(),
  totalPrice: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  alterationOf: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  listingId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const BookingRequestSumOrderByAggregateInputSchema: z.ZodType<Prisma.BookingRequestSumOrderByAggregateInput> = z.object({
  guests: z.lazy(() => SortOrderSchema).optional(),
  totalPrice: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EnumBookingRequestStatusWithAggregatesFilterSchema: z.ZodType<Prisma.EnumBookingRequestStatusWithAggregatesFilter> = z.object({
  equals: z.lazy(() => BookingRequestStatusSchema).optional(),
  in: z.lazy(() => BookingRequestStatusSchema).array().optional(),
  notIn: z.lazy(() => BookingRequestStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => BookingRequestStatusSchema),z.lazy(() => NestedEnumBookingRequestStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumBookingRequestStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumBookingRequestStatusFilterSchema).optional()
}).strict();

export const SessionCountOrderByAggregateInputSchema: z.ZodType<Prisma.SessionCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  lastActive: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const SessionMaxOrderByAggregateInputSchema: z.ZodType<Prisma.SessionMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  lastActive: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const SessionMinOrderByAggregateInputSchema: z.ZodType<Prisma.SessionMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  lastActive: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const PasswordResetCountOrderByAggregateInputSchema: z.ZodType<Prisma.PasswordResetCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  used: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const PasswordResetMaxOrderByAggregateInputSchema: z.ZodType<Prisma.PasswordResetMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  used: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const PasswordResetMinOrderByAggregateInputSchema: z.ZodType<Prisma.PasswordResetMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  used: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const LocalEmailCountOrderByAggregateInputSchema: z.ZodType<Prisma.LocalEmailCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  to: z.lazy(() => SortOrderSchema).optional(),
  from: z.lazy(() => SortOrderSchema).optional(),
  subject: z.lazy(() => SortOrderSchema).optional(),
  html: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const LocalEmailMaxOrderByAggregateInputSchema: z.ZodType<Prisma.LocalEmailMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  to: z.lazy(() => SortOrderSchema).optional(),
  from: z.lazy(() => SortOrderSchema).optional(),
  subject: z.lazy(() => SortOrderSchema).optional(),
  html: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const LocalEmailMinOrderByAggregateInputSchema: z.ZodType<Prisma.LocalEmailMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  to: z.lazy(() => SortOrderSchema).optional(),
  from: z.lazy(() => SortOrderSchema).optional(),
  subject: z.lazy(() => SortOrderSchema).optional(),
  html: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EarlyAccessSignupCountOrderByAggregateInputSchema: z.ZodType<Prisma.EarlyAccessSignupCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EarlyAccessSignupMaxOrderByAggregateInputSchema: z.ZodType<Prisma.EarlyAccessSignupMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EarlyAccessSignupMinOrderByAggregateInputSchema: z.ZodType<Prisma.EarlyAccessSignupMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserCreateNestedOneWithoutRolesInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutRolesInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutRolesInputSchema),z.lazy(() => UserUncheckedCreateWithoutRolesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutRolesInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const EnumRoleFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumRoleFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => RoleSchema).optional()
}).strict();

export const UserUpdateOneRequiredWithoutRolesNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutRolesNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutRolesInputSchema),z.lazy(() => UserUncheckedCreateWithoutRolesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutRolesInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutRolesInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutRolesInputSchema),z.lazy(() => UserUpdateWithoutRolesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutRolesInputSchema) ]).optional(),
}).strict();

export const IntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.IntFieldUpdateOperationsInput> = z.object({
  set: z.number().optional(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional()
}).strict();

export const StringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.StringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional()
}).strict();

export const UserCreateNestedOneWithoutPermissionsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutPermissionsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutPermissionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutPermissionsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutPermissionsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const EnumPermissionFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumPermissionFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => PermissionSchema).optional()
}).strict();

export const UserUpdateOneRequiredWithoutPermissionsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutPermissionsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutPermissionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutPermissionsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutPermissionsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutPermissionsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutPermissionsInputSchema),z.lazy(() => UserUpdateWithoutPermissionsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutPermissionsInputSchema) ]).optional(),
}).strict();

export const EmailAddressCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.EmailAddressCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => EmailAddressCreateWithoutUserInputSchema),z.lazy(() => EmailAddressCreateWithoutUserInputSchema).array(),z.lazy(() => EmailAddressUncheckedCreateWithoutUserInputSchema),z.lazy(() => EmailAddressUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EmailAddressCreateOrConnectWithoutUserInputSchema),z.lazy(() => EmailAddressCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EmailAddressCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => EmailAddressWhereUniqueInputSchema),z.lazy(() => EmailAddressWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ExternalAccountCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.ExternalAccountCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => ExternalAccountCreateWithoutUserInputSchema),z.lazy(() => ExternalAccountCreateWithoutUserInputSchema).array(),z.lazy(() => ExternalAccountUncheckedCreateWithoutUserInputSchema),z.lazy(() => ExternalAccountUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ExternalAccountCreateOrConnectWithoutUserInputSchema),z.lazy(() => ExternalAccountCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ExternalAccountCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ExternalAccountWhereUniqueInputSchema),z.lazy(() => ExternalAccountWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ListingCreateNestedManyWithoutOwnerInputSchema: z.ZodType<Prisma.ListingCreateNestedManyWithoutOwnerInput> = z.object({
  create: z.union([ z.lazy(() => ListingCreateWithoutOwnerInputSchema),z.lazy(() => ListingCreateWithoutOwnerInputSchema).array(),z.lazy(() => ListingUncheckedCreateWithoutOwnerInputSchema),z.lazy(() => ListingUncheckedCreateWithoutOwnerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ListingCreateOrConnectWithoutOwnerInputSchema),z.lazy(() => ListingCreateOrConnectWithoutOwnerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ListingCreateManyOwnerInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ListingWhereUniqueInputSchema),z.lazy(() => ListingWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserRoleCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.UserRoleCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => UserRoleCreateWithoutUserInputSchema),z.lazy(() => UserRoleCreateWithoutUserInputSchema).array(),z.lazy(() => UserRoleUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserRoleUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserRoleCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserRoleCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserRoleCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserRoleWhereUniqueInputSchema),z.lazy(() => UserRoleWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserPermissionCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.UserPermissionCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => UserPermissionCreateWithoutUserInputSchema),z.lazy(() => UserPermissionCreateWithoutUserInputSchema).array(),z.lazy(() => UserPermissionUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserPermissionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserPermissionCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserPermissionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserPermissionCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserPermissionWhereUniqueInputSchema),z.lazy(() => UserPermissionWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const BookingCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.BookingCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => BookingCreateWithoutUserInputSchema),z.lazy(() => BookingCreateWithoutUserInputSchema).array(),z.lazy(() => BookingUncheckedCreateWithoutUserInputSchema),z.lazy(() => BookingUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BookingCreateOrConnectWithoutUserInputSchema),z.lazy(() => BookingCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BookingCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => BookingWhereUniqueInputSchema),z.lazy(() => BookingWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const BookingRequestCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.BookingRequestCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => BookingRequestCreateWithoutUserInputSchema),z.lazy(() => BookingRequestCreateWithoutUserInputSchema).array(),z.lazy(() => BookingRequestUncheckedCreateWithoutUserInputSchema),z.lazy(() => BookingRequestUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BookingRequestCreateOrConnectWithoutUserInputSchema),z.lazy(() => BookingRequestCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BookingRequestCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => BookingRequestWhereUniqueInputSchema),z.lazy(() => BookingRequestWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const SessionCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.SessionCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => SessionCreateWithoutUserInputSchema),z.lazy(() => SessionCreateWithoutUserInputSchema).array(),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema),z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SessionCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const PasswordResetCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.PasswordResetCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => PasswordResetCreateWithoutUserInputSchema),z.lazy(() => PasswordResetCreateWithoutUserInputSchema).array(),z.lazy(() => PasswordResetUncheckedCreateWithoutUserInputSchema),z.lazy(() => PasswordResetUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PasswordResetCreateOrConnectWithoutUserInputSchema),z.lazy(() => PasswordResetCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PasswordResetCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => PasswordResetWhereUniqueInputSchema),z.lazy(() => PasswordResetWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const EmailAddressUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.EmailAddressUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => EmailAddressCreateWithoutUserInputSchema),z.lazy(() => EmailAddressCreateWithoutUserInputSchema).array(),z.lazy(() => EmailAddressUncheckedCreateWithoutUserInputSchema),z.lazy(() => EmailAddressUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EmailAddressCreateOrConnectWithoutUserInputSchema),z.lazy(() => EmailAddressCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EmailAddressCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => EmailAddressWhereUniqueInputSchema),z.lazy(() => EmailAddressWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ExternalAccountUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.ExternalAccountUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => ExternalAccountCreateWithoutUserInputSchema),z.lazy(() => ExternalAccountCreateWithoutUserInputSchema).array(),z.lazy(() => ExternalAccountUncheckedCreateWithoutUserInputSchema),z.lazy(() => ExternalAccountUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ExternalAccountCreateOrConnectWithoutUserInputSchema),z.lazy(() => ExternalAccountCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ExternalAccountCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ExternalAccountWhereUniqueInputSchema),z.lazy(() => ExternalAccountWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ListingUncheckedCreateNestedManyWithoutOwnerInputSchema: z.ZodType<Prisma.ListingUncheckedCreateNestedManyWithoutOwnerInput> = z.object({
  create: z.union([ z.lazy(() => ListingCreateWithoutOwnerInputSchema),z.lazy(() => ListingCreateWithoutOwnerInputSchema).array(),z.lazy(() => ListingUncheckedCreateWithoutOwnerInputSchema),z.lazy(() => ListingUncheckedCreateWithoutOwnerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ListingCreateOrConnectWithoutOwnerInputSchema),z.lazy(() => ListingCreateOrConnectWithoutOwnerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ListingCreateManyOwnerInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ListingWhereUniqueInputSchema),z.lazy(() => ListingWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserRoleUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.UserRoleUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => UserRoleCreateWithoutUserInputSchema),z.lazy(() => UserRoleCreateWithoutUserInputSchema).array(),z.lazy(() => UserRoleUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserRoleUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserRoleCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserRoleCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserRoleCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserRoleWhereUniqueInputSchema),z.lazy(() => UserRoleWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserPermissionUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.UserPermissionUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => UserPermissionCreateWithoutUserInputSchema),z.lazy(() => UserPermissionCreateWithoutUserInputSchema).array(),z.lazy(() => UserPermissionUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserPermissionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserPermissionCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserPermissionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserPermissionCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserPermissionWhereUniqueInputSchema),z.lazy(() => UserPermissionWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const BookingUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.BookingUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => BookingCreateWithoutUserInputSchema),z.lazy(() => BookingCreateWithoutUserInputSchema).array(),z.lazy(() => BookingUncheckedCreateWithoutUserInputSchema),z.lazy(() => BookingUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BookingCreateOrConnectWithoutUserInputSchema),z.lazy(() => BookingCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BookingCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => BookingWhereUniqueInputSchema),z.lazy(() => BookingWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const BookingRequestUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.BookingRequestUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => BookingRequestCreateWithoutUserInputSchema),z.lazy(() => BookingRequestCreateWithoutUserInputSchema).array(),z.lazy(() => BookingRequestUncheckedCreateWithoutUserInputSchema),z.lazy(() => BookingRequestUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BookingRequestCreateOrConnectWithoutUserInputSchema),z.lazy(() => BookingRequestCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BookingRequestCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => BookingRequestWhereUniqueInputSchema),z.lazy(() => BookingRequestWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const SessionUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.SessionUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => SessionCreateWithoutUserInputSchema),z.lazy(() => SessionCreateWithoutUserInputSchema).array(),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema),z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SessionCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const PasswordResetUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.PasswordResetUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => PasswordResetCreateWithoutUserInputSchema),z.lazy(() => PasswordResetCreateWithoutUserInputSchema).array(),z.lazy(() => PasswordResetUncheckedCreateWithoutUserInputSchema),z.lazy(() => PasswordResetUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PasswordResetCreateOrConnectWithoutUserInputSchema),z.lazy(() => PasswordResetCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PasswordResetCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => PasswordResetWhereUniqueInputSchema),z.lazy(() => PasswordResetWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const DateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.DateTimeFieldUpdateOperationsInput> = z.object({
  set: z.coerce.date().optional()
}).strict();

export const NullableStringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableStringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional().nullable()
}).strict();

export const EmailAddressUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.EmailAddressUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => EmailAddressCreateWithoutUserInputSchema),z.lazy(() => EmailAddressCreateWithoutUserInputSchema).array(),z.lazy(() => EmailAddressUncheckedCreateWithoutUserInputSchema),z.lazy(() => EmailAddressUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EmailAddressCreateOrConnectWithoutUserInputSchema),z.lazy(() => EmailAddressCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => EmailAddressUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => EmailAddressUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EmailAddressCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => EmailAddressWhereUniqueInputSchema),z.lazy(() => EmailAddressWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => EmailAddressWhereUniqueInputSchema),z.lazy(() => EmailAddressWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => EmailAddressWhereUniqueInputSchema),z.lazy(() => EmailAddressWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => EmailAddressWhereUniqueInputSchema),z.lazy(() => EmailAddressWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => EmailAddressUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => EmailAddressUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => EmailAddressUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => EmailAddressUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => EmailAddressScalarWhereInputSchema),z.lazy(() => EmailAddressScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ExternalAccountUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.ExternalAccountUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => ExternalAccountCreateWithoutUserInputSchema),z.lazy(() => ExternalAccountCreateWithoutUserInputSchema).array(),z.lazy(() => ExternalAccountUncheckedCreateWithoutUserInputSchema),z.lazy(() => ExternalAccountUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ExternalAccountCreateOrConnectWithoutUserInputSchema),z.lazy(() => ExternalAccountCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ExternalAccountUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => ExternalAccountUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ExternalAccountCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ExternalAccountWhereUniqueInputSchema),z.lazy(() => ExternalAccountWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ExternalAccountWhereUniqueInputSchema),z.lazy(() => ExternalAccountWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ExternalAccountWhereUniqueInputSchema),z.lazy(() => ExternalAccountWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ExternalAccountWhereUniqueInputSchema),z.lazy(() => ExternalAccountWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ExternalAccountUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => ExternalAccountUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ExternalAccountUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => ExternalAccountUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ExternalAccountScalarWhereInputSchema),z.lazy(() => ExternalAccountScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ListingUpdateManyWithoutOwnerNestedInputSchema: z.ZodType<Prisma.ListingUpdateManyWithoutOwnerNestedInput> = z.object({
  create: z.union([ z.lazy(() => ListingCreateWithoutOwnerInputSchema),z.lazy(() => ListingCreateWithoutOwnerInputSchema).array(),z.lazy(() => ListingUncheckedCreateWithoutOwnerInputSchema),z.lazy(() => ListingUncheckedCreateWithoutOwnerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ListingCreateOrConnectWithoutOwnerInputSchema),z.lazy(() => ListingCreateOrConnectWithoutOwnerInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ListingUpsertWithWhereUniqueWithoutOwnerInputSchema),z.lazy(() => ListingUpsertWithWhereUniqueWithoutOwnerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ListingCreateManyOwnerInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ListingWhereUniqueInputSchema),z.lazy(() => ListingWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ListingWhereUniqueInputSchema),z.lazy(() => ListingWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ListingWhereUniqueInputSchema),z.lazy(() => ListingWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ListingWhereUniqueInputSchema),z.lazy(() => ListingWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ListingUpdateWithWhereUniqueWithoutOwnerInputSchema),z.lazy(() => ListingUpdateWithWhereUniqueWithoutOwnerInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ListingUpdateManyWithWhereWithoutOwnerInputSchema),z.lazy(() => ListingUpdateManyWithWhereWithoutOwnerInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ListingScalarWhereInputSchema),z.lazy(() => ListingScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserRoleUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.UserRoleUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserRoleCreateWithoutUserInputSchema),z.lazy(() => UserRoleCreateWithoutUserInputSchema).array(),z.lazy(() => UserRoleUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserRoleUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserRoleCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserRoleCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserRoleUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserRoleUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserRoleCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserRoleWhereUniqueInputSchema),z.lazy(() => UserRoleWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserRoleWhereUniqueInputSchema),z.lazy(() => UserRoleWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserRoleWhereUniqueInputSchema),z.lazy(() => UserRoleWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserRoleWhereUniqueInputSchema),z.lazy(() => UserRoleWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserRoleUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserRoleUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserRoleUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => UserRoleUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserRoleScalarWhereInputSchema),z.lazy(() => UserRoleScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserPermissionUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.UserPermissionUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserPermissionCreateWithoutUserInputSchema),z.lazy(() => UserPermissionCreateWithoutUserInputSchema).array(),z.lazy(() => UserPermissionUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserPermissionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserPermissionCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserPermissionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserPermissionUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserPermissionUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserPermissionCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserPermissionWhereUniqueInputSchema),z.lazy(() => UserPermissionWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserPermissionWhereUniqueInputSchema),z.lazy(() => UserPermissionWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserPermissionWhereUniqueInputSchema),z.lazy(() => UserPermissionWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserPermissionWhereUniqueInputSchema),z.lazy(() => UserPermissionWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserPermissionUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserPermissionUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserPermissionUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => UserPermissionUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserPermissionScalarWhereInputSchema),z.lazy(() => UserPermissionScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const BookingUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.BookingUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => BookingCreateWithoutUserInputSchema),z.lazy(() => BookingCreateWithoutUserInputSchema).array(),z.lazy(() => BookingUncheckedCreateWithoutUserInputSchema),z.lazy(() => BookingUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BookingCreateOrConnectWithoutUserInputSchema),z.lazy(() => BookingCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => BookingUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => BookingUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BookingCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => BookingWhereUniqueInputSchema),z.lazy(() => BookingWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => BookingWhereUniqueInputSchema),z.lazy(() => BookingWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => BookingWhereUniqueInputSchema),z.lazy(() => BookingWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => BookingWhereUniqueInputSchema),z.lazy(() => BookingWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => BookingUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => BookingUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => BookingUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => BookingUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => BookingScalarWhereInputSchema),z.lazy(() => BookingScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const BookingRequestUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.BookingRequestUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => BookingRequestCreateWithoutUserInputSchema),z.lazy(() => BookingRequestCreateWithoutUserInputSchema).array(),z.lazy(() => BookingRequestUncheckedCreateWithoutUserInputSchema),z.lazy(() => BookingRequestUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BookingRequestCreateOrConnectWithoutUserInputSchema),z.lazy(() => BookingRequestCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => BookingRequestUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => BookingRequestUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BookingRequestCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => BookingRequestWhereUniqueInputSchema),z.lazy(() => BookingRequestWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => BookingRequestWhereUniqueInputSchema),z.lazy(() => BookingRequestWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => BookingRequestWhereUniqueInputSchema),z.lazy(() => BookingRequestWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => BookingRequestWhereUniqueInputSchema),z.lazy(() => BookingRequestWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => BookingRequestUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => BookingRequestUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => BookingRequestUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => BookingRequestUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => BookingRequestScalarWhereInputSchema),z.lazy(() => BookingRequestScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const SessionUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.SessionUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => SessionCreateWithoutUserInputSchema),z.lazy(() => SessionCreateWithoutUserInputSchema).array(),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema),z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => SessionUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => SessionUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SessionCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => SessionUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => SessionUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => SessionUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => SessionUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => SessionScalarWhereInputSchema),z.lazy(() => SessionScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const PasswordResetUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.PasswordResetUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => PasswordResetCreateWithoutUserInputSchema),z.lazy(() => PasswordResetCreateWithoutUserInputSchema).array(),z.lazy(() => PasswordResetUncheckedCreateWithoutUserInputSchema),z.lazy(() => PasswordResetUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PasswordResetCreateOrConnectWithoutUserInputSchema),z.lazy(() => PasswordResetCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => PasswordResetUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => PasswordResetUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PasswordResetCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => PasswordResetWhereUniqueInputSchema),z.lazy(() => PasswordResetWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => PasswordResetWhereUniqueInputSchema),z.lazy(() => PasswordResetWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => PasswordResetWhereUniqueInputSchema),z.lazy(() => PasswordResetWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => PasswordResetWhereUniqueInputSchema),z.lazy(() => PasswordResetWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => PasswordResetUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => PasswordResetUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => PasswordResetUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => PasswordResetUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => PasswordResetScalarWhereInputSchema),z.lazy(() => PasswordResetScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const EmailAddressUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.EmailAddressUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => EmailAddressCreateWithoutUserInputSchema),z.lazy(() => EmailAddressCreateWithoutUserInputSchema).array(),z.lazy(() => EmailAddressUncheckedCreateWithoutUserInputSchema),z.lazy(() => EmailAddressUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EmailAddressCreateOrConnectWithoutUserInputSchema),z.lazy(() => EmailAddressCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => EmailAddressUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => EmailAddressUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EmailAddressCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => EmailAddressWhereUniqueInputSchema),z.lazy(() => EmailAddressWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => EmailAddressWhereUniqueInputSchema),z.lazy(() => EmailAddressWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => EmailAddressWhereUniqueInputSchema),z.lazy(() => EmailAddressWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => EmailAddressWhereUniqueInputSchema),z.lazy(() => EmailAddressWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => EmailAddressUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => EmailAddressUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => EmailAddressUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => EmailAddressUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => EmailAddressScalarWhereInputSchema),z.lazy(() => EmailAddressScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ExternalAccountUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.ExternalAccountUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => ExternalAccountCreateWithoutUserInputSchema),z.lazy(() => ExternalAccountCreateWithoutUserInputSchema).array(),z.lazy(() => ExternalAccountUncheckedCreateWithoutUserInputSchema),z.lazy(() => ExternalAccountUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ExternalAccountCreateOrConnectWithoutUserInputSchema),z.lazy(() => ExternalAccountCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ExternalAccountUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => ExternalAccountUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ExternalAccountCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ExternalAccountWhereUniqueInputSchema),z.lazy(() => ExternalAccountWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ExternalAccountWhereUniqueInputSchema),z.lazy(() => ExternalAccountWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ExternalAccountWhereUniqueInputSchema),z.lazy(() => ExternalAccountWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ExternalAccountWhereUniqueInputSchema),z.lazy(() => ExternalAccountWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ExternalAccountUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => ExternalAccountUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ExternalAccountUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => ExternalAccountUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ExternalAccountScalarWhereInputSchema),z.lazy(() => ExternalAccountScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ListingUncheckedUpdateManyWithoutOwnerNestedInputSchema: z.ZodType<Prisma.ListingUncheckedUpdateManyWithoutOwnerNestedInput> = z.object({
  create: z.union([ z.lazy(() => ListingCreateWithoutOwnerInputSchema),z.lazy(() => ListingCreateWithoutOwnerInputSchema).array(),z.lazy(() => ListingUncheckedCreateWithoutOwnerInputSchema),z.lazy(() => ListingUncheckedCreateWithoutOwnerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ListingCreateOrConnectWithoutOwnerInputSchema),z.lazy(() => ListingCreateOrConnectWithoutOwnerInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ListingUpsertWithWhereUniqueWithoutOwnerInputSchema),z.lazy(() => ListingUpsertWithWhereUniqueWithoutOwnerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ListingCreateManyOwnerInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ListingWhereUniqueInputSchema),z.lazy(() => ListingWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ListingWhereUniqueInputSchema),z.lazy(() => ListingWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ListingWhereUniqueInputSchema),z.lazy(() => ListingWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ListingWhereUniqueInputSchema),z.lazy(() => ListingWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ListingUpdateWithWhereUniqueWithoutOwnerInputSchema),z.lazy(() => ListingUpdateWithWhereUniqueWithoutOwnerInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ListingUpdateManyWithWhereWithoutOwnerInputSchema),z.lazy(() => ListingUpdateManyWithWhereWithoutOwnerInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ListingScalarWhereInputSchema),z.lazy(() => ListingScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserRoleUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.UserRoleUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserRoleCreateWithoutUserInputSchema),z.lazy(() => UserRoleCreateWithoutUserInputSchema).array(),z.lazy(() => UserRoleUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserRoleUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserRoleCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserRoleCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserRoleUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserRoleUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserRoleCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserRoleWhereUniqueInputSchema),z.lazy(() => UserRoleWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserRoleWhereUniqueInputSchema),z.lazy(() => UserRoleWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserRoleWhereUniqueInputSchema),z.lazy(() => UserRoleWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserRoleWhereUniqueInputSchema),z.lazy(() => UserRoleWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserRoleUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserRoleUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserRoleUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => UserRoleUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserRoleScalarWhereInputSchema),z.lazy(() => UserRoleScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserPermissionUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.UserPermissionUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserPermissionCreateWithoutUserInputSchema),z.lazy(() => UserPermissionCreateWithoutUserInputSchema).array(),z.lazy(() => UserPermissionUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserPermissionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserPermissionCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserPermissionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserPermissionUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserPermissionUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserPermissionCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserPermissionWhereUniqueInputSchema),z.lazy(() => UserPermissionWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserPermissionWhereUniqueInputSchema),z.lazy(() => UserPermissionWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserPermissionWhereUniqueInputSchema),z.lazy(() => UserPermissionWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserPermissionWhereUniqueInputSchema),z.lazy(() => UserPermissionWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserPermissionUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserPermissionUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserPermissionUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => UserPermissionUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserPermissionScalarWhereInputSchema),z.lazy(() => UserPermissionScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const BookingUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.BookingUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => BookingCreateWithoutUserInputSchema),z.lazy(() => BookingCreateWithoutUserInputSchema).array(),z.lazy(() => BookingUncheckedCreateWithoutUserInputSchema),z.lazy(() => BookingUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BookingCreateOrConnectWithoutUserInputSchema),z.lazy(() => BookingCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => BookingUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => BookingUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BookingCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => BookingWhereUniqueInputSchema),z.lazy(() => BookingWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => BookingWhereUniqueInputSchema),z.lazy(() => BookingWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => BookingWhereUniqueInputSchema),z.lazy(() => BookingWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => BookingWhereUniqueInputSchema),z.lazy(() => BookingWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => BookingUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => BookingUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => BookingUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => BookingUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => BookingScalarWhereInputSchema),z.lazy(() => BookingScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const BookingRequestUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.BookingRequestUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => BookingRequestCreateWithoutUserInputSchema),z.lazy(() => BookingRequestCreateWithoutUserInputSchema).array(),z.lazy(() => BookingRequestUncheckedCreateWithoutUserInputSchema),z.lazy(() => BookingRequestUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BookingRequestCreateOrConnectWithoutUserInputSchema),z.lazy(() => BookingRequestCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => BookingRequestUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => BookingRequestUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BookingRequestCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => BookingRequestWhereUniqueInputSchema),z.lazy(() => BookingRequestWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => BookingRequestWhereUniqueInputSchema),z.lazy(() => BookingRequestWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => BookingRequestWhereUniqueInputSchema),z.lazy(() => BookingRequestWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => BookingRequestWhereUniqueInputSchema),z.lazy(() => BookingRequestWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => BookingRequestUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => BookingRequestUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => BookingRequestUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => BookingRequestUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => BookingRequestScalarWhereInputSchema),z.lazy(() => BookingRequestScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const SessionUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.SessionUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => SessionCreateWithoutUserInputSchema),z.lazy(() => SessionCreateWithoutUserInputSchema).array(),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema),z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => SessionUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => SessionUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SessionCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => SessionUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => SessionUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => SessionUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => SessionUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => SessionScalarWhereInputSchema),z.lazy(() => SessionScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const PasswordResetUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.PasswordResetUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => PasswordResetCreateWithoutUserInputSchema),z.lazy(() => PasswordResetCreateWithoutUserInputSchema).array(),z.lazy(() => PasswordResetUncheckedCreateWithoutUserInputSchema),z.lazy(() => PasswordResetUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PasswordResetCreateOrConnectWithoutUserInputSchema),z.lazy(() => PasswordResetCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => PasswordResetUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => PasswordResetUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PasswordResetCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => PasswordResetWhereUniqueInputSchema),z.lazy(() => PasswordResetWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => PasswordResetWhereUniqueInputSchema),z.lazy(() => PasswordResetWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => PasswordResetWhereUniqueInputSchema),z.lazy(() => PasswordResetWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => PasswordResetWhereUniqueInputSchema),z.lazy(() => PasswordResetWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => PasswordResetUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => PasswordResetUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => PasswordResetUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => PasswordResetUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => PasswordResetScalarWhereInputSchema),z.lazy(() => PasswordResetScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserCreateNestedOneWithoutEmailAddressesInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutEmailAddressesInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutEmailAddressesInputSchema),z.lazy(() => UserUncheckedCreateWithoutEmailAddressesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutEmailAddressesInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const BoolFieldUpdateOperationsInputSchema: z.ZodType<Prisma.BoolFieldUpdateOperationsInput> = z.object({
  set: z.boolean().optional()
}).strict();

export const UserUpdateOneRequiredWithoutEmailAddressesNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutEmailAddressesNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutEmailAddressesInputSchema),z.lazy(() => UserUncheckedCreateWithoutEmailAddressesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutEmailAddressesInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutEmailAddressesInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutEmailAddressesInputSchema),z.lazy(() => UserUpdateWithoutEmailAddressesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutEmailAddressesInputSchema) ]).optional(),
}).strict();

export const UserCreateNestedOneWithoutExternalAccountsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutExternalAccountsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutExternalAccountsInputSchema),z.lazy(() => UserUncheckedCreateWithoutExternalAccountsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutExternalAccountsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const UserUpdateOneRequiredWithoutExternalAccountsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutExternalAccountsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutExternalAccountsInputSchema),z.lazy(() => UserUncheckedCreateWithoutExternalAccountsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutExternalAccountsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutExternalAccountsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutExternalAccountsInputSchema),z.lazy(() => UserUpdateWithoutExternalAccountsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutExternalAccountsInputSchema) ]).optional(),
}).strict();

export const ListingCreateNestedOneWithoutImagesInputSchema: z.ZodType<Prisma.ListingCreateNestedOneWithoutImagesInput> = z.object({
  create: z.union([ z.lazy(() => ListingCreateWithoutImagesInputSchema),z.lazy(() => ListingUncheckedCreateWithoutImagesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ListingCreateOrConnectWithoutImagesInputSchema).optional(),
  connect: z.lazy(() => ListingWhereUniqueInputSchema).optional()
}).strict();

export const ListingUpdateOneWithoutImagesNestedInputSchema: z.ZodType<Prisma.ListingUpdateOneWithoutImagesNestedInput> = z.object({
  create: z.union([ z.lazy(() => ListingCreateWithoutImagesInputSchema),z.lazy(() => ListingUncheckedCreateWithoutImagesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ListingCreateOrConnectWithoutImagesInputSchema).optional(),
  upsert: z.lazy(() => ListingUpsertWithoutImagesInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => ListingWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => ListingWhereInputSchema) ]).optional(),
  connect: z.lazy(() => ListingWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ListingUpdateToOneWithWhereWithoutImagesInputSchema),z.lazy(() => ListingUpdateWithoutImagesInputSchema),z.lazy(() => ListingUncheckedUpdateWithoutImagesInputSchema) ]).optional(),
}).strict();

export const ListingCreateamenitiesInputSchema: z.ZodType<Prisma.ListingCreateamenitiesInput> = z.object({
  set: z.string().array()
}).strict();

export const UserCreateNestedOneWithoutListingsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutListingsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutListingsInputSchema),z.lazy(() => UserUncheckedCreateWithoutListingsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutListingsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const UploadedPhotoCreateNestedManyWithoutListingInputSchema: z.ZodType<Prisma.UploadedPhotoCreateNestedManyWithoutListingInput> = z.object({
  create: z.union([ z.lazy(() => UploadedPhotoCreateWithoutListingInputSchema),z.lazy(() => UploadedPhotoCreateWithoutListingInputSchema).array(),z.lazy(() => UploadedPhotoUncheckedCreateWithoutListingInputSchema),z.lazy(() => UploadedPhotoUncheckedCreateWithoutListingInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UploadedPhotoCreateOrConnectWithoutListingInputSchema),z.lazy(() => UploadedPhotoCreateOrConnectWithoutListingInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UploadedPhotoCreateManyListingInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UploadedPhotoWhereUniqueInputSchema),z.lazy(() => UploadedPhotoWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ListingInventoryCreateNestedManyWithoutListingInputSchema: z.ZodType<Prisma.ListingInventoryCreateNestedManyWithoutListingInput> = z.object({
  create: z.union([ z.lazy(() => ListingInventoryCreateWithoutListingInputSchema),z.lazy(() => ListingInventoryCreateWithoutListingInputSchema).array(),z.lazy(() => ListingInventoryUncheckedCreateWithoutListingInputSchema),z.lazy(() => ListingInventoryUncheckedCreateWithoutListingInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ListingInventoryCreateOrConnectWithoutListingInputSchema),z.lazy(() => ListingInventoryCreateOrConnectWithoutListingInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ListingInventoryCreateManyListingInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ListingInventoryWhereUniqueInputSchema),z.lazy(() => ListingInventoryWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const BookingRequestCreateNestedManyWithoutListingInputSchema: z.ZodType<Prisma.BookingRequestCreateNestedManyWithoutListingInput> = z.object({
  create: z.union([ z.lazy(() => BookingRequestCreateWithoutListingInputSchema),z.lazy(() => BookingRequestCreateWithoutListingInputSchema).array(),z.lazy(() => BookingRequestUncheckedCreateWithoutListingInputSchema),z.lazy(() => BookingRequestUncheckedCreateWithoutListingInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BookingRequestCreateOrConnectWithoutListingInputSchema),z.lazy(() => BookingRequestCreateOrConnectWithoutListingInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BookingRequestCreateManyListingInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => BookingRequestWhereUniqueInputSchema),z.lazy(() => BookingRequestWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UploadedPhotoUncheckedCreateNestedManyWithoutListingInputSchema: z.ZodType<Prisma.UploadedPhotoUncheckedCreateNestedManyWithoutListingInput> = z.object({
  create: z.union([ z.lazy(() => UploadedPhotoCreateWithoutListingInputSchema),z.lazy(() => UploadedPhotoCreateWithoutListingInputSchema).array(),z.lazy(() => UploadedPhotoUncheckedCreateWithoutListingInputSchema),z.lazy(() => UploadedPhotoUncheckedCreateWithoutListingInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UploadedPhotoCreateOrConnectWithoutListingInputSchema),z.lazy(() => UploadedPhotoCreateOrConnectWithoutListingInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UploadedPhotoCreateManyListingInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UploadedPhotoWhereUniqueInputSchema),z.lazy(() => UploadedPhotoWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ListingInventoryUncheckedCreateNestedManyWithoutListingInputSchema: z.ZodType<Prisma.ListingInventoryUncheckedCreateNestedManyWithoutListingInput> = z.object({
  create: z.union([ z.lazy(() => ListingInventoryCreateWithoutListingInputSchema),z.lazy(() => ListingInventoryCreateWithoutListingInputSchema).array(),z.lazy(() => ListingInventoryUncheckedCreateWithoutListingInputSchema),z.lazy(() => ListingInventoryUncheckedCreateWithoutListingInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ListingInventoryCreateOrConnectWithoutListingInputSchema),z.lazy(() => ListingInventoryCreateOrConnectWithoutListingInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ListingInventoryCreateManyListingInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ListingInventoryWhereUniqueInputSchema),z.lazy(() => ListingInventoryWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const BookingRequestUncheckedCreateNestedManyWithoutListingInputSchema: z.ZodType<Prisma.BookingRequestUncheckedCreateNestedManyWithoutListingInput> = z.object({
  create: z.union([ z.lazy(() => BookingRequestCreateWithoutListingInputSchema),z.lazy(() => BookingRequestCreateWithoutListingInputSchema).array(),z.lazy(() => BookingRequestUncheckedCreateWithoutListingInputSchema),z.lazy(() => BookingRequestUncheckedCreateWithoutListingInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BookingRequestCreateOrConnectWithoutListingInputSchema),z.lazy(() => BookingRequestCreateOrConnectWithoutListingInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BookingRequestCreateManyListingInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => BookingRequestWhereUniqueInputSchema),z.lazy(() => BookingRequestWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const NullableFloatFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableFloatFieldUpdateOperationsInput> = z.object({
  set: z.number().optional().nullable(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional()
}).strict();

export const ListingUpdateamenitiesInputSchema: z.ZodType<Prisma.ListingUpdateamenitiesInput> = z.object({
  set: z.string().array().optional(),
  push: z.union([ z.string(),z.string().array() ]).optional(),
}).strict();

export const FloatFieldUpdateOperationsInputSchema: z.ZodType<Prisma.FloatFieldUpdateOperationsInput> = z.object({
  set: z.number().optional(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional()
}).strict();

export const EnumCurrencyFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumCurrencyFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => CurrencySchema).optional()
}).strict();

export const UserUpdateOneRequiredWithoutListingsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutListingsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutListingsInputSchema),z.lazy(() => UserUncheckedCreateWithoutListingsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutListingsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutListingsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutListingsInputSchema),z.lazy(() => UserUpdateWithoutListingsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutListingsInputSchema) ]).optional(),
}).strict();

export const UploadedPhotoUpdateManyWithoutListingNestedInputSchema: z.ZodType<Prisma.UploadedPhotoUpdateManyWithoutListingNestedInput> = z.object({
  create: z.union([ z.lazy(() => UploadedPhotoCreateWithoutListingInputSchema),z.lazy(() => UploadedPhotoCreateWithoutListingInputSchema).array(),z.lazy(() => UploadedPhotoUncheckedCreateWithoutListingInputSchema),z.lazy(() => UploadedPhotoUncheckedCreateWithoutListingInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UploadedPhotoCreateOrConnectWithoutListingInputSchema),z.lazy(() => UploadedPhotoCreateOrConnectWithoutListingInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UploadedPhotoUpsertWithWhereUniqueWithoutListingInputSchema),z.lazy(() => UploadedPhotoUpsertWithWhereUniqueWithoutListingInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UploadedPhotoCreateManyListingInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UploadedPhotoWhereUniqueInputSchema),z.lazy(() => UploadedPhotoWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UploadedPhotoWhereUniqueInputSchema),z.lazy(() => UploadedPhotoWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UploadedPhotoWhereUniqueInputSchema),z.lazy(() => UploadedPhotoWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UploadedPhotoWhereUniqueInputSchema),z.lazy(() => UploadedPhotoWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UploadedPhotoUpdateWithWhereUniqueWithoutListingInputSchema),z.lazy(() => UploadedPhotoUpdateWithWhereUniqueWithoutListingInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UploadedPhotoUpdateManyWithWhereWithoutListingInputSchema),z.lazy(() => UploadedPhotoUpdateManyWithWhereWithoutListingInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UploadedPhotoScalarWhereInputSchema),z.lazy(() => UploadedPhotoScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ListingInventoryUpdateManyWithoutListingNestedInputSchema: z.ZodType<Prisma.ListingInventoryUpdateManyWithoutListingNestedInput> = z.object({
  create: z.union([ z.lazy(() => ListingInventoryCreateWithoutListingInputSchema),z.lazy(() => ListingInventoryCreateWithoutListingInputSchema).array(),z.lazy(() => ListingInventoryUncheckedCreateWithoutListingInputSchema),z.lazy(() => ListingInventoryUncheckedCreateWithoutListingInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ListingInventoryCreateOrConnectWithoutListingInputSchema),z.lazy(() => ListingInventoryCreateOrConnectWithoutListingInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ListingInventoryUpsertWithWhereUniqueWithoutListingInputSchema),z.lazy(() => ListingInventoryUpsertWithWhereUniqueWithoutListingInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ListingInventoryCreateManyListingInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ListingInventoryWhereUniqueInputSchema),z.lazy(() => ListingInventoryWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ListingInventoryWhereUniqueInputSchema),z.lazy(() => ListingInventoryWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ListingInventoryWhereUniqueInputSchema),z.lazy(() => ListingInventoryWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ListingInventoryWhereUniqueInputSchema),z.lazy(() => ListingInventoryWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ListingInventoryUpdateWithWhereUniqueWithoutListingInputSchema),z.lazy(() => ListingInventoryUpdateWithWhereUniqueWithoutListingInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ListingInventoryUpdateManyWithWhereWithoutListingInputSchema),z.lazy(() => ListingInventoryUpdateManyWithWhereWithoutListingInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ListingInventoryScalarWhereInputSchema),z.lazy(() => ListingInventoryScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const BookingRequestUpdateManyWithoutListingNestedInputSchema: z.ZodType<Prisma.BookingRequestUpdateManyWithoutListingNestedInput> = z.object({
  create: z.union([ z.lazy(() => BookingRequestCreateWithoutListingInputSchema),z.lazy(() => BookingRequestCreateWithoutListingInputSchema).array(),z.lazy(() => BookingRequestUncheckedCreateWithoutListingInputSchema),z.lazy(() => BookingRequestUncheckedCreateWithoutListingInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BookingRequestCreateOrConnectWithoutListingInputSchema),z.lazy(() => BookingRequestCreateOrConnectWithoutListingInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => BookingRequestUpsertWithWhereUniqueWithoutListingInputSchema),z.lazy(() => BookingRequestUpsertWithWhereUniqueWithoutListingInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BookingRequestCreateManyListingInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => BookingRequestWhereUniqueInputSchema),z.lazy(() => BookingRequestWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => BookingRequestWhereUniqueInputSchema),z.lazy(() => BookingRequestWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => BookingRequestWhereUniqueInputSchema),z.lazy(() => BookingRequestWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => BookingRequestWhereUniqueInputSchema),z.lazy(() => BookingRequestWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => BookingRequestUpdateWithWhereUniqueWithoutListingInputSchema),z.lazy(() => BookingRequestUpdateWithWhereUniqueWithoutListingInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => BookingRequestUpdateManyWithWhereWithoutListingInputSchema),z.lazy(() => BookingRequestUpdateManyWithWhereWithoutListingInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => BookingRequestScalarWhereInputSchema),z.lazy(() => BookingRequestScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UploadedPhotoUncheckedUpdateManyWithoutListingNestedInputSchema: z.ZodType<Prisma.UploadedPhotoUncheckedUpdateManyWithoutListingNestedInput> = z.object({
  create: z.union([ z.lazy(() => UploadedPhotoCreateWithoutListingInputSchema),z.lazy(() => UploadedPhotoCreateWithoutListingInputSchema).array(),z.lazy(() => UploadedPhotoUncheckedCreateWithoutListingInputSchema),z.lazy(() => UploadedPhotoUncheckedCreateWithoutListingInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UploadedPhotoCreateOrConnectWithoutListingInputSchema),z.lazy(() => UploadedPhotoCreateOrConnectWithoutListingInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UploadedPhotoUpsertWithWhereUniqueWithoutListingInputSchema),z.lazy(() => UploadedPhotoUpsertWithWhereUniqueWithoutListingInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UploadedPhotoCreateManyListingInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UploadedPhotoWhereUniqueInputSchema),z.lazy(() => UploadedPhotoWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UploadedPhotoWhereUniqueInputSchema),z.lazy(() => UploadedPhotoWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UploadedPhotoWhereUniqueInputSchema),z.lazy(() => UploadedPhotoWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UploadedPhotoWhereUniqueInputSchema),z.lazy(() => UploadedPhotoWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UploadedPhotoUpdateWithWhereUniqueWithoutListingInputSchema),z.lazy(() => UploadedPhotoUpdateWithWhereUniqueWithoutListingInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UploadedPhotoUpdateManyWithWhereWithoutListingInputSchema),z.lazy(() => UploadedPhotoUpdateManyWithWhereWithoutListingInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UploadedPhotoScalarWhereInputSchema),z.lazy(() => UploadedPhotoScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ListingInventoryUncheckedUpdateManyWithoutListingNestedInputSchema: z.ZodType<Prisma.ListingInventoryUncheckedUpdateManyWithoutListingNestedInput> = z.object({
  create: z.union([ z.lazy(() => ListingInventoryCreateWithoutListingInputSchema),z.lazy(() => ListingInventoryCreateWithoutListingInputSchema).array(),z.lazy(() => ListingInventoryUncheckedCreateWithoutListingInputSchema),z.lazy(() => ListingInventoryUncheckedCreateWithoutListingInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ListingInventoryCreateOrConnectWithoutListingInputSchema),z.lazy(() => ListingInventoryCreateOrConnectWithoutListingInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ListingInventoryUpsertWithWhereUniqueWithoutListingInputSchema),z.lazy(() => ListingInventoryUpsertWithWhereUniqueWithoutListingInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ListingInventoryCreateManyListingInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ListingInventoryWhereUniqueInputSchema),z.lazy(() => ListingInventoryWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ListingInventoryWhereUniqueInputSchema),z.lazy(() => ListingInventoryWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ListingInventoryWhereUniqueInputSchema),z.lazy(() => ListingInventoryWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ListingInventoryWhereUniqueInputSchema),z.lazy(() => ListingInventoryWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ListingInventoryUpdateWithWhereUniqueWithoutListingInputSchema),z.lazy(() => ListingInventoryUpdateWithWhereUniqueWithoutListingInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ListingInventoryUpdateManyWithWhereWithoutListingInputSchema),z.lazy(() => ListingInventoryUpdateManyWithWhereWithoutListingInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ListingInventoryScalarWhereInputSchema),z.lazy(() => ListingInventoryScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const BookingRequestUncheckedUpdateManyWithoutListingNestedInputSchema: z.ZodType<Prisma.BookingRequestUncheckedUpdateManyWithoutListingNestedInput> = z.object({
  create: z.union([ z.lazy(() => BookingRequestCreateWithoutListingInputSchema),z.lazy(() => BookingRequestCreateWithoutListingInputSchema).array(),z.lazy(() => BookingRequestUncheckedCreateWithoutListingInputSchema),z.lazy(() => BookingRequestUncheckedCreateWithoutListingInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BookingRequestCreateOrConnectWithoutListingInputSchema),z.lazy(() => BookingRequestCreateOrConnectWithoutListingInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => BookingRequestUpsertWithWhereUniqueWithoutListingInputSchema),z.lazy(() => BookingRequestUpsertWithWhereUniqueWithoutListingInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BookingRequestCreateManyListingInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => BookingRequestWhereUniqueInputSchema),z.lazy(() => BookingRequestWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => BookingRequestWhereUniqueInputSchema),z.lazy(() => BookingRequestWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => BookingRequestWhereUniqueInputSchema),z.lazy(() => BookingRequestWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => BookingRequestWhereUniqueInputSchema),z.lazy(() => BookingRequestWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => BookingRequestUpdateWithWhereUniqueWithoutListingInputSchema),z.lazy(() => BookingRequestUpdateWithWhereUniqueWithoutListingInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => BookingRequestUpdateManyWithWhereWithoutListingInputSchema),z.lazy(() => BookingRequestUpdateManyWithWhereWithoutListingInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => BookingRequestScalarWhereInputSchema),z.lazy(() => BookingRequestScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ListingCreateNestedOneWithoutInventoryInputSchema: z.ZodType<Prisma.ListingCreateNestedOneWithoutInventoryInput> = z.object({
  create: z.union([ z.lazy(() => ListingCreateWithoutInventoryInputSchema),z.lazy(() => ListingUncheckedCreateWithoutInventoryInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ListingCreateOrConnectWithoutInventoryInputSchema).optional(),
  connect: z.lazy(() => ListingWhereUniqueInputSchema).optional()
}).strict();

export const BookingCreateNestedOneWithoutListingInventoryInputSchema: z.ZodType<Prisma.BookingCreateNestedOneWithoutListingInventoryInput> = z.object({
  create: z.union([ z.lazy(() => BookingCreateWithoutListingInventoryInputSchema),z.lazy(() => BookingUncheckedCreateWithoutListingInventoryInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => BookingCreateOrConnectWithoutListingInventoryInputSchema).optional(),
  connect: z.lazy(() => BookingWhereUniqueInputSchema).optional()
}).strict();

export const ListingUpdateOneRequiredWithoutInventoryNestedInputSchema: z.ZodType<Prisma.ListingUpdateOneRequiredWithoutInventoryNestedInput> = z.object({
  create: z.union([ z.lazy(() => ListingCreateWithoutInventoryInputSchema),z.lazy(() => ListingUncheckedCreateWithoutInventoryInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ListingCreateOrConnectWithoutInventoryInputSchema).optional(),
  upsert: z.lazy(() => ListingUpsertWithoutInventoryInputSchema).optional(),
  connect: z.lazy(() => ListingWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ListingUpdateToOneWithWhereWithoutInventoryInputSchema),z.lazy(() => ListingUpdateWithoutInventoryInputSchema),z.lazy(() => ListingUncheckedUpdateWithoutInventoryInputSchema) ]).optional(),
}).strict();

export const BookingUpdateOneWithoutListingInventoryNestedInputSchema: z.ZodType<Prisma.BookingUpdateOneWithoutListingInventoryNestedInput> = z.object({
  create: z.union([ z.lazy(() => BookingCreateWithoutListingInventoryInputSchema),z.lazy(() => BookingUncheckedCreateWithoutListingInventoryInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => BookingCreateOrConnectWithoutListingInventoryInputSchema).optional(),
  upsert: z.lazy(() => BookingUpsertWithoutListingInventoryInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => BookingWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => BookingWhereInputSchema) ]).optional(),
  connect: z.lazy(() => BookingWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => BookingUpdateToOneWithWhereWithoutListingInventoryInputSchema),z.lazy(() => BookingUpdateWithoutListingInventoryInputSchema),z.lazy(() => BookingUncheckedUpdateWithoutListingInventoryInputSchema) ]).optional(),
}).strict();

export const UserCreateNestedOneWithoutBookingsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutBookingsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutBookingsInputSchema),z.lazy(() => UserUncheckedCreateWithoutBookingsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutBookingsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const BookingRequestCreateNestedOneWithoutBookingInputSchema: z.ZodType<Prisma.BookingRequestCreateNestedOneWithoutBookingInput> = z.object({
  create: z.union([ z.lazy(() => BookingRequestCreateWithoutBookingInputSchema),z.lazy(() => BookingRequestUncheckedCreateWithoutBookingInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => BookingRequestCreateOrConnectWithoutBookingInputSchema).optional(),
  connect: z.lazy(() => BookingRequestWhereUniqueInputSchema).optional()
}).strict();

export const ListingInventoryCreateNestedManyWithoutBookingInputSchema: z.ZodType<Prisma.ListingInventoryCreateNestedManyWithoutBookingInput> = z.object({
  create: z.union([ z.lazy(() => ListingInventoryCreateWithoutBookingInputSchema),z.lazy(() => ListingInventoryCreateWithoutBookingInputSchema).array(),z.lazy(() => ListingInventoryUncheckedCreateWithoutBookingInputSchema),z.lazy(() => ListingInventoryUncheckedCreateWithoutBookingInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ListingInventoryCreateOrConnectWithoutBookingInputSchema),z.lazy(() => ListingInventoryCreateOrConnectWithoutBookingInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ListingInventoryCreateManyBookingInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ListingInventoryWhereUniqueInputSchema),z.lazy(() => ListingInventoryWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ListingInventoryUncheckedCreateNestedManyWithoutBookingInputSchema: z.ZodType<Prisma.ListingInventoryUncheckedCreateNestedManyWithoutBookingInput> = z.object({
  create: z.union([ z.lazy(() => ListingInventoryCreateWithoutBookingInputSchema),z.lazy(() => ListingInventoryCreateWithoutBookingInputSchema).array(),z.lazy(() => ListingInventoryUncheckedCreateWithoutBookingInputSchema),z.lazy(() => ListingInventoryUncheckedCreateWithoutBookingInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ListingInventoryCreateOrConnectWithoutBookingInputSchema),z.lazy(() => ListingInventoryCreateOrConnectWithoutBookingInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ListingInventoryCreateManyBookingInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ListingInventoryWhereUniqueInputSchema),z.lazy(() => ListingInventoryWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const EnumBookingStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumBookingStatusFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => BookingStatusSchema).optional()
}).strict();

export const UserUpdateOneRequiredWithoutBookingsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutBookingsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutBookingsInputSchema),z.lazy(() => UserUncheckedCreateWithoutBookingsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutBookingsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutBookingsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutBookingsInputSchema),z.lazy(() => UserUpdateWithoutBookingsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutBookingsInputSchema) ]).optional(),
}).strict();

export const BookingRequestUpdateOneWithoutBookingNestedInputSchema: z.ZodType<Prisma.BookingRequestUpdateOneWithoutBookingNestedInput> = z.object({
  create: z.union([ z.lazy(() => BookingRequestCreateWithoutBookingInputSchema),z.lazy(() => BookingRequestUncheckedCreateWithoutBookingInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => BookingRequestCreateOrConnectWithoutBookingInputSchema).optional(),
  upsert: z.lazy(() => BookingRequestUpsertWithoutBookingInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => BookingRequestWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => BookingRequestWhereInputSchema) ]).optional(),
  connect: z.lazy(() => BookingRequestWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => BookingRequestUpdateToOneWithWhereWithoutBookingInputSchema),z.lazy(() => BookingRequestUpdateWithoutBookingInputSchema),z.lazy(() => BookingRequestUncheckedUpdateWithoutBookingInputSchema) ]).optional(),
}).strict();

export const ListingInventoryUpdateManyWithoutBookingNestedInputSchema: z.ZodType<Prisma.ListingInventoryUpdateManyWithoutBookingNestedInput> = z.object({
  create: z.union([ z.lazy(() => ListingInventoryCreateWithoutBookingInputSchema),z.lazy(() => ListingInventoryCreateWithoutBookingInputSchema).array(),z.lazy(() => ListingInventoryUncheckedCreateWithoutBookingInputSchema),z.lazy(() => ListingInventoryUncheckedCreateWithoutBookingInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ListingInventoryCreateOrConnectWithoutBookingInputSchema),z.lazy(() => ListingInventoryCreateOrConnectWithoutBookingInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ListingInventoryUpsertWithWhereUniqueWithoutBookingInputSchema),z.lazy(() => ListingInventoryUpsertWithWhereUniqueWithoutBookingInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ListingInventoryCreateManyBookingInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ListingInventoryWhereUniqueInputSchema),z.lazy(() => ListingInventoryWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ListingInventoryWhereUniqueInputSchema),z.lazy(() => ListingInventoryWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ListingInventoryWhereUniqueInputSchema),z.lazy(() => ListingInventoryWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ListingInventoryWhereUniqueInputSchema),z.lazy(() => ListingInventoryWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ListingInventoryUpdateWithWhereUniqueWithoutBookingInputSchema),z.lazy(() => ListingInventoryUpdateWithWhereUniqueWithoutBookingInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ListingInventoryUpdateManyWithWhereWithoutBookingInputSchema),z.lazy(() => ListingInventoryUpdateManyWithWhereWithoutBookingInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ListingInventoryScalarWhereInputSchema),z.lazy(() => ListingInventoryScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ListingInventoryUncheckedUpdateManyWithoutBookingNestedInputSchema: z.ZodType<Prisma.ListingInventoryUncheckedUpdateManyWithoutBookingNestedInput> = z.object({
  create: z.union([ z.lazy(() => ListingInventoryCreateWithoutBookingInputSchema),z.lazy(() => ListingInventoryCreateWithoutBookingInputSchema).array(),z.lazy(() => ListingInventoryUncheckedCreateWithoutBookingInputSchema),z.lazy(() => ListingInventoryUncheckedCreateWithoutBookingInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ListingInventoryCreateOrConnectWithoutBookingInputSchema),z.lazy(() => ListingInventoryCreateOrConnectWithoutBookingInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ListingInventoryUpsertWithWhereUniqueWithoutBookingInputSchema),z.lazy(() => ListingInventoryUpsertWithWhereUniqueWithoutBookingInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ListingInventoryCreateManyBookingInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ListingInventoryWhereUniqueInputSchema),z.lazy(() => ListingInventoryWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ListingInventoryWhereUniqueInputSchema),z.lazy(() => ListingInventoryWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ListingInventoryWhereUniqueInputSchema),z.lazy(() => ListingInventoryWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ListingInventoryWhereUniqueInputSchema),z.lazy(() => ListingInventoryWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ListingInventoryUpdateWithWhereUniqueWithoutBookingInputSchema),z.lazy(() => ListingInventoryUpdateWithWhereUniqueWithoutBookingInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ListingInventoryUpdateManyWithWhereWithoutBookingInputSchema),z.lazy(() => ListingInventoryUpdateManyWithWhereWithoutBookingInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ListingInventoryScalarWhereInputSchema),z.lazy(() => ListingInventoryScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserCreateNestedOneWithoutBookingRequestInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutBookingRequestInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutBookingRequestInputSchema),z.lazy(() => UserUncheckedCreateWithoutBookingRequestInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutBookingRequestInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const ListingCreateNestedOneWithoutBookingRequestInputSchema: z.ZodType<Prisma.ListingCreateNestedOneWithoutBookingRequestInput> = z.object({
  create: z.union([ z.lazy(() => ListingCreateWithoutBookingRequestInputSchema),z.lazy(() => ListingUncheckedCreateWithoutBookingRequestInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ListingCreateOrConnectWithoutBookingRequestInputSchema).optional(),
  connect: z.lazy(() => ListingWhereUniqueInputSchema).optional()
}).strict();

export const BookingCreateNestedManyWithoutBookingRequestInputSchema: z.ZodType<Prisma.BookingCreateNestedManyWithoutBookingRequestInput> = z.object({
  create: z.union([ z.lazy(() => BookingCreateWithoutBookingRequestInputSchema),z.lazy(() => BookingCreateWithoutBookingRequestInputSchema).array(),z.lazy(() => BookingUncheckedCreateWithoutBookingRequestInputSchema),z.lazy(() => BookingUncheckedCreateWithoutBookingRequestInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BookingCreateOrConnectWithoutBookingRequestInputSchema),z.lazy(() => BookingCreateOrConnectWithoutBookingRequestInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BookingCreateManyBookingRequestInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => BookingWhereUniqueInputSchema),z.lazy(() => BookingWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const BookingRequestCreateNestedOneWithoutAlterationsInputSchema: z.ZodType<Prisma.BookingRequestCreateNestedOneWithoutAlterationsInput> = z.object({
  create: z.union([ z.lazy(() => BookingRequestCreateWithoutAlterationsInputSchema),z.lazy(() => BookingRequestUncheckedCreateWithoutAlterationsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => BookingRequestCreateOrConnectWithoutAlterationsInputSchema).optional(),
  connect: z.lazy(() => BookingRequestWhereUniqueInputSchema).optional()
}).strict();

export const BookingRequestCreateNestedManyWithoutOriginalRequestInputSchema: z.ZodType<Prisma.BookingRequestCreateNestedManyWithoutOriginalRequestInput> = z.object({
  create: z.union([ z.lazy(() => BookingRequestCreateWithoutOriginalRequestInputSchema),z.lazy(() => BookingRequestCreateWithoutOriginalRequestInputSchema).array(),z.lazy(() => BookingRequestUncheckedCreateWithoutOriginalRequestInputSchema),z.lazy(() => BookingRequestUncheckedCreateWithoutOriginalRequestInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BookingRequestCreateOrConnectWithoutOriginalRequestInputSchema),z.lazy(() => BookingRequestCreateOrConnectWithoutOriginalRequestInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BookingRequestCreateManyOriginalRequestInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => BookingRequestWhereUniqueInputSchema),z.lazy(() => BookingRequestWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const BookingUncheckedCreateNestedManyWithoutBookingRequestInputSchema: z.ZodType<Prisma.BookingUncheckedCreateNestedManyWithoutBookingRequestInput> = z.object({
  create: z.union([ z.lazy(() => BookingCreateWithoutBookingRequestInputSchema),z.lazy(() => BookingCreateWithoutBookingRequestInputSchema).array(),z.lazy(() => BookingUncheckedCreateWithoutBookingRequestInputSchema),z.lazy(() => BookingUncheckedCreateWithoutBookingRequestInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BookingCreateOrConnectWithoutBookingRequestInputSchema),z.lazy(() => BookingCreateOrConnectWithoutBookingRequestInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BookingCreateManyBookingRequestInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => BookingWhereUniqueInputSchema),z.lazy(() => BookingWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const BookingRequestUncheckedCreateNestedManyWithoutOriginalRequestInputSchema: z.ZodType<Prisma.BookingRequestUncheckedCreateNestedManyWithoutOriginalRequestInput> = z.object({
  create: z.union([ z.lazy(() => BookingRequestCreateWithoutOriginalRequestInputSchema),z.lazy(() => BookingRequestCreateWithoutOriginalRequestInputSchema).array(),z.lazy(() => BookingRequestUncheckedCreateWithoutOriginalRequestInputSchema),z.lazy(() => BookingRequestUncheckedCreateWithoutOriginalRequestInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BookingRequestCreateOrConnectWithoutOriginalRequestInputSchema),z.lazy(() => BookingRequestCreateOrConnectWithoutOriginalRequestInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BookingRequestCreateManyOriginalRequestInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => BookingRequestWhereUniqueInputSchema),z.lazy(() => BookingRequestWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const EnumBookingRequestStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumBookingRequestStatusFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => BookingRequestStatusSchema).optional()
}).strict();

export const UserUpdateOneRequiredWithoutBookingRequestNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutBookingRequestNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutBookingRequestInputSchema),z.lazy(() => UserUncheckedCreateWithoutBookingRequestInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutBookingRequestInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutBookingRequestInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutBookingRequestInputSchema),z.lazy(() => UserUpdateWithoutBookingRequestInputSchema),z.lazy(() => UserUncheckedUpdateWithoutBookingRequestInputSchema) ]).optional(),
}).strict();

export const ListingUpdateOneRequiredWithoutBookingRequestNestedInputSchema: z.ZodType<Prisma.ListingUpdateOneRequiredWithoutBookingRequestNestedInput> = z.object({
  create: z.union([ z.lazy(() => ListingCreateWithoutBookingRequestInputSchema),z.lazy(() => ListingUncheckedCreateWithoutBookingRequestInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ListingCreateOrConnectWithoutBookingRequestInputSchema).optional(),
  upsert: z.lazy(() => ListingUpsertWithoutBookingRequestInputSchema).optional(),
  connect: z.lazy(() => ListingWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ListingUpdateToOneWithWhereWithoutBookingRequestInputSchema),z.lazy(() => ListingUpdateWithoutBookingRequestInputSchema),z.lazy(() => ListingUncheckedUpdateWithoutBookingRequestInputSchema) ]).optional(),
}).strict();

export const BookingUpdateManyWithoutBookingRequestNestedInputSchema: z.ZodType<Prisma.BookingUpdateManyWithoutBookingRequestNestedInput> = z.object({
  create: z.union([ z.lazy(() => BookingCreateWithoutBookingRequestInputSchema),z.lazy(() => BookingCreateWithoutBookingRequestInputSchema).array(),z.lazy(() => BookingUncheckedCreateWithoutBookingRequestInputSchema),z.lazy(() => BookingUncheckedCreateWithoutBookingRequestInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BookingCreateOrConnectWithoutBookingRequestInputSchema),z.lazy(() => BookingCreateOrConnectWithoutBookingRequestInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => BookingUpsertWithWhereUniqueWithoutBookingRequestInputSchema),z.lazy(() => BookingUpsertWithWhereUniqueWithoutBookingRequestInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BookingCreateManyBookingRequestInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => BookingWhereUniqueInputSchema),z.lazy(() => BookingWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => BookingWhereUniqueInputSchema),z.lazy(() => BookingWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => BookingWhereUniqueInputSchema),z.lazy(() => BookingWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => BookingWhereUniqueInputSchema),z.lazy(() => BookingWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => BookingUpdateWithWhereUniqueWithoutBookingRequestInputSchema),z.lazy(() => BookingUpdateWithWhereUniqueWithoutBookingRequestInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => BookingUpdateManyWithWhereWithoutBookingRequestInputSchema),z.lazy(() => BookingUpdateManyWithWhereWithoutBookingRequestInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => BookingScalarWhereInputSchema),z.lazy(() => BookingScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const BookingRequestUpdateOneWithoutAlterationsNestedInputSchema: z.ZodType<Prisma.BookingRequestUpdateOneWithoutAlterationsNestedInput> = z.object({
  create: z.union([ z.lazy(() => BookingRequestCreateWithoutAlterationsInputSchema),z.lazy(() => BookingRequestUncheckedCreateWithoutAlterationsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => BookingRequestCreateOrConnectWithoutAlterationsInputSchema).optional(),
  upsert: z.lazy(() => BookingRequestUpsertWithoutAlterationsInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => BookingRequestWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => BookingRequestWhereInputSchema) ]).optional(),
  connect: z.lazy(() => BookingRequestWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => BookingRequestUpdateToOneWithWhereWithoutAlterationsInputSchema),z.lazy(() => BookingRequestUpdateWithoutAlterationsInputSchema),z.lazy(() => BookingRequestUncheckedUpdateWithoutAlterationsInputSchema) ]).optional(),
}).strict();

export const BookingRequestUpdateManyWithoutOriginalRequestNestedInputSchema: z.ZodType<Prisma.BookingRequestUpdateManyWithoutOriginalRequestNestedInput> = z.object({
  create: z.union([ z.lazy(() => BookingRequestCreateWithoutOriginalRequestInputSchema),z.lazy(() => BookingRequestCreateWithoutOriginalRequestInputSchema).array(),z.lazy(() => BookingRequestUncheckedCreateWithoutOriginalRequestInputSchema),z.lazy(() => BookingRequestUncheckedCreateWithoutOriginalRequestInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BookingRequestCreateOrConnectWithoutOriginalRequestInputSchema),z.lazy(() => BookingRequestCreateOrConnectWithoutOriginalRequestInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => BookingRequestUpsertWithWhereUniqueWithoutOriginalRequestInputSchema),z.lazy(() => BookingRequestUpsertWithWhereUniqueWithoutOriginalRequestInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BookingRequestCreateManyOriginalRequestInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => BookingRequestWhereUniqueInputSchema),z.lazy(() => BookingRequestWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => BookingRequestWhereUniqueInputSchema),z.lazy(() => BookingRequestWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => BookingRequestWhereUniqueInputSchema),z.lazy(() => BookingRequestWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => BookingRequestWhereUniqueInputSchema),z.lazy(() => BookingRequestWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => BookingRequestUpdateWithWhereUniqueWithoutOriginalRequestInputSchema),z.lazy(() => BookingRequestUpdateWithWhereUniqueWithoutOriginalRequestInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => BookingRequestUpdateManyWithWhereWithoutOriginalRequestInputSchema),z.lazy(() => BookingRequestUpdateManyWithWhereWithoutOriginalRequestInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => BookingRequestScalarWhereInputSchema),z.lazy(() => BookingRequestScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const BookingUncheckedUpdateManyWithoutBookingRequestNestedInputSchema: z.ZodType<Prisma.BookingUncheckedUpdateManyWithoutBookingRequestNestedInput> = z.object({
  create: z.union([ z.lazy(() => BookingCreateWithoutBookingRequestInputSchema),z.lazy(() => BookingCreateWithoutBookingRequestInputSchema).array(),z.lazy(() => BookingUncheckedCreateWithoutBookingRequestInputSchema),z.lazy(() => BookingUncheckedCreateWithoutBookingRequestInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BookingCreateOrConnectWithoutBookingRequestInputSchema),z.lazy(() => BookingCreateOrConnectWithoutBookingRequestInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => BookingUpsertWithWhereUniqueWithoutBookingRequestInputSchema),z.lazy(() => BookingUpsertWithWhereUniqueWithoutBookingRequestInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BookingCreateManyBookingRequestInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => BookingWhereUniqueInputSchema),z.lazy(() => BookingWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => BookingWhereUniqueInputSchema),z.lazy(() => BookingWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => BookingWhereUniqueInputSchema),z.lazy(() => BookingWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => BookingWhereUniqueInputSchema),z.lazy(() => BookingWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => BookingUpdateWithWhereUniqueWithoutBookingRequestInputSchema),z.lazy(() => BookingUpdateWithWhereUniqueWithoutBookingRequestInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => BookingUpdateManyWithWhereWithoutBookingRequestInputSchema),z.lazy(() => BookingUpdateManyWithWhereWithoutBookingRequestInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => BookingScalarWhereInputSchema),z.lazy(() => BookingScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const BookingRequestUncheckedUpdateManyWithoutOriginalRequestNestedInputSchema: z.ZodType<Prisma.BookingRequestUncheckedUpdateManyWithoutOriginalRequestNestedInput> = z.object({
  create: z.union([ z.lazy(() => BookingRequestCreateWithoutOriginalRequestInputSchema),z.lazy(() => BookingRequestCreateWithoutOriginalRequestInputSchema).array(),z.lazy(() => BookingRequestUncheckedCreateWithoutOriginalRequestInputSchema),z.lazy(() => BookingRequestUncheckedCreateWithoutOriginalRequestInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BookingRequestCreateOrConnectWithoutOriginalRequestInputSchema),z.lazy(() => BookingRequestCreateOrConnectWithoutOriginalRequestInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => BookingRequestUpsertWithWhereUniqueWithoutOriginalRequestInputSchema),z.lazy(() => BookingRequestUpsertWithWhereUniqueWithoutOriginalRequestInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BookingRequestCreateManyOriginalRequestInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => BookingRequestWhereUniqueInputSchema),z.lazy(() => BookingRequestWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => BookingRequestWhereUniqueInputSchema),z.lazy(() => BookingRequestWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => BookingRequestWhereUniqueInputSchema),z.lazy(() => BookingRequestWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => BookingRequestWhereUniqueInputSchema),z.lazy(() => BookingRequestWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => BookingRequestUpdateWithWhereUniqueWithoutOriginalRequestInputSchema),z.lazy(() => BookingRequestUpdateWithWhereUniqueWithoutOriginalRequestInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => BookingRequestUpdateManyWithWhereWithoutOriginalRequestInputSchema),z.lazy(() => BookingRequestUpdateManyWithWhereWithoutOriginalRequestInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => BookingRequestScalarWhereInputSchema),z.lazy(() => BookingRequestScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserCreateNestedOneWithoutSessionsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutSessionsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutSessionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutSessionsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutSessionsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const UserUpdateOneRequiredWithoutSessionsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutSessionsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutSessionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutSessionsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutSessionsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutSessionsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutSessionsInputSchema),z.lazy(() => UserUpdateWithoutSessionsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutSessionsInputSchema) ]).optional(),
}).strict();

export const UserCreateNestedOneWithoutPasswordResetInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutPasswordResetInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutPasswordResetInputSchema),z.lazy(() => UserUncheckedCreateWithoutPasswordResetInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutPasswordResetInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const UserUpdateOneRequiredWithoutPasswordResetNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutPasswordResetNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutPasswordResetInputSchema),z.lazy(() => UserUncheckedCreateWithoutPasswordResetInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutPasswordResetInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutPasswordResetInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutPasswordResetInputSchema),z.lazy(() => UserUpdateWithoutPasswordResetInputSchema),z.lazy(() => UserUncheckedUpdateWithoutPasswordResetInputSchema) ]).optional(),
}).strict();

export const NestedIntFilterSchema: z.ZodType<Prisma.NestedIntFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict();

export const NestedEnumRoleFilterSchema: z.ZodType<Prisma.NestedEnumRoleFilter> = z.object({
  equals: z.lazy(() => RoleSchema).optional(),
  in: z.lazy(() => RoleSchema).array().optional(),
  notIn: z.lazy(() => RoleSchema).array().optional(),
  not: z.union([ z.lazy(() => RoleSchema),z.lazy(() => NestedEnumRoleFilterSchema) ]).optional(),
}).strict();

export const NestedStringFilterSchema: z.ZodType<Prisma.NestedStringFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const NestedIntWithAggregatesFilterSchema: z.ZodType<Prisma.NestedIntWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional()
}).strict();

export const NestedFloatFilterSchema: z.ZodType<Prisma.NestedFloatFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatFilterSchema) ]).optional(),
}).strict();

export const NestedEnumRoleWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumRoleWithAggregatesFilter> = z.object({
  equals: z.lazy(() => RoleSchema).optional(),
  in: z.lazy(() => RoleSchema).array().optional(),
  notIn: z.lazy(() => RoleSchema).array().optional(),
  not: z.union([ z.lazy(() => RoleSchema),z.lazy(() => NestedEnumRoleWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumRoleFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumRoleFilterSchema).optional()
}).strict();

export const NestedStringWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const NestedEnumPermissionFilterSchema: z.ZodType<Prisma.NestedEnumPermissionFilter> = z.object({
  equals: z.lazy(() => PermissionSchema).optional(),
  in: z.lazy(() => PermissionSchema).array().optional(),
  notIn: z.lazy(() => PermissionSchema).array().optional(),
  not: z.union([ z.lazy(() => PermissionSchema),z.lazy(() => NestedEnumPermissionFilterSchema) ]).optional(),
}).strict();

export const NestedEnumPermissionWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumPermissionWithAggregatesFilter> = z.object({
  equals: z.lazy(() => PermissionSchema).optional(),
  in: z.lazy(() => PermissionSchema).array().optional(),
  notIn: z.lazy(() => PermissionSchema).array().optional(),
  not: z.union([ z.lazy(() => PermissionSchema),z.lazy(() => NestedEnumPermissionWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumPermissionFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumPermissionFilterSchema).optional()
}).strict();

export const NestedDateTimeFilterSchema: z.ZodType<Prisma.NestedDateTimeFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
}).strict();

export const NestedStringNullableFilterSchema: z.ZodType<Prisma.NestedStringNullableFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedDateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional()
}).strict();

export const NestedStringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringNullableWithAggregatesFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional()
}).strict();

export const NestedIntNullableFilterSchema: z.ZodType<Prisma.NestedIntNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedBoolFilterSchema: z.ZodType<Prisma.NestedBoolFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolFilterSchema) ]).optional(),
}).strict();

export const NestedBoolWithAggregatesFilterSchema: z.ZodType<Prisma.NestedBoolWithAggregatesFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolFilterSchema).optional()
}).strict();

export const NestedFloatNullableFilterSchema: z.ZodType<Prisma.NestedFloatNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedEnumCurrencyFilterSchema: z.ZodType<Prisma.NestedEnumCurrencyFilter> = z.object({
  equals: z.lazy(() => CurrencySchema).optional(),
  in: z.lazy(() => CurrencySchema).array().optional(),
  notIn: z.lazy(() => CurrencySchema).array().optional(),
  not: z.union([ z.lazy(() => CurrencySchema),z.lazy(() => NestedEnumCurrencyFilterSchema) ]).optional(),
}).strict();

export const NestedFloatNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedFloatNullableWithAggregatesFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _sum: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedFloatNullableFilterSchema).optional()
}).strict();

export const NestedFloatWithAggregatesFilterSchema: z.ZodType<Prisma.NestedFloatWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedFloatFilterSchema).optional(),
  _min: z.lazy(() => NestedFloatFilterSchema).optional(),
  _max: z.lazy(() => NestedFloatFilterSchema).optional()
}).strict();

export const NestedEnumCurrencyWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumCurrencyWithAggregatesFilter> = z.object({
  equals: z.lazy(() => CurrencySchema).optional(),
  in: z.lazy(() => CurrencySchema).array().optional(),
  notIn: z.lazy(() => CurrencySchema).array().optional(),
  not: z.union([ z.lazy(() => CurrencySchema),z.lazy(() => NestedEnumCurrencyWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumCurrencyFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumCurrencyFilterSchema).optional()
}).strict();

export const NestedEnumBookingStatusFilterSchema: z.ZodType<Prisma.NestedEnumBookingStatusFilter> = z.object({
  equals: z.lazy(() => BookingStatusSchema).optional(),
  in: z.lazy(() => BookingStatusSchema).array().optional(),
  notIn: z.lazy(() => BookingStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => BookingStatusSchema),z.lazy(() => NestedEnumBookingStatusFilterSchema) ]).optional(),
}).strict();

export const NestedEnumBookingStatusWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumBookingStatusWithAggregatesFilter> = z.object({
  equals: z.lazy(() => BookingStatusSchema).optional(),
  in: z.lazy(() => BookingStatusSchema).array().optional(),
  notIn: z.lazy(() => BookingStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => BookingStatusSchema),z.lazy(() => NestedEnumBookingStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumBookingStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumBookingStatusFilterSchema).optional()
}).strict();

export const NestedEnumBookingRequestStatusFilterSchema: z.ZodType<Prisma.NestedEnumBookingRequestStatusFilter> = z.object({
  equals: z.lazy(() => BookingRequestStatusSchema).optional(),
  in: z.lazy(() => BookingRequestStatusSchema).array().optional(),
  notIn: z.lazy(() => BookingRequestStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => BookingRequestStatusSchema),z.lazy(() => NestedEnumBookingRequestStatusFilterSchema) ]).optional(),
}).strict();

export const NestedEnumBookingRequestStatusWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumBookingRequestStatusWithAggregatesFilter> = z.object({
  equals: z.lazy(() => BookingRequestStatusSchema).optional(),
  in: z.lazy(() => BookingRequestStatusSchema).array().optional(),
  notIn: z.lazy(() => BookingRequestStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => BookingRequestStatusSchema),z.lazy(() => NestedEnumBookingRequestStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumBookingRequestStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumBookingRequestStatusFilterSchema).optional()
}).strict();

export const UserCreateWithoutRolesInputSchema: z.ZodType<Prisma.UserCreateWithoutRolesInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  firstName: z.string({required_error: "First name is required" }).optional().nullable(),
  lastName: z.string({required_error: "Last name is required" }).optional().nullable(),
  imageUrl: z.string({required_error: "Image URL must be valid" }).optional().nullable(),
  password: z.string({required_error: "Password must be at least 8 characters" }).optional().nullable(),
  emailAddresses: z.lazy(() => EmailAddressCreateNestedManyWithoutUserInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountCreateNestedManyWithoutUserInputSchema).optional(),
  listings: z.lazy(() => ListingCreateNestedManyWithoutOwnerInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionCreateNestedManyWithoutUserInputSchema).optional(),
  bookings: z.lazy(() => BookingCreateNestedManyWithoutUserInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestCreateNestedManyWithoutUserInputSchema).optional(),
  sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputSchema).optional(),
  passwordReset: z.lazy(() => PasswordResetCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutRolesInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutRolesInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  firstName: z.string({required_error: "First name is required" }).optional().nullable(),
  lastName: z.string({required_error: "Last name is required" }).optional().nullable(),
  imageUrl: z.string({required_error: "Image URL must be valid" }).optional().nullable(),
  password: z.string({required_error: "Password must be at least 8 characters" }).optional().nullable(),
  emailAddresses: z.lazy(() => EmailAddressUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  listings: z.lazy(() => ListingUncheckedCreateNestedManyWithoutOwnerInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  bookings: z.lazy(() => BookingUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  passwordReset: z.lazy(() => PasswordResetUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutRolesInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutRolesInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutRolesInputSchema),z.lazy(() => UserUncheckedCreateWithoutRolesInputSchema) ]),
}).strict();

export const UserUpsertWithoutRolesInputSchema: z.ZodType<Prisma.UserUpsertWithoutRolesInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutRolesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutRolesInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutRolesInputSchema),z.lazy(() => UserUncheckedCreateWithoutRolesInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutRolesInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutRolesInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutRolesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutRolesInputSchema) ]),
}).strict();

export const UserUpdateWithoutRolesInputSchema: z.ZodType<Prisma.UserUpdateWithoutRolesInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string({required_error: "First name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string({required_error: "Last name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string({required_error: "Image URL must be valid" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string({required_error: "Password must be at least 8 characters" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailAddresses: z.lazy(() => EmailAddressUpdateManyWithoutUserNestedInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountUpdateManyWithoutUserNestedInputSchema).optional(),
  listings: z.lazy(() => ListingUpdateManyWithoutOwnerNestedInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionUpdateManyWithoutUserNestedInputSchema).optional(),
  bookings: z.lazy(() => BookingUpdateManyWithoutUserNestedInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestUpdateManyWithoutUserNestedInputSchema).optional(),
  sessions: z.lazy(() => SessionUpdateManyWithoutUserNestedInputSchema).optional(),
  passwordReset: z.lazy(() => PasswordResetUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutRolesInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutRolesInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string({required_error: "First name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string({required_error: "Last name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string({required_error: "Image URL must be valid" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string({required_error: "Password must be at least 8 characters" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailAddresses: z.lazy(() => EmailAddressUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  listings: z.lazy(() => ListingUncheckedUpdateManyWithoutOwnerNestedInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  bookings: z.lazy(() => BookingUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  passwordReset: z.lazy(() => PasswordResetUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserCreateWithoutPermissionsInputSchema: z.ZodType<Prisma.UserCreateWithoutPermissionsInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  firstName: z.string({required_error: "First name is required" }).optional().nullable(),
  lastName: z.string({required_error: "Last name is required" }).optional().nullable(),
  imageUrl: z.string({required_error: "Image URL must be valid" }).optional().nullable(),
  password: z.string({required_error: "Password must be at least 8 characters" }).optional().nullable(),
  emailAddresses: z.lazy(() => EmailAddressCreateNestedManyWithoutUserInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountCreateNestedManyWithoutUserInputSchema).optional(),
  listings: z.lazy(() => ListingCreateNestedManyWithoutOwnerInputSchema).optional(),
  roles: z.lazy(() => UserRoleCreateNestedManyWithoutUserInputSchema).optional(),
  bookings: z.lazy(() => BookingCreateNestedManyWithoutUserInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestCreateNestedManyWithoutUserInputSchema).optional(),
  sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputSchema).optional(),
  passwordReset: z.lazy(() => PasswordResetCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutPermissionsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutPermissionsInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  firstName: z.string({required_error: "First name is required" }).optional().nullable(),
  lastName: z.string({required_error: "Last name is required" }).optional().nullable(),
  imageUrl: z.string({required_error: "Image URL must be valid" }).optional().nullable(),
  password: z.string({required_error: "Password must be at least 8 characters" }).optional().nullable(),
  emailAddresses: z.lazy(() => EmailAddressUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  listings: z.lazy(() => ListingUncheckedCreateNestedManyWithoutOwnerInputSchema).optional(),
  roles: z.lazy(() => UserRoleUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  bookings: z.lazy(() => BookingUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  passwordReset: z.lazy(() => PasswordResetUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutPermissionsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutPermissionsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutPermissionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutPermissionsInputSchema) ]),
}).strict();

export const UserUpsertWithoutPermissionsInputSchema: z.ZodType<Prisma.UserUpsertWithoutPermissionsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutPermissionsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutPermissionsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutPermissionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutPermissionsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutPermissionsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutPermissionsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutPermissionsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutPermissionsInputSchema) ]),
}).strict();

export const UserUpdateWithoutPermissionsInputSchema: z.ZodType<Prisma.UserUpdateWithoutPermissionsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string({required_error: "First name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string({required_error: "Last name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string({required_error: "Image URL must be valid" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string({required_error: "Password must be at least 8 characters" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailAddresses: z.lazy(() => EmailAddressUpdateManyWithoutUserNestedInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountUpdateManyWithoutUserNestedInputSchema).optional(),
  listings: z.lazy(() => ListingUpdateManyWithoutOwnerNestedInputSchema).optional(),
  roles: z.lazy(() => UserRoleUpdateManyWithoutUserNestedInputSchema).optional(),
  bookings: z.lazy(() => BookingUpdateManyWithoutUserNestedInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestUpdateManyWithoutUserNestedInputSchema).optional(),
  sessions: z.lazy(() => SessionUpdateManyWithoutUserNestedInputSchema).optional(),
  passwordReset: z.lazy(() => PasswordResetUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutPermissionsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutPermissionsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string({required_error: "First name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string({required_error: "Last name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string({required_error: "Image URL must be valid" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string({required_error: "Password must be at least 8 characters" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailAddresses: z.lazy(() => EmailAddressUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  listings: z.lazy(() => ListingUncheckedUpdateManyWithoutOwnerNestedInputSchema).optional(),
  roles: z.lazy(() => UserRoleUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  bookings: z.lazy(() => BookingUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  passwordReset: z.lazy(() => PasswordResetUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const EmailAddressCreateWithoutUserInputSchema: z.ZodType<Prisma.EmailAddressCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  emailAddress: z.string({required_error: "Email address is required" }).email({ message: "Must be a valid email address" }),
  isPrimary: z.boolean().optional(),
  verification: z.string().optional().nullable(),
  verified: z.boolean().optional()
}).strict();

export const EmailAddressUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.EmailAddressUncheckedCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  emailAddress: z.string({required_error: "Email address is required" }).email({ message: "Must be a valid email address" }),
  isPrimary: z.boolean().optional(),
  verification: z.string().optional().nullable(),
  verified: z.boolean().optional()
}).strict();

export const EmailAddressCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.EmailAddressCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => EmailAddressWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => EmailAddressCreateWithoutUserInputSchema),z.lazy(() => EmailAddressUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const EmailAddressCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.EmailAddressCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => EmailAddressCreateManyUserInputSchema),z.lazy(() => EmailAddressCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const ExternalAccountCreateWithoutUserInputSchema: z.ZodType<Prisma.ExternalAccountCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  provider: z.string({required_error: "Provider is required" }),
  externalId: z.string()
}).strict();

export const ExternalAccountUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.ExternalAccountUncheckedCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  provider: z.string({required_error: "Provider is required" }),
  externalId: z.string()
}).strict();

export const ExternalAccountCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.ExternalAccountCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => ExternalAccountWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ExternalAccountCreateWithoutUserInputSchema),z.lazy(() => ExternalAccountUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const ExternalAccountCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.ExternalAccountCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ExternalAccountCreateManyUserInputSchema),z.lazy(() => ExternalAccountCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const ListingCreateWithoutOwnerInputSchema: z.ZodType<Prisma.ListingCreateWithoutOwnerInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  title: z.string({required_error: "Title is required" }),
  slug: z.string({required_error: "Slug is required" }).optional(),
  description: z.string({required_error: "Description is required" }),
  propertyType: z.string({required_error: "Property type is required" }),
  address: z.string({required_error: "Address is required" }),
  latitude: z.number({ invalid_type_error: "Latitude must be a number" }).gt(-90, { message: "Latitude must be greater than -90" }).lt(90, { message: "Latitude must be less than 90" }).optional().nullable(),
  longitude: z.number({ invalid_type_error: "Longitude must be a number" }).gt(-180, { message: "Longitude must be greater than -180" }).lt(180, { message: "Longitude must be less than 180" }).optional().nullable(),
  timeZone: z.string({ invalid_type_error: "Time zone is required" }).optional(),
  checkInTime: z.string({ invalid_type_error: "Check-in time is required" }).optional(),
  checkOutTime: z.string({ invalid_type_error: "Check-out time is required" }).optional(),
  amenities: z.union([ z.lazy(() => ListingCreateamenitiesInputSchema),z.string().array() ]).optional(),
  pricePerNight: z.number().gt(0, { message: "Price per night must be greater than 0" }),
  currency: z.lazy(() => CurrencySchema).optional(),
  minimumStay: z.number().gt(0, { message: "Minimum stay must be greater than 0" }).optional(),
  maximumGuests: z.number().gt(0, { message: "Maximum guests must be greater than 0" }).optional(),
  houseRules: z.string({ invalid_type_error: "House rules are required" }),
  allowPets: z.boolean().optional(),
  petPolicy: z.string({ invalid_type_error: "Pet policy is required" }).optional(),
  published: z.boolean().optional(),
  showExactLocation: z.boolean().optional(),
  locationRadius: z.number().optional(),
  images: z.lazy(() => UploadedPhotoCreateNestedManyWithoutListingInputSchema).optional(),
  inventory: z.lazy(() => ListingInventoryCreateNestedManyWithoutListingInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestCreateNestedManyWithoutListingInputSchema).optional()
}).strict();

export const ListingUncheckedCreateWithoutOwnerInputSchema: z.ZodType<Prisma.ListingUncheckedCreateWithoutOwnerInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  title: z.string({required_error: "Title is required" }),
  slug: z.string({required_error: "Slug is required" }).optional(),
  description: z.string({required_error: "Description is required" }),
  propertyType: z.string({required_error: "Property type is required" }),
  address: z.string({required_error: "Address is required" }),
  latitude: z.number({ invalid_type_error: "Latitude must be a number" }).gt(-90, { message: "Latitude must be greater than -90" }).lt(90, { message: "Latitude must be less than 90" }).optional().nullable(),
  longitude: z.number({ invalid_type_error: "Longitude must be a number" }).gt(-180, { message: "Longitude must be greater than -180" }).lt(180, { message: "Longitude must be less than 180" }).optional().nullable(),
  timeZone: z.string({ invalid_type_error: "Time zone is required" }).optional(),
  checkInTime: z.string({ invalid_type_error: "Check-in time is required" }).optional(),
  checkOutTime: z.string({ invalid_type_error: "Check-out time is required" }).optional(),
  amenities: z.union([ z.lazy(() => ListingCreateamenitiesInputSchema),z.string().array() ]).optional(),
  pricePerNight: z.number().gt(0, { message: "Price per night must be greater than 0" }),
  currency: z.lazy(() => CurrencySchema).optional(),
  minimumStay: z.number().gt(0, { message: "Minimum stay must be greater than 0" }).optional(),
  maximumGuests: z.number().gt(0, { message: "Maximum guests must be greater than 0" }).optional(),
  houseRules: z.string({ invalid_type_error: "House rules are required" }),
  allowPets: z.boolean().optional(),
  petPolicy: z.string({ invalid_type_error: "Pet policy is required" }).optional(),
  published: z.boolean().optional(),
  showExactLocation: z.boolean().optional(),
  locationRadius: z.number().optional(),
  images: z.lazy(() => UploadedPhotoUncheckedCreateNestedManyWithoutListingInputSchema).optional(),
  inventory: z.lazy(() => ListingInventoryUncheckedCreateNestedManyWithoutListingInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestUncheckedCreateNestedManyWithoutListingInputSchema).optional()
}).strict();

export const ListingCreateOrConnectWithoutOwnerInputSchema: z.ZodType<Prisma.ListingCreateOrConnectWithoutOwnerInput> = z.object({
  where: z.lazy(() => ListingWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ListingCreateWithoutOwnerInputSchema),z.lazy(() => ListingUncheckedCreateWithoutOwnerInputSchema) ]),
}).strict();

export const ListingCreateManyOwnerInputEnvelopeSchema: z.ZodType<Prisma.ListingCreateManyOwnerInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ListingCreateManyOwnerInputSchema),z.lazy(() => ListingCreateManyOwnerInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const UserRoleCreateWithoutUserInputSchema: z.ZodType<Prisma.UserRoleCreateWithoutUserInput> = z.object({
  role: z.lazy(() => RoleSchema)
}).strict();

export const UserRoleUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.UserRoleUncheckedCreateWithoutUserInput> = z.object({
  id: z.number().int().optional(),
  role: z.lazy(() => RoleSchema)
}).strict();

export const UserRoleCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.UserRoleCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => UserRoleWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserRoleCreateWithoutUserInputSchema),z.lazy(() => UserRoleUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const UserRoleCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.UserRoleCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => UserRoleCreateManyUserInputSchema),z.lazy(() => UserRoleCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const UserPermissionCreateWithoutUserInputSchema: z.ZodType<Prisma.UserPermissionCreateWithoutUserInput> = z.object({
  permission: z.lazy(() => PermissionSchema)
}).strict();

export const UserPermissionUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.UserPermissionUncheckedCreateWithoutUserInput> = z.object({
  id: z.number().int().optional(),
  permission: z.lazy(() => PermissionSchema)
}).strict();

export const UserPermissionCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.UserPermissionCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => UserPermissionWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserPermissionCreateWithoutUserInputSchema),z.lazy(() => UserPermissionUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const UserPermissionCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.UserPermissionCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => UserPermissionCreateManyUserInputSchema),z.lazy(() => UserPermissionCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const BookingCreateWithoutUserInputSchema: z.ZodType<Prisma.BookingCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  checkIn: z.coerce.date({ invalid_type_error: "Check-in date is required" }),
  checkOut: z.coerce.date({ invalid_type_error: "Check-out date is required" }),
  totalPrice: z.number().positive({ message: "Total price must be greater than 0" }),
  status: z.lazy(() => BookingStatusSchema).optional(),
  bookingRequest: z.lazy(() => BookingRequestCreateNestedOneWithoutBookingInputSchema).optional(),
  listingInventory: z.lazy(() => ListingInventoryCreateNestedManyWithoutBookingInputSchema).optional()
}).strict();

export const BookingUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.BookingUncheckedCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  checkIn: z.coerce.date({ invalid_type_error: "Check-in date is required" }),
  checkOut: z.coerce.date({ invalid_type_error: "Check-out date is required" }),
  totalPrice: z.number().positive({ message: "Total price must be greater than 0" }),
  status: z.lazy(() => BookingStatusSchema).optional(),
  bookingRequestId: z.string().optional().nullable(),
  listingInventory: z.lazy(() => ListingInventoryUncheckedCreateNestedManyWithoutBookingInputSchema).optional()
}).strict();

export const BookingCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.BookingCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => BookingWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => BookingCreateWithoutUserInputSchema),z.lazy(() => BookingUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const BookingCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.BookingCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => BookingCreateManyUserInputSchema),z.lazy(() => BookingCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const BookingRequestCreateWithoutUserInputSchema: z.ZodType<Prisma.BookingRequestCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  message: z.string({ invalid_type_error: "Message is required" }),
  checkIn: z.coerce.date({ invalid_type_error: "Check-in date is required" }),
  checkOut: z.coerce.date({ invalid_type_error: "Check-out date is required" }),
  guests: z.number().int().min(1, { message: "At least 1 guest is required" }),
  pets: z.boolean().optional(),
  totalPrice: z.number().positive({ message: "Total price must be greater than 0" }).optional(),
  status: z.lazy(() => BookingRequestStatusSchema).optional(),
  listing: z.lazy(() => ListingCreateNestedOneWithoutBookingRequestInputSchema),
  Booking: z.lazy(() => BookingCreateNestedManyWithoutBookingRequestInputSchema).optional(),
  originalRequest: z.lazy(() => BookingRequestCreateNestedOneWithoutAlterationsInputSchema).optional(),
  alterations: z.lazy(() => BookingRequestCreateNestedManyWithoutOriginalRequestInputSchema).optional()
}).strict();

export const BookingRequestUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.BookingRequestUncheckedCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  message: z.string({ invalid_type_error: "Message is required" }),
  checkIn: z.coerce.date({ invalid_type_error: "Check-in date is required" }),
  checkOut: z.coerce.date({ invalid_type_error: "Check-out date is required" }),
  guests: z.number().int().min(1, { message: "At least 1 guest is required" }),
  pets: z.boolean().optional(),
  totalPrice: z.number().positive({ message: "Total price must be greater than 0" }).optional(),
  status: z.lazy(() => BookingRequestStatusSchema).optional(),
  alterationOf: z.string().optional().nullable(),
  listingId: z.string(),
  Booking: z.lazy(() => BookingUncheckedCreateNestedManyWithoutBookingRequestInputSchema).optional(),
  alterations: z.lazy(() => BookingRequestUncheckedCreateNestedManyWithoutOriginalRequestInputSchema).optional()
}).strict();

export const BookingRequestCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.BookingRequestCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => BookingRequestWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => BookingRequestCreateWithoutUserInputSchema),z.lazy(() => BookingRequestUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const BookingRequestCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.BookingRequestCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => BookingRequestCreateManyUserInputSchema),z.lazy(() => BookingRequestCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const SessionCreateWithoutUserInputSchema: z.ZodType<Prisma.SessionCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date().optional(),
  lastActive: z.coerce.date().optional()
}).strict();

export const SessionUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.SessionUncheckedCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date().optional(),
  lastActive: z.coerce.date().optional()
}).strict();

export const SessionCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.SessionCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => SessionWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => SessionCreateWithoutUserInputSchema),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const SessionCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.SessionCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => SessionCreateManyUserInputSchema),z.lazy(() => SessionCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const PasswordResetCreateWithoutUserInputSchema: z.ZodType<Prisma.PasswordResetCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  token: z.string(),
  expiresAt: z.coerce.date(),
  used: z.boolean().optional()
}).strict();

export const PasswordResetUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.PasswordResetUncheckedCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  token: z.string(),
  expiresAt: z.coerce.date(),
  used: z.boolean().optional()
}).strict();

export const PasswordResetCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.PasswordResetCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => PasswordResetWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => PasswordResetCreateWithoutUserInputSchema),z.lazy(() => PasswordResetUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const PasswordResetCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.PasswordResetCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => PasswordResetCreateManyUserInputSchema),z.lazy(() => PasswordResetCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const EmailAddressUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.EmailAddressUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => EmailAddressWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => EmailAddressUpdateWithoutUserInputSchema),z.lazy(() => EmailAddressUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => EmailAddressCreateWithoutUserInputSchema),z.lazy(() => EmailAddressUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const EmailAddressUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.EmailAddressUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => EmailAddressWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => EmailAddressUpdateWithoutUserInputSchema),z.lazy(() => EmailAddressUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const EmailAddressUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.EmailAddressUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => EmailAddressScalarWhereInputSchema),
  data: z.union([ z.lazy(() => EmailAddressUpdateManyMutationInputSchema),z.lazy(() => EmailAddressUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const EmailAddressScalarWhereInputSchema: z.ZodType<Prisma.EmailAddressScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => EmailAddressScalarWhereInputSchema),z.lazy(() => EmailAddressScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => EmailAddressScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EmailAddressScalarWhereInputSchema),z.lazy(() => EmailAddressScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  emailAddress: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  isPrimary: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  verification: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  verified: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
}).strict();

export const ExternalAccountUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.ExternalAccountUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => ExternalAccountWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ExternalAccountUpdateWithoutUserInputSchema),z.lazy(() => ExternalAccountUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => ExternalAccountCreateWithoutUserInputSchema),z.lazy(() => ExternalAccountUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const ExternalAccountUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.ExternalAccountUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => ExternalAccountWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ExternalAccountUpdateWithoutUserInputSchema),z.lazy(() => ExternalAccountUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const ExternalAccountUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.ExternalAccountUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => ExternalAccountScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ExternalAccountUpdateManyMutationInputSchema),z.lazy(() => ExternalAccountUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const ExternalAccountScalarWhereInputSchema: z.ZodType<Prisma.ExternalAccountScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ExternalAccountScalarWhereInputSchema),z.lazy(() => ExternalAccountScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ExternalAccountScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ExternalAccountScalarWhereInputSchema),z.lazy(() => ExternalAccountScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  provider: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  externalId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict();

export const ListingUpsertWithWhereUniqueWithoutOwnerInputSchema: z.ZodType<Prisma.ListingUpsertWithWhereUniqueWithoutOwnerInput> = z.object({
  where: z.lazy(() => ListingWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ListingUpdateWithoutOwnerInputSchema),z.lazy(() => ListingUncheckedUpdateWithoutOwnerInputSchema) ]),
  create: z.union([ z.lazy(() => ListingCreateWithoutOwnerInputSchema),z.lazy(() => ListingUncheckedCreateWithoutOwnerInputSchema) ]),
}).strict();

export const ListingUpdateWithWhereUniqueWithoutOwnerInputSchema: z.ZodType<Prisma.ListingUpdateWithWhereUniqueWithoutOwnerInput> = z.object({
  where: z.lazy(() => ListingWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ListingUpdateWithoutOwnerInputSchema),z.lazy(() => ListingUncheckedUpdateWithoutOwnerInputSchema) ]),
}).strict();

export const ListingUpdateManyWithWhereWithoutOwnerInputSchema: z.ZodType<Prisma.ListingUpdateManyWithWhereWithoutOwnerInput> = z.object({
  where: z.lazy(() => ListingScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ListingUpdateManyMutationInputSchema),z.lazy(() => ListingUncheckedUpdateManyWithoutOwnerInputSchema) ]),
}).strict();

export const ListingScalarWhereInputSchema: z.ZodType<Prisma.ListingScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ListingScalarWhereInputSchema),z.lazy(() => ListingScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ListingScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ListingScalarWhereInputSchema),z.lazy(() => ListingScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  title: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  slug: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  propertyType: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  address: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  latitude: z.union([ z.lazy(() => FloatNullableFilterSchema),z.number() ]).optional().nullable(),
  longitude: z.union([ z.lazy(() => FloatNullableFilterSchema),z.number() ]).optional().nullable(),
  timeZone: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  checkInTime: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  checkOutTime: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  amenities: z.lazy(() => StringNullableListFilterSchema).optional(),
  pricePerNight: z.union([ z.lazy(() => FloatFilterSchema),z.number() ]).optional(),
  currency: z.union([ z.lazy(() => EnumCurrencyFilterSchema),z.lazy(() => CurrencySchema) ]).optional(),
  minimumStay: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  maximumGuests: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  houseRules: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  allowPets: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  petPolicy: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  published: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  showExactLocation: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  locationRadius: z.union([ z.lazy(() => FloatFilterSchema),z.number() ]).optional(),
  ownerId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict();

export const UserRoleUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.UserRoleUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => UserRoleWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => UserRoleUpdateWithoutUserInputSchema),z.lazy(() => UserRoleUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => UserRoleCreateWithoutUserInputSchema),z.lazy(() => UserRoleUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const UserRoleUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.UserRoleUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => UserRoleWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => UserRoleUpdateWithoutUserInputSchema),z.lazy(() => UserRoleUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const UserRoleUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.UserRoleUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => UserRoleScalarWhereInputSchema),
  data: z.union([ z.lazy(() => UserRoleUpdateManyMutationInputSchema),z.lazy(() => UserRoleUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const UserRoleScalarWhereInputSchema: z.ZodType<Prisma.UserRoleScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserRoleScalarWhereInputSchema),z.lazy(() => UserRoleScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserRoleScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserRoleScalarWhereInputSchema),z.lazy(() => UserRoleScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  role: z.union([ z.lazy(() => EnumRoleFilterSchema),z.lazy(() => RoleSchema) ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict();

export const UserPermissionUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.UserPermissionUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => UserPermissionWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => UserPermissionUpdateWithoutUserInputSchema),z.lazy(() => UserPermissionUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => UserPermissionCreateWithoutUserInputSchema),z.lazy(() => UserPermissionUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const UserPermissionUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.UserPermissionUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => UserPermissionWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => UserPermissionUpdateWithoutUserInputSchema),z.lazy(() => UserPermissionUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const UserPermissionUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.UserPermissionUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => UserPermissionScalarWhereInputSchema),
  data: z.union([ z.lazy(() => UserPermissionUpdateManyMutationInputSchema),z.lazy(() => UserPermissionUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const UserPermissionScalarWhereInputSchema: z.ZodType<Prisma.UserPermissionScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserPermissionScalarWhereInputSchema),z.lazy(() => UserPermissionScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserPermissionScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserPermissionScalarWhereInputSchema),z.lazy(() => UserPermissionScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  permission: z.union([ z.lazy(() => EnumPermissionFilterSchema),z.lazy(() => PermissionSchema) ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict();

export const BookingUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.BookingUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => BookingWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => BookingUpdateWithoutUserInputSchema),z.lazy(() => BookingUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => BookingCreateWithoutUserInputSchema),z.lazy(() => BookingUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const BookingUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.BookingUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => BookingWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => BookingUpdateWithoutUserInputSchema),z.lazy(() => BookingUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const BookingUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.BookingUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => BookingScalarWhereInputSchema),
  data: z.union([ z.lazy(() => BookingUpdateManyMutationInputSchema),z.lazy(() => BookingUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const BookingScalarWhereInputSchema: z.ZodType<Prisma.BookingScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => BookingScalarWhereInputSchema),z.lazy(() => BookingScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => BookingScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BookingScalarWhereInputSchema),z.lazy(() => BookingScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  checkIn: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  checkOut: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  totalPrice: z.union([ z.lazy(() => FloatFilterSchema),z.number() ]).optional(),
  status: z.union([ z.lazy(() => EnumBookingStatusFilterSchema),z.lazy(() => BookingStatusSchema) ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  bookingRequestId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export const BookingRequestUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.BookingRequestUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => BookingRequestWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => BookingRequestUpdateWithoutUserInputSchema),z.lazy(() => BookingRequestUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => BookingRequestCreateWithoutUserInputSchema),z.lazy(() => BookingRequestUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const BookingRequestUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.BookingRequestUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => BookingRequestWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => BookingRequestUpdateWithoutUserInputSchema),z.lazy(() => BookingRequestUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const BookingRequestUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.BookingRequestUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => BookingRequestScalarWhereInputSchema),
  data: z.union([ z.lazy(() => BookingRequestUpdateManyMutationInputSchema),z.lazy(() => BookingRequestUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const BookingRequestScalarWhereInputSchema: z.ZodType<Prisma.BookingRequestScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => BookingRequestScalarWhereInputSchema),z.lazy(() => BookingRequestScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => BookingRequestScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BookingRequestScalarWhereInputSchema),z.lazy(() => BookingRequestScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  message: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  checkIn: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  checkOut: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  guests: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  pets: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  totalPrice: z.union([ z.lazy(() => FloatFilterSchema),z.number() ]).optional(),
  status: z.union([ z.lazy(() => EnumBookingRequestStatusFilterSchema),z.lazy(() => BookingRequestStatusSchema) ]).optional(),
  alterationOf: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  listingId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict();

export const SessionUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.SessionUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => SessionWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => SessionUpdateWithoutUserInputSchema),z.lazy(() => SessionUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => SessionCreateWithoutUserInputSchema),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const SessionUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.SessionUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => SessionWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => SessionUpdateWithoutUserInputSchema),z.lazy(() => SessionUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const SessionUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.SessionUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => SessionScalarWhereInputSchema),
  data: z.union([ z.lazy(() => SessionUpdateManyMutationInputSchema),z.lazy(() => SessionUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const SessionScalarWhereInputSchema: z.ZodType<Prisma.SessionScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => SessionScalarWhereInputSchema),z.lazy(() => SessionScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => SessionScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SessionScalarWhereInputSchema),z.lazy(() => SessionScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  expiresAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  lastActive: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const PasswordResetUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.PasswordResetUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => PasswordResetWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => PasswordResetUpdateWithoutUserInputSchema),z.lazy(() => PasswordResetUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => PasswordResetCreateWithoutUserInputSchema),z.lazy(() => PasswordResetUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const PasswordResetUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.PasswordResetUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => PasswordResetWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => PasswordResetUpdateWithoutUserInputSchema),z.lazy(() => PasswordResetUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const PasswordResetUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.PasswordResetUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => PasswordResetScalarWhereInputSchema),
  data: z.union([ z.lazy(() => PasswordResetUpdateManyMutationInputSchema),z.lazy(() => PasswordResetUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const PasswordResetScalarWhereInputSchema: z.ZodType<Prisma.PasswordResetScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => PasswordResetScalarWhereInputSchema),z.lazy(() => PasswordResetScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => PasswordResetScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PasswordResetScalarWhereInputSchema),z.lazy(() => PasswordResetScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  token: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  expiresAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  used: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
}).strict();

export const UserCreateWithoutEmailAddressesInputSchema: z.ZodType<Prisma.UserCreateWithoutEmailAddressesInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  firstName: z.string({required_error: "First name is required" }).optional().nullable(),
  lastName: z.string({required_error: "Last name is required" }).optional().nullable(),
  imageUrl: z.string({required_error: "Image URL must be valid" }).optional().nullable(),
  password: z.string({required_error: "Password must be at least 8 characters" }).optional().nullable(),
  externalAccounts: z.lazy(() => ExternalAccountCreateNestedManyWithoutUserInputSchema).optional(),
  listings: z.lazy(() => ListingCreateNestedManyWithoutOwnerInputSchema).optional(),
  roles: z.lazy(() => UserRoleCreateNestedManyWithoutUserInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionCreateNestedManyWithoutUserInputSchema).optional(),
  bookings: z.lazy(() => BookingCreateNestedManyWithoutUserInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestCreateNestedManyWithoutUserInputSchema).optional(),
  sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputSchema).optional(),
  passwordReset: z.lazy(() => PasswordResetCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutEmailAddressesInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutEmailAddressesInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  firstName: z.string({required_error: "First name is required" }).optional().nullable(),
  lastName: z.string({required_error: "Last name is required" }).optional().nullable(),
  imageUrl: z.string({required_error: "Image URL must be valid" }).optional().nullable(),
  password: z.string({required_error: "Password must be at least 8 characters" }).optional().nullable(),
  externalAccounts: z.lazy(() => ExternalAccountUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  listings: z.lazy(() => ListingUncheckedCreateNestedManyWithoutOwnerInputSchema).optional(),
  roles: z.lazy(() => UserRoleUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  bookings: z.lazy(() => BookingUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  passwordReset: z.lazy(() => PasswordResetUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutEmailAddressesInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutEmailAddressesInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutEmailAddressesInputSchema),z.lazy(() => UserUncheckedCreateWithoutEmailAddressesInputSchema) ]),
}).strict();

export const UserUpsertWithoutEmailAddressesInputSchema: z.ZodType<Prisma.UserUpsertWithoutEmailAddressesInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutEmailAddressesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutEmailAddressesInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutEmailAddressesInputSchema),z.lazy(() => UserUncheckedCreateWithoutEmailAddressesInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutEmailAddressesInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutEmailAddressesInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutEmailAddressesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutEmailAddressesInputSchema) ]),
}).strict();

export const UserUpdateWithoutEmailAddressesInputSchema: z.ZodType<Prisma.UserUpdateWithoutEmailAddressesInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string({required_error: "First name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string({required_error: "Last name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string({required_error: "Image URL must be valid" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string({required_error: "Password must be at least 8 characters" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  externalAccounts: z.lazy(() => ExternalAccountUpdateManyWithoutUserNestedInputSchema).optional(),
  listings: z.lazy(() => ListingUpdateManyWithoutOwnerNestedInputSchema).optional(),
  roles: z.lazy(() => UserRoleUpdateManyWithoutUserNestedInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionUpdateManyWithoutUserNestedInputSchema).optional(),
  bookings: z.lazy(() => BookingUpdateManyWithoutUserNestedInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestUpdateManyWithoutUserNestedInputSchema).optional(),
  sessions: z.lazy(() => SessionUpdateManyWithoutUserNestedInputSchema).optional(),
  passwordReset: z.lazy(() => PasswordResetUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutEmailAddressesInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutEmailAddressesInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string({required_error: "First name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string({required_error: "Last name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string({required_error: "Image URL must be valid" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string({required_error: "Password must be at least 8 characters" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  externalAccounts: z.lazy(() => ExternalAccountUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  listings: z.lazy(() => ListingUncheckedUpdateManyWithoutOwnerNestedInputSchema).optional(),
  roles: z.lazy(() => UserRoleUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  bookings: z.lazy(() => BookingUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  passwordReset: z.lazy(() => PasswordResetUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserCreateWithoutExternalAccountsInputSchema: z.ZodType<Prisma.UserCreateWithoutExternalAccountsInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  firstName: z.string({required_error: "First name is required" }).optional().nullable(),
  lastName: z.string({required_error: "Last name is required" }).optional().nullable(),
  imageUrl: z.string({required_error: "Image URL must be valid" }).optional().nullable(),
  password: z.string({required_error: "Password must be at least 8 characters" }).optional().nullable(),
  emailAddresses: z.lazy(() => EmailAddressCreateNestedManyWithoutUserInputSchema).optional(),
  listings: z.lazy(() => ListingCreateNestedManyWithoutOwnerInputSchema).optional(),
  roles: z.lazy(() => UserRoleCreateNestedManyWithoutUserInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionCreateNestedManyWithoutUserInputSchema).optional(),
  bookings: z.lazy(() => BookingCreateNestedManyWithoutUserInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestCreateNestedManyWithoutUserInputSchema).optional(),
  sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputSchema).optional(),
  passwordReset: z.lazy(() => PasswordResetCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutExternalAccountsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutExternalAccountsInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  firstName: z.string({required_error: "First name is required" }).optional().nullable(),
  lastName: z.string({required_error: "Last name is required" }).optional().nullable(),
  imageUrl: z.string({required_error: "Image URL must be valid" }).optional().nullable(),
  password: z.string({required_error: "Password must be at least 8 characters" }).optional().nullable(),
  emailAddresses: z.lazy(() => EmailAddressUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  listings: z.lazy(() => ListingUncheckedCreateNestedManyWithoutOwnerInputSchema).optional(),
  roles: z.lazy(() => UserRoleUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  bookings: z.lazy(() => BookingUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  passwordReset: z.lazy(() => PasswordResetUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutExternalAccountsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutExternalAccountsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutExternalAccountsInputSchema),z.lazy(() => UserUncheckedCreateWithoutExternalAccountsInputSchema) ]),
}).strict();

export const UserUpsertWithoutExternalAccountsInputSchema: z.ZodType<Prisma.UserUpsertWithoutExternalAccountsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutExternalAccountsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutExternalAccountsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutExternalAccountsInputSchema),z.lazy(() => UserUncheckedCreateWithoutExternalAccountsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutExternalAccountsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutExternalAccountsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutExternalAccountsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutExternalAccountsInputSchema) ]),
}).strict();

export const UserUpdateWithoutExternalAccountsInputSchema: z.ZodType<Prisma.UserUpdateWithoutExternalAccountsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string({required_error: "First name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string({required_error: "Last name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string({required_error: "Image URL must be valid" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string({required_error: "Password must be at least 8 characters" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailAddresses: z.lazy(() => EmailAddressUpdateManyWithoutUserNestedInputSchema).optional(),
  listings: z.lazy(() => ListingUpdateManyWithoutOwnerNestedInputSchema).optional(),
  roles: z.lazy(() => UserRoleUpdateManyWithoutUserNestedInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionUpdateManyWithoutUserNestedInputSchema).optional(),
  bookings: z.lazy(() => BookingUpdateManyWithoutUserNestedInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestUpdateManyWithoutUserNestedInputSchema).optional(),
  sessions: z.lazy(() => SessionUpdateManyWithoutUserNestedInputSchema).optional(),
  passwordReset: z.lazy(() => PasswordResetUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutExternalAccountsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutExternalAccountsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string({required_error: "First name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string({required_error: "Last name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string({required_error: "Image URL must be valid" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string({required_error: "Password must be at least 8 characters" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailAddresses: z.lazy(() => EmailAddressUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  listings: z.lazy(() => ListingUncheckedUpdateManyWithoutOwnerNestedInputSchema).optional(),
  roles: z.lazy(() => UserRoleUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  bookings: z.lazy(() => BookingUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  passwordReset: z.lazy(() => PasswordResetUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const ListingCreateWithoutImagesInputSchema: z.ZodType<Prisma.ListingCreateWithoutImagesInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  title: z.string({required_error: "Title is required" }),
  slug: z.string({required_error: "Slug is required" }).optional(),
  description: z.string({required_error: "Description is required" }),
  propertyType: z.string({required_error: "Property type is required" }),
  address: z.string({required_error: "Address is required" }),
  latitude: z.number({ invalid_type_error: "Latitude must be a number" }).gt(-90, { message: "Latitude must be greater than -90" }).lt(90, { message: "Latitude must be less than 90" }).optional().nullable(),
  longitude: z.number({ invalid_type_error: "Longitude must be a number" }).gt(-180, { message: "Longitude must be greater than -180" }).lt(180, { message: "Longitude must be less than 180" }).optional().nullable(),
  timeZone: z.string({ invalid_type_error: "Time zone is required" }).optional(),
  checkInTime: z.string({ invalid_type_error: "Check-in time is required" }).optional(),
  checkOutTime: z.string({ invalid_type_error: "Check-out time is required" }).optional(),
  amenities: z.union([ z.lazy(() => ListingCreateamenitiesInputSchema),z.string().array() ]).optional(),
  pricePerNight: z.number().gt(0, { message: "Price per night must be greater than 0" }),
  currency: z.lazy(() => CurrencySchema).optional(),
  minimumStay: z.number().gt(0, { message: "Minimum stay must be greater than 0" }).optional(),
  maximumGuests: z.number().gt(0, { message: "Maximum guests must be greater than 0" }).optional(),
  houseRules: z.string({ invalid_type_error: "House rules are required" }),
  allowPets: z.boolean().optional(),
  petPolicy: z.string({ invalid_type_error: "Pet policy is required" }).optional(),
  published: z.boolean().optional(),
  showExactLocation: z.boolean().optional(),
  locationRadius: z.number().optional(),
  owner: z.lazy(() => UserCreateNestedOneWithoutListingsInputSchema),
  inventory: z.lazy(() => ListingInventoryCreateNestedManyWithoutListingInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestCreateNestedManyWithoutListingInputSchema).optional()
}).strict();

export const ListingUncheckedCreateWithoutImagesInputSchema: z.ZodType<Prisma.ListingUncheckedCreateWithoutImagesInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  title: z.string({required_error: "Title is required" }),
  slug: z.string({required_error: "Slug is required" }).optional(),
  description: z.string({required_error: "Description is required" }),
  propertyType: z.string({required_error: "Property type is required" }),
  address: z.string({required_error: "Address is required" }),
  latitude: z.number({ invalid_type_error: "Latitude must be a number" }).gt(-90, { message: "Latitude must be greater than -90" }).lt(90, { message: "Latitude must be less than 90" }).optional().nullable(),
  longitude: z.number({ invalid_type_error: "Longitude must be a number" }).gt(-180, { message: "Longitude must be greater than -180" }).lt(180, { message: "Longitude must be less than 180" }).optional().nullable(),
  timeZone: z.string({ invalid_type_error: "Time zone is required" }).optional(),
  checkInTime: z.string({ invalid_type_error: "Check-in time is required" }).optional(),
  checkOutTime: z.string({ invalid_type_error: "Check-out time is required" }).optional(),
  amenities: z.union([ z.lazy(() => ListingCreateamenitiesInputSchema),z.string().array() ]).optional(),
  pricePerNight: z.number().gt(0, { message: "Price per night must be greater than 0" }),
  currency: z.lazy(() => CurrencySchema).optional(),
  minimumStay: z.number().gt(0, { message: "Minimum stay must be greater than 0" }).optional(),
  maximumGuests: z.number().gt(0, { message: "Maximum guests must be greater than 0" }).optional(),
  houseRules: z.string({ invalid_type_error: "House rules are required" }),
  allowPets: z.boolean().optional(),
  petPolicy: z.string({ invalid_type_error: "Pet policy is required" }).optional(),
  published: z.boolean().optional(),
  showExactLocation: z.boolean().optional(),
  locationRadius: z.number().optional(),
  ownerId: z.string(),
  inventory: z.lazy(() => ListingInventoryUncheckedCreateNestedManyWithoutListingInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestUncheckedCreateNestedManyWithoutListingInputSchema).optional()
}).strict();

export const ListingCreateOrConnectWithoutImagesInputSchema: z.ZodType<Prisma.ListingCreateOrConnectWithoutImagesInput> = z.object({
  where: z.lazy(() => ListingWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ListingCreateWithoutImagesInputSchema),z.lazy(() => ListingUncheckedCreateWithoutImagesInputSchema) ]),
}).strict();

export const ListingUpsertWithoutImagesInputSchema: z.ZodType<Prisma.ListingUpsertWithoutImagesInput> = z.object({
  update: z.union([ z.lazy(() => ListingUpdateWithoutImagesInputSchema),z.lazy(() => ListingUncheckedUpdateWithoutImagesInputSchema) ]),
  create: z.union([ z.lazy(() => ListingCreateWithoutImagesInputSchema),z.lazy(() => ListingUncheckedCreateWithoutImagesInputSchema) ]),
  where: z.lazy(() => ListingWhereInputSchema).optional()
}).strict();

export const ListingUpdateToOneWithWhereWithoutImagesInputSchema: z.ZodType<Prisma.ListingUpdateToOneWithWhereWithoutImagesInput> = z.object({
  where: z.lazy(() => ListingWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ListingUpdateWithoutImagesInputSchema),z.lazy(() => ListingUncheckedUpdateWithoutImagesInputSchema) ]),
}).strict();

export const ListingUpdateWithoutImagesInputSchema: z.ZodType<Prisma.ListingUpdateWithoutImagesInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string({required_error: "Title is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string({required_error: "Slug is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string({required_error: "Description is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  propertyType: z.union([ z.string({required_error: "Property type is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string({required_error: "Address is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latitude: z.union([ z.number({ invalid_type_error: "Latitude must be a number" }).gt(-90, { message: "Latitude must be greater than -90" }).lt(90, { message: "Latitude must be less than 90" }),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  longitude: z.union([ z.number({ invalid_type_error: "Longitude must be a number" }).gt(-180, { message: "Longitude must be greater than -180" }).lt(180, { message: "Longitude must be less than 180" }),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  timeZone: z.union([ z.string({ invalid_type_error: "Time zone is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkInTime: z.union([ z.string({ invalid_type_error: "Check-in time is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkOutTime: z.union([ z.string({ invalid_type_error: "Check-out time is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  amenities: z.union([ z.lazy(() => ListingUpdateamenitiesInputSchema),z.string().array() ]).optional(),
  pricePerNight: z.union([ z.number().gt(0, { message: "Price per night must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  currency: z.union([ z.lazy(() => CurrencySchema),z.lazy(() => EnumCurrencyFieldUpdateOperationsInputSchema) ]).optional(),
  minimumStay: z.union([ z.number().gt(0, { message: "Minimum stay must be greater than 0" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  maximumGuests: z.union([ z.number().gt(0, { message: "Maximum guests must be greater than 0" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  houseRules: z.union([ z.string({ invalid_type_error: "House rules are required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  allowPets: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  petPolicy: z.union([ z.string({ invalid_type_error: "Pet policy is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  published: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  showExactLocation: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  locationRadius: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  owner: z.lazy(() => UserUpdateOneRequiredWithoutListingsNestedInputSchema).optional(),
  inventory: z.lazy(() => ListingInventoryUpdateManyWithoutListingNestedInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestUpdateManyWithoutListingNestedInputSchema).optional()
}).strict();

export const ListingUncheckedUpdateWithoutImagesInputSchema: z.ZodType<Prisma.ListingUncheckedUpdateWithoutImagesInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string({required_error: "Title is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string({required_error: "Slug is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string({required_error: "Description is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  propertyType: z.union([ z.string({required_error: "Property type is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string({required_error: "Address is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latitude: z.union([ z.number({ invalid_type_error: "Latitude must be a number" }).gt(-90, { message: "Latitude must be greater than -90" }).lt(90, { message: "Latitude must be less than 90" }),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  longitude: z.union([ z.number({ invalid_type_error: "Longitude must be a number" }).gt(-180, { message: "Longitude must be greater than -180" }).lt(180, { message: "Longitude must be less than 180" }),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  timeZone: z.union([ z.string({ invalid_type_error: "Time zone is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkInTime: z.union([ z.string({ invalid_type_error: "Check-in time is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkOutTime: z.union([ z.string({ invalid_type_error: "Check-out time is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  amenities: z.union([ z.lazy(() => ListingUpdateamenitiesInputSchema),z.string().array() ]).optional(),
  pricePerNight: z.union([ z.number().gt(0, { message: "Price per night must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  currency: z.union([ z.lazy(() => CurrencySchema),z.lazy(() => EnumCurrencyFieldUpdateOperationsInputSchema) ]).optional(),
  minimumStay: z.union([ z.number().gt(0, { message: "Minimum stay must be greater than 0" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  maximumGuests: z.union([ z.number().gt(0, { message: "Maximum guests must be greater than 0" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  houseRules: z.union([ z.string({ invalid_type_error: "House rules are required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  allowPets: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  petPolicy: z.union([ z.string({ invalid_type_error: "Pet policy is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  published: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  showExactLocation: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  locationRadius: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  ownerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  inventory: z.lazy(() => ListingInventoryUncheckedUpdateManyWithoutListingNestedInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestUncheckedUpdateManyWithoutListingNestedInputSchema).optional()
}).strict();

export const UserCreateWithoutListingsInputSchema: z.ZodType<Prisma.UserCreateWithoutListingsInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  firstName: z.string({required_error: "First name is required" }).optional().nullable(),
  lastName: z.string({required_error: "Last name is required" }).optional().nullable(),
  imageUrl: z.string({required_error: "Image URL must be valid" }).optional().nullable(),
  password: z.string({required_error: "Password must be at least 8 characters" }).optional().nullable(),
  emailAddresses: z.lazy(() => EmailAddressCreateNestedManyWithoutUserInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountCreateNestedManyWithoutUserInputSchema).optional(),
  roles: z.lazy(() => UserRoleCreateNestedManyWithoutUserInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionCreateNestedManyWithoutUserInputSchema).optional(),
  bookings: z.lazy(() => BookingCreateNestedManyWithoutUserInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestCreateNestedManyWithoutUserInputSchema).optional(),
  sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputSchema).optional(),
  passwordReset: z.lazy(() => PasswordResetCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutListingsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutListingsInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  firstName: z.string({required_error: "First name is required" }).optional().nullable(),
  lastName: z.string({required_error: "Last name is required" }).optional().nullable(),
  imageUrl: z.string({required_error: "Image URL must be valid" }).optional().nullable(),
  password: z.string({required_error: "Password must be at least 8 characters" }).optional().nullable(),
  emailAddresses: z.lazy(() => EmailAddressUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  roles: z.lazy(() => UserRoleUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  bookings: z.lazy(() => BookingUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  passwordReset: z.lazy(() => PasswordResetUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutListingsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutListingsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutListingsInputSchema),z.lazy(() => UserUncheckedCreateWithoutListingsInputSchema) ]),
}).strict();

export const UploadedPhotoCreateWithoutListingInputSchema: z.ZodType<Prisma.UploadedPhotoCreateWithoutListingInput> = z.object({
  id: z.string().cuid().optional(),
  url: z.string({required_error: "URL is required" }),
  key: z.string(),
  name: z.string()
}).strict();

export const UploadedPhotoUncheckedCreateWithoutListingInputSchema: z.ZodType<Prisma.UploadedPhotoUncheckedCreateWithoutListingInput> = z.object({
  id: z.string().cuid().optional(),
  url: z.string({required_error: "URL is required" }),
  key: z.string(),
  name: z.string()
}).strict();

export const UploadedPhotoCreateOrConnectWithoutListingInputSchema: z.ZodType<Prisma.UploadedPhotoCreateOrConnectWithoutListingInput> = z.object({
  where: z.lazy(() => UploadedPhotoWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UploadedPhotoCreateWithoutListingInputSchema),z.lazy(() => UploadedPhotoUncheckedCreateWithoutListingInputSchema) ]),
}).strict();

export const UploadedPhotoCreateManyListingInputEnvelopeSchema: z.ZodType<Prisma.UploadedPhotoCreateManyListingInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => UploadedPhotoCreateManyListingInputSchema),z.lazy(() => UploadedPhotoCreateManyListingInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const ListingInventoryCreateWithoutListingInputSchema: z.ZodType<Prisma.ListingInventoryCreateWithoutListingInput> = z.object({
  date: z.coerce.date({ invalid_type_error: "Date is required" }),
  isAvailable: z.boolean().optional(),
  price: z.number().gt(0, { message: "Price must be greater than 0" }),
  booking: z.lazy(() => BookingCreateNestedOneWithoutListingInventoryInputSchema).optional()
}).strict();

export const ListingInventoryUncheckedCreateWithoutListingInputSchema: z.ZodType<Prisma.ListingInventoryUncheckedCreateWithoutListingInput> = z.object({
  id: z.number().int().optional(),
  date: z.coerce.date({ invalid_type_error: "Date is required" }),
  isAvailable: z.boolean().optional(),
  price: z.number().gt(0, { message: "Price must be greater than 0" }),
  bookingId: z.string().optional().nullable()
}).strict();

export const ListingInventoryCreateOrConnectWithoutListingInputSchema: z.ZodType<Prisma.ListingInventoryCreateOrConnectWithoutListingInput> = z.object({
  where: z.lazy(() => ListingInventoryWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ListingInventoryCreateWithoutListingInputSchema),z.lazy(() => ListingInventoryUncheckedCreateWithoutListingInputSchema) ]),
}).strict();

export const ListingInventoryCreateManyListingInputEnvelopeSchema: z.ZodType<Prisma.ListingInventoryCreateManyListingInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ListingInventoryCreateManyListingInputSchema),z.lazy(() => ListingInventoryCreateManyListingInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const BookingRequestCreateWithoutListingInputSchema: z.ZodType<Prisma.BookingRequestCreateWithoutListingInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  message: z.string({ invalid_type_error: "Message is required" }),
  checkIn: z.coerce.date({ invalid_type_error: "Check-in date is required" }),
  checkOut: z.coerce.date({ invalid_type_error: "Check-out date is required" }),
  guests: z.number().int().min(1, { message: "At least 1 guest is required" }),
  pets: z.boolean().optional(),
  totalPrice: z.number().positive({ message: "Total price must be greater than 0" }).optional(),
  status: z.lazy(() => BookingRequestStatusSchema).optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutBookingRequestInputSchema),
  Booking: z.lazy(() => BookingCreateNestedManyWithoutBookingRequestInputSchema).optional(),
  originalRequest: z.lazy(() => BookingRequestCreateNestedOneWithoutAlterationsInputSchema).optional(),
  alterations: z.lazy(() => BookingRequestCreateNestedManyWithoutOriginalRequestInputSchema).optional()
}).strict();

export const BookingRequestUncheckedCreateWithoutListingInputSchema: z.ZodType<Prisma.BookingRequestUncheckedCreateWithoutListingInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  message: z.string({ invalid_type_error: "Message is required" }),
  checkIn: z.coerce.date({ invalid_type_error: "Check-in date is required" }),
  checkOut: z.coerce.date({ invalid_type_error: "Check-out date is required" }),
  guests: z.number().int().min(1, { message: "At least 1 guest is required" }),
  pets: z.boolean().optional(),
  totalPrice: z.number().positive({ message: "Total price must be greater than 0" }).optional(),
  status: z.lazy(() => BookingRequestStatusSchema).optional(),
  alterationOf: z.string().optional().nullable(),
  userId: z.string(),
  Booking: z.lazy(() => BookingUncheckedCreateNestedManyWithoutBookingRequestInputSchema).optional(),
  alterations: z.lazy(() => BookingRequestUncheckedCreateNestedManyWithoutOriginalRequestInputSchema).optional()
}).strict();

export const BookingRequestCreateOrConnectWithoutListingInputSchema: z.ZodType<Prisma.BookingRequestCreateOrConnectWithoutListingInput> = z.object({
  where: z.lazy(() => BookingRequestWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => BookingRequestCreateWithoutListingInputSchema),z.lazy(() => BookingRequestUncheckedCreateWithoutListingInputSchema) ]),
}).strict();

export const BookingRequestCreateManyListingInputEnvelopeSchema: z.ZodType<Prisma.BookingRequestCreateManyListingInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => BookingRequestCreateManyListingInputSchema),z.lazy(() => BookingRequestCreateManyListingInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const UserUpsertWithoutListingsInputSchema: z.ZodType<Prisma.UserUpsertWithoutListingsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutListingsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutListingsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutListingsInputSchema),z.lazy(() => UserUncheckedCreateWithoutListingsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutListingsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutListingsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutListingsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutListingsInputSchema) ]),
}).strict();

export const UserUpdateWithoutListingsInputSchema: z.ZodType<Prisma.UserUpdateWithoutListingsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string({required_error: "First name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string({required_error: "Last name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string({required_error: "Image URL must be valid" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string({required_error: "Password must be at least 8 characters" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailAddresses: z.lazy(() => EmailAddressUpdateManyWithoutUserNestedInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountUpdateManyWithoutUserNestedInputSchema).optional(),
  roles: z.lazy(() => UserRoleUpdateManyWithoutUserNestedInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionUpdateManyWithoutUserNestedInputSchema).optional(),
  bookings: z.lazy(() => BookingUpdateManyWithoutUserNestedInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestUpdateManyWithoutUserNestedInputSchema).optional(),
  sessions: z.lazy(() => SessionUpdateManyWithoutUserNestedInputSchema).optional(),
  passwordReset: z.lazy(() => PasswordResetUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutListingsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutListingsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string({required_error: "First name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string({required_error: "Last name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string({required_error: "Image URL must be valid" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string({required_error: "Password must be at least 8 characters" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailAddresses: z.lazy(() => EmailAddressUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  roles: z.lazy(() => UserRoleUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  bookings: z.lazy(() => BookingUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  passwordReset: z.lazy(() => PasswordResetUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UploadedPhotoUpsertWithWhereUniqueWithoutListingInputSchema: z.ZodType<Prisma.UploadedPhotoUpsertWithWhereUniqueWithoutListingInput> = z.object({
  where: z.lazy(() => UploadedPhotoWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => UploadedPhotoUpdateWithoutListingInputSchema),z.lazy(() => UploadedPhotoUncheckedUpdateWithoutListingInputSchema) ]),
  create: z.union([ z.lazy(() => UploadedPhotoCreateWithoutListingInputSchema),z.lazy(() => UploadedPhotoUncheckedCreateWithoutListingInputSchema) ]),
}).strict();

export const UploadedPhotoUpdateWithWhereUniqueWithoutListingInputSchema: z.ZodType<Prisma.UploadedPhotoUpdateWithWhereUniqueWithoutListingInput> = z.object({
  where: z.lazy(() => UploadedPhotoWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => UploadedPhotoUpdateWithoutListingInputSchema),z.lazy(() => UploadedPhotoUncheckedUpdateWithoutListingInputSchema) ]),
}).strict();

export const UploadedPhotoUpdateManyWithWhereWithoutListingInputSchema: z.ZodType<Prisma.UploadedPhotoUpdateManyWithWhereWithoutListingInput> = z.object({
  where: z.lazy(() => UploadedPhotoScalarWhereInputSchema),
  data: z.union([ z.lazy(() => UploadedPhotoUpdateManyMutationInputSchema),z.lazy(() => UploadedPhotoUncheckedUpdateManyWithoutListingInputSchema) ]),
}).strict();

export const UploadedPhotoScalarWhereInputSchema: z.ZodType<Prisma.UploadedPhotoScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UploadedPhotoScalarWhereInputSchema),z.lazy(() => UploadedPhotoScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UploadedPhotoScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UploadedPhotoScalarWhereInputSchema),z.lazy(() => UploadedPhotoScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  url: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  key: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  listingId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export const ListingInventoryUpsertWithWhereUniqueWithoutListingInputSchema: z.ZodType<Prisma.ListingInventoryUpsertWithWhereUniqueWithoutListingInput> = z.object({
  where: z.lazy(() => ListingInventoryWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ListingInventoryUpdateWithoutListingInputSchema),z.lazy(() => ListingInventoryUncheckedUpdateWithoutListingInputSchema) ]),
  create: z.union([ z.lazy(() => ListingInventoryCreateWithoutListingInputSchema),z.lazy(() => ListingInventoryUncheckedCreateWithoutListingInputSchema) ]),
}).strict();

export const ListingInventoryUpdateWithWhereUniqueWithoutListingInputSchema: z.ZodType<Prisma.ListingInventoryUpdateWithWhereUniqueWithoutListingInput> = z.object({
  where: z.lazy(() => ListingInventoryWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ListingInventoryUpdateWithoutListingInputSchema),z.lazy(() => ListingInventoryUncheckedUpdateWithoutListingInputSchema) ]),
}).strict();

export const ListingInventoryUpdateManyWithWhereWithoutListingInputSchema: z.ZodType<Prisma.ListingInventoryUpdateManyWithWhereWithoutListingInput> = z.object({
  where: z.lazy(() => ListingInventoryScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ListingInventoryUpdateManyMutationInputSchema),z.lazy(() => ListingInventoryUncheckedUpdateManyWithoutListingInputSchema) ]),
}).strict();

export const ListingInventoryScalarWhereInputSchema: z.ZodType<Prisma.ListingInventoryScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ListingInventoryScalarWhereInputSchema),z.lazy(() => ListingInventoryScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ListingInventoryScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ListingInventoryScalarWhereInputSchema),z.lazy(() => ListingInventoryScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  date: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  isAvailable: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  price: z.union([ z.lazy(() => FloatFilterSchema),z.number() ]).optional(),
  listingId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  bookingId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export const BookingRequestUpsertWithWhereUniqueWithoutListingInputSchema: z.ZodType<Prisma.BookingRequestUpsertWithWhereUniqueWithoutListingInput> = z.object({
  where: z.lazy(() => BookingRequestWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => BookingRequestUpdateWithoutListingInputSchema),z.lazy(() => BookingRequestUncheckedUpdateWithoutListingInputSchema) ]),
  create: z.union([ z.lazy(() => BookingRequestCreateWithoutListingInputSchema),z.lazy(() => BookingRequestUncheckedCreateWithoutListingInputSchema) ]),
}).strict();

export const BookingRequestUpdateWithWhereUniqueWithoutListingInputSchema: z.ZodType<Prisma.BookingRequestUpdateWithWhereUniqueWithoutListingInput> = z.object({
  where: z.lazy(() => BookingRequestWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => BookingRequestUpdateWithoutListingInputSchema),z.lazy(() => BookingRequestUncheckedUpdateWithoutListingInputSchema) ]),
}).strict();

export const BookingRequestUpdateManyWithWhereWithoutListingInputSchema: z.ZodType<Prisma.BookingRequestUpdateManyWithWhereWithoutListingInput> = z.object({
  where: z.lazy(() => BookingRequestScalarWhereInputSchema),
  data: z.union([ z.lazy(() => BookingRequestUpdateManyMutationInputSchema),z.lazy(() => BookingRequestUncheckedUpdateManyWithoutListingInputSchema) ]),
}).strict();

export const ListingCreateWithoutInventoryInputSchema: z.ZodType<Prisma.ListingCreateWithoutInventoryInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  title: z.string({required_error: "Title is required" }),
  slug: z.string({required_error: "Slug is required" }).optional(),
  description: z.string({required_error: "Description is required" }),
  propertyType: z.string({required_error: "Property type is required" }),
  address: z.string({required_error: "Address is required" }),
  latitude: z.number({ invalid_type_error: "Latitude must be a number" }).gt(-90, { message: "Latitude must be greater than -90" }).lt(90, { message: "Latitude must be less than 90" }).optional().nullable(),
  longitude: z.number({ invalid_type_error: "Longitude must be a number" }).gt(-180, { message: "Longitude must be greater than -180" }).lt(180, { message: "Longitude must be less than 180" }).optional().nullable(),
  timeZone: z.string({ invalid_type_error: "Time zone is required" }).optional(),
  checkInTime: z.string({ invalid_type_error: "Check-in time is required" }).optional(),
  checkOutTime: z.string({ invalid_type_error: "Check-out time is required" }).optional(),
  amenities: z.union([ z.lazy(() => ListingCreateamenitiesInputSchema),z.string().array() ]).optional(),
  pricePerNight: z.number().gt(0, { message: "Price per night must be greater than 0" }),
  currency: z.lazy(() => CurrencySchema).optional(),
  minimumStay: z.number().gt(0, { message: "Minimum stay must be greater than 0" }).optional(),
  maximumGuests: z.number().gt(0, { message: "Maximum guests must be greater than 0" }).optional(),
  houseRules: z.string({ invalid_type_error: "House rules are required" }),
  allowPets: z.boolean().optional(),
  petPolicy: z.string({ invalid_type_error: "Pet policy is required" }).optional(),
  published: z.boolean().optional(),
  showExactLocation: z.boolean().optional(),
  locationRadius: z.number().optional(),
  owner: z.lazy(() => UserCreateNestedOneWithoutListingsInputSchema),
  images: z.lazy(() => UploadedPhotoCreateNestedManyWithoutListingInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestCreateNestedManyWithoutListingInputSchema).optional()
}).strict();

export const ListingUncheckedCreateWithoutInventoryInputSchema: z.ZodType<Prisma.ListingUncheckedCreateWithoutInventoryInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  title: z.string({required_error: "Title is required" }),
  slug: z.string({required_error: "Slug is required" }).optional(),
  description: z.string({required_error: "Description is required" }),
  propertyType: z.string({required_error: "Property type is required" }),
  address: z.string({required_error: "Address is required" }),
  latitude: z.number({ invalid_type_error: "Latitude must be a number" }).gt(-90, { message: "Latitude must be greater than -90" }).lt(90, { message: "Latitude must be less than 90" }).optional().nullable(),
  longitude: z.number({ invalid_type_error: "Longitude must be a number" }).gt(-180, { message: "Longitude must be greater than -180" }).lt(180, { message: "Longitude must be less than 180" }).optional().nullable(),
  timeZone: z.string({ invalid_type_error: "Time zone is required" }).optional(),
  checkInTime: z.string({ invalid_type_error: "Check-in time is required" }).optional(),
  checkOutTime: z.string({ invalid_type_error: "Check-out time is required" }).optional(),
  amenities: z.union([ z.lazy(() => ListingCreateamenitiesInputSchema),z.string().array() ]).optional(),
  pricePerNight: z.number().gt(0, { message: "Price per night must be greater than 0" }),
  currency: z.lazy(() => CurrencySchema).optional(),
  minimumStay: z.number().gt(0, { message: "Minimum stay must be greater than 0" }).optional(),
  maximumGuests: z.number().gt(0, { message: "Maximum guests must be greater than 0" }).optional(),
  houseRules: z.string({ invalid_type_error: "House rules are required" }),
  allowPets: z.boolean().optional(),
  petPolicy: z.string({ invalid_type_error: "Pet policy is required" }).optional(),
  published: z.boolean().optional(),
  showExactLocation: z.boolean().optional(),
  locationRadius: z.number().optional(),
  ownerId: z.string(),
  images: z.lazy(() => UploadedPhotoUncheckedCreateNestedManyWithoutListingInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestUncheckedCreateNestedManyWithoutListingInputSchema).optional()
}).strict();

export const ListingCreateOrConnectWithoutInventoryInputSchema: z.ZodType<Prisma.ListingCreateOrConnectWithoutInventoryInput> = z.object({
  where: z.lazy(() => ListingWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ListingCreateWithoutInventoryInputSchema),z.lazy(() => ListingUncheckedCreateWithoutInventoryInputSchema) ]),
}).strict();

export const BookingCreateWithoutListingInventoryInputSchema: z.ZodType<Prisma.BookingCreateWithoutListingInventoryInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  checkIn: z.coerce.date({ invalid_type_error: "Check-in date is required" }),
  checkOut: z.coerce.date({ invalid_type_error: "Check-out date is required" }),
  totalPrice: z.number().positive({ message: "Total price must be greater than 0" }),
  status: z.lazy(() => BookingStatusSchema).optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutBookingsInputSchema),
  bookingRequest: z.lazy(() => BookingRequestCreateNestedOneWithoutBookingInputSchema).optional()
}).strict();

export const BookingUncheckedCreateWithoutListingInventoryInputSchema: z.ZodType<Prisma.BookingUncheckedCreateWithoutListingInventoryInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  checkIn: z.coerce.date({ invalid_type_error: "Check-in date is required" }),
  checkOut: z.coerce.date({ invalid_type_error: "Check-out date is required" }),
  totalPrice: z.number().positive({ message: "Total price must be greater than 0" }),
  status: z.lazy(() => BookingStatusSchema).optional(),
  userId: z.string({ invalid_type_error: "User ID is required" }),
  bookingRequestId: z.string().optional().nullable()
}).strict();

export const BookingCreateOrConnectWithoutListingInventoryInputSchema: z.ZodType<Prisma.BookingCreateOrConnectWithoutListingInventoryInput> = z.object({
  where: z.lazy(() => BookingWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => BookingCreateWithoutListingInventoryInputSchema),z.lazy(() => BookingUncheckedCreateWithoutListingInventoryInputSchema) ]),
}).strict();

export const ListingUpsertWithoutInventoryInputSchema: z.ZodType<Prisma.ListingUpsertWithoutInventoryInput> = z.object({
  update: z.union([ z.lazy(() => ListingUpdateWithoutInventoryInputSchema),z.lazy(() => ListingUncheckedUpdateWithoutInventoryInputSchema) ]),
  create: z.union([ z.lazy(() => ListingCreateWithoutInventoryInputSchema),z.lazy(() => ListingUncheckedCreateWithoutInventoryInputSchema) ]),
  where: z.lazy(() => ListingWhereInputSchema).optional()
}).strict();

export const ListingUpdateToOneWithWhereWithoutInventoryInputSchema: z.ZodType<Prisma.ListingUpdateToOneWithWhereWithoutInventoryInput> = z.object({
  where: z.lazy(() => ListingWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ListingUpdateWithoutInventoryInputSchema),z.lazy(() => ListingUncheckedUpdateWithoutInventoryInputSchema) ]),
}).strict();

export const ListingUpdateWithoutInventoryInputSchema: z.ZodType<Prisma.ListingUpdateWithoutInventoryInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string({required_error: "Title is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string({required_error: "Slug is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string({required_error: "Description is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  propertyType: z.union([ z.string({required_error: "Property type is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string({required_error: "Address is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latitude: z.union([ z.number({ invalid_type_error: "Latitude must be a number" }).gt(-90, { message: "Latitude must be greater than -90" }).lt(90, { message: "Latitude must be less than 90" }),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  longitude: z.union([ z.number({ invalid_type_error: "Longitude must be a number" }).gt(-180, { message: "Longitude must be greater than -180" }).lt(180, { message: "Longitude must be less than 180" }),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  timeZone: z.union([ z.string({ invalid_type_error: "Time zone is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkInTime: z.union([ z.string({ invalid_type_error: "Check-in time is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkOutTime: z.union([ z.string({ invalid_type_error: "Check-out time is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  amenities: z.union([ z.lazy(() => ListingUpdateamenitiesInputSchema),z.string().array() ]).optional(),
  pricePerNight: z.union([ z.number().gt(0, { message: "Price per night must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  currency: z.union([ z.lazy(() => CurrencySchema),z.lazy(() => EnumCurrencyFieldUpdateOperationsInputSchema) ]).optional(),
  minimumStay: z.union([ z.number().gt(0, { message: "Minimum stay must be greater than 0" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  maximumGuests: z.union([ z.number().gt(0, { message: "Maximum guests must be greater than 0" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  houseRules: z.union([ z.string({ invalid_type_error: "House rules are required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  allowPets: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  petPolicy: z.union([ z.string({ invalid_type_error: "Pet policy is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  published: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  showExactLocation: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  locationRadius: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  owner: z.lazy(() => UserUpdateOneRequiredWithoutListingsNestedInputSchema).optional(),
  images: z.lazy(() => UploadedPhotoUpdateManyWithoutListingNestedInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestUpdateManyWithoutListingNestedInputSchema).optional()
}).strict();

export const ListingUncheckedUpdateWithoutInventoryInputSchema: z.ZodType<Prisma.ListingUncheckedUpdateWithoutInventoryInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string({required_error: "Title is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string({required_error: "Slug is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string({required_error: "Description is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  propertyType: z.union([ z.string({required_error: "Property type is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string({required_error: "Address is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latitude: z.union([ z.number({ invalid_type_error: "Latitude must be a number" }).gt(-90, { message: "Latitude must be greater than -90" }).lt(90, { message: "Latitude must be less than 90" }),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  longitude: z.union([ z.number({ invalid_type_error: "Longitude must be a number" }).gt(-180, { message: "Longitude must be greater than -180" }).lt(180, { message: "Longitude must be less than 180" }),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  timeZone: z.union([ z.string({ invalid_type_error: "Time zone is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkInTime: z.union([ z.string({ invalid_type_error: "Check-in time is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkOutTime: z.union([ z.string({ invalid_type_error: "Check-out time is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  amenities: z.union([ z.lazy(() => ListingUpdateamenitiesInputSchema),z.string().array() ]).optional(),
  pricePerNight: z.union([ z.number().gt(0, { message: "Price per night must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  currency: z.union([ z.lazy(() => CurrencySchema),z.lazy(() => EnumCurrencyFieldUpdateOperationsInputSchema) ]).optional(),
  minimumStay: z.union([ z.number().gt(0, { message: "Minimum stay must be greater than 0" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  maximumGuests: z.union([ z.number().gt(0, { message: "Maximum guests must be greater than 0" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  houseRules: z.union([ z.string({ invalid_type_error: "House rules are required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  allowPets: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  petPolicy: z.union([ z.string({ invalid_type_error: "Pet policy is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  published: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  showExactLocation: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  locationRadius: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  ownerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  images: z.lazy(() => UploadedPhotoUncheckedUpdateManyWithoutListingNestedInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestUncheckedUpdateManyWithoutListingNestedInputSchema).optional()
}).strict();

export const BookingUpsertWithoutListingInventoryInputSchema: z.ZodType<Prisma.BookingUpsertWithoutListingInventoryInput> = z.object({
  update: z.union([ z.lazy(() => BookingUpdateWithoutListingInventoryInputSchema),z.lazy(() => BookingUncheckedUpdateWithoutListingInventoryInputSchema) ]),
  create: z.union([ z.lazy(() => BookingCreateWithoutListingInventoryInputSchema),z.lazy(() => BookingUncheckedCreateWithoutListingInventoryInputSchema) ]),
  where: z.lazy(() => BookingWhereInputSchema).optional()
}).strict();

export const BookingUpdateToOneWithWhereWithoutListingInventoryInputSchema: z.ZodType<Prisma.BookingUpdateToOneWithWhereWithoutListingInventoryInput> = z.object({
  where: z.lazy(() => BookingWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => BookingUpdateWithoutListingInventoryInputSchema),z.lazy(() => BookingUncheckedUpdateWithoutListingInventoryInputSchema) ]),
}).strict();

export const BookingUpdateWithoutListingInventoryInputSchema: z.ZodType<Prisma.BookingUpdateWithoutListingInventoryInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkIn: z.union([ z.coerce.date({ invalid_type_error: "Check-in date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkOut: z.union([ z.coerce.date({ invalid_type_error: "Check-out date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  totalPrice: z.union([ z.number().positive({ message: "Total price must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => BookingStatusSchema),z.lazy(() => EnumBookingStatusFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutBookingsNestedInputSchema).optional(),
  bookingRequest: z.lazy(() => BookingRequestUpdateOneWithoutBookingNestedInputSchema).optional()
}).strict();

export const BookingUncheckedUpdateWithoutListingInventoryInputSchema: z.ZodType<Prisma.BookingUncheckedUpdateWithoutListingInventoryInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkIn: z.union([ z.coerce.date({ invalid_type_error: "Check-in date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkOut: z.union([ z.coerce.date({ invalid_type_error: "Check-out date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  totalPrice: z.union([ z.number().positive({ message: "Total price must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => BookingStatusSchema),z.lazy(() => EnumBookingStatusFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string({ invalid_type_error: "User ID is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  bookingRequestId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const UserCreateWithoutBookingsInputSchema: z.ZodType<Prisma.UserCreateWithoutBookingsInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  firstName: z.string({required_error: "First name is required" }).optional().nullable(),
  lastName: z.string({required_error: "Last name is required" }).optional().nullable(),
  imageUrl: z.string({required_error: "Image URL must be valid" }).optional().nullable(),
  password: z.string({required_error: "Password must be at least 8 characters" }).optional().nullable(),
  emailAddresses: z.lazy(() => EmailAddressCreateNestedManyWithoutUserInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountCreateNestedManyWithoutUserInputSchema).optional(),
  listings: z.lazy(() => ListingCreateNestedManyWithoutOwnerInputSchema).optional(),
  roles: z.lazy(() => UserRoleCreateNestedManyWithoutUserInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionCreateNestedManyWithoutUserInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestCreateNestedManyWithoutUserInputSchema).optional(),
  sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputSchema).optional(),
  passwordReset: z.lazy(() => PasswordResetCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutBookingsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutBookingsInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  firstName: z.string({required_error: "First name is required" }).optional().nullable(),
  lastName: z.string({required_error: "Last name is required" }).optional().nullable(),
  imageUrl: z.string({required_error: "Image URL must be valid" }).optional().nullable(),
  password: z.string({required_error: "Password must be at least 8 characters" }).optional().nullable(),
  emailAddresses: z.lazy(() => EmailAddressUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  listings: z.lazy(() => ListingUncheckedCreateNestedManyWithoutOwnerInputSchema).optional(),
  roles: z.lazy(() => UserRoleUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  passwordReset: z.lazy(() => PasswordResetUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutBookingsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutBookingsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutBookingsInputSchema),z.lazy(() => UserUncheckedCreateWithoutBookingsInputSchema) ]),
}).strict();

export const BookingRequestCreateWithoutBookingInputSchema: z.ZodType<Prisma.BookingRequestCreateWithoutBookingInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  message: z.string({ invalid_type_error: "Message is required" }),
  checkIn: z.coerce.date({ invalid_type_error: "Check-in date is required" }),
  checkOut: z.coerce.date({ invalid_type_error: "Check-out date is required" }),
  guests: z.number().int().min(1, { message: "At least 1 guest is required" }),
  pets: z.boolean().optional(),
  totalPrice: z.number().positive({ message: "Total price must be greater than 0" }).optional(),
  status: z.lazy(() => BookingRequestStatusSchema).optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutBookingRequestInputSchema),
  listing: z.lazy(() => ListingCreateNestedOneWithoutBookingRequestInputSchema),
  originalRequest: z.lazy(() => BookingRequestCreateNestedOneWithoutAlterationsInputSchema).optional(),
  alterations: z.lazy(() => BookingRequestCreateNestedManyWithoutOriginalRequestInputSchema).optional()
}).strict();

export const BookingRequestUncheckedCreateWithoutBookingInputSchema: z.ZodType<Prisma.BookingRequestUncheckedCreateWithoutBookingInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  message: z.string({ invalid_type_error: "Message is required" }),
  checkIn: z.coerce.date({ invalid_type_error: "Check-in date is required" }),
  checkOut: z.coerce.date({ invalid_type_error: "Check-out date is required" }),
  guests: z.number().int().min(1, { message: "At least 1 guest is required" }),
  pets: z.boolean().optional(),
  totalPrice: z.number().positive({ message: "Total price must be greater than 0" }).optional(),
  status: z.lazy(() => BookingRequestStatusSchema).optional(),
  alterationOf: z.string().optional().nullable(),
  userId: z.string(),
  listingId: z.string(),
  alterations: z.lazy(() => BookingRequestUncheckedCreateNestedManyWithoutOriginalRequestInputSchema).optional()
}).strict();

export const BookingRequestCreateOrConnectWithoutBookingInputSchema: z.ZodType<Prisma.BookingRequestCreateOrConnectWithoutBookingInput> = z.object({
  where: z.lazy(() => BookingRequestWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => BookingRequestCreateWithoutBookingInputSchema),z.lazy(() => BookingRequestUncheckedCreateWithoutBookingInputSchema) ]),
}).strict();

export const ListingInventoryCreateWithoutBookingInputSchema: z.ZodType<Prisma.ListingInventoryCreateWithoutBookingInput> = z.object({
  date: z.coerce.date({ invalid_type_error: "Date is required" }),
  isAvailable: z.boolean().optional(),
  price: z.number().gt(0, { message: "Price must be greater than 0" }),
  listing: z.lazy(() => ListingCreateNestedOneWithoutInventoryInputSchema)
}).strict();

export const ListingInventoryUncheckedCreateWithoutBookingInputSchema: z.ZodType<Prisma.ListingInventoryUncheckedCreateWithoutBookingInput> = z.object({
  id: z.number().int().optional(),
  date: z.coerce.date({ invalid_type_error: "Date is required" }),
  isAvailable: z.boolean().optional(),
  price: z.number().gt(0, { message: "Price must be greater than 0" }),
  listingId: z.string()
}).strict();

export const ListingInventoryCreateOrConnectWithoutBookingInputSchema: z.ZodType<Prisma.ListingInventoryCreateOrConnectWithoutBookingInput> = z.object({
  where: z.lazy(() => ListingInventoryWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ListingInventoryCreateWithoutBookingInputSchema),z.lazy(() => ListingInventoryUncheckedCreateWithoutBookingInputSchema) ]),
}).strict();

export const ListingInventoryCreateManyBookingInputEnvelopeSchema: z.ZodType<Prisma.ListingInventoryCreateManyBookingInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ListingInventoryCreateManyBookingInputSchema),z.lazy(() => ListingInventoryCreateManyBookingInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const UserUpsertWithoutBookingsInputSchema: z.ZodType<Prisma.UserUpsertWithoutBookingsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutBookingsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutBookingsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutBookingsInputSchema),z.lazy(() => UserUncheckedCreateWithoutBookingsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutBookingsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutBookingsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutBookingsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutBookingsInputSchema) ]),
}).strict();

export const UserUpdateWithoutBookingsInputSchema: z.ZodType<Prisma.UserUpdateWithoutBookingsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string({required_error: "First name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string({required_error: "Last name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string({required_error: "Image URL must be valid" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string({required_error: "Password must be at least 8 characters" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailAddresses: z.lazy(() => EmailAddressUpdateManyWithoutUserNestedInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountUpdateManyWithoutUserNestedInputSchema).optional(),
  listings: z.lazy(() => ListingUpdateManyWithoutOwnerNestedInputSchema).optional(),
  roles: z.lazy(() => UserRoleUpdateManyWithoutUserNestedInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionUpdateManyWithoutUserNestedInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestUpdateManyWithoutUserNestedInputSchema).optional(),
  sessions: z.lazy(() => SessionUpdateManyWithoutUserNestedInputSchema).optional(),
  passwordReset: z.lazy(() => PasswordResetUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutBookingsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutBookingsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string({required_error: "First name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string({required_error: "Last name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string({required_error: "Image URL must be valid" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string({required_error: "Password must be at least 8 characters" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailAddresses: z.lazy(() => EmailAddressUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  listings: z.lazy(() => ListingUncheckedUpdateManyWithoutOwnerNestedInputSchema).optional(),
  roles: z.lazy(() => UserRoleUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  passwordReset: z.lazy(() => PasswordResetUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const BookingRequestUpsertWithoutBookingInputSchema: z.ZodType<Prisma.BookingRequestUpsertWithoutBookingInput> = z.object({
  update: z.union([ z.lazy(() => BookingRequestUpdateWithoutBookingInputSchema),z.lazy(() => BookingRequestUncheckedUpdateWithoutBookingInputSchema) ]),
  create: z.union([ z.lazy(() => BookingRequestCreateWithoutBookingInputSchema),z.lazy(() => BookingRequestUncheckedCreateWithoutBookingInputSchema) ]),
  where: z.lazy(() => BookingRequestWhereInputSchema).optional()
}).strict();

export const BookingRequestUpdateToOneWithWhereWithoutBookingInputSchema: z.ZodType<Prisma.BookingRequestUpdateToOneWithWhereWithoutBookingInput> = z.object({
  where: z.lazy(() => BookingRequestWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => BookingRequestUpdateWithoutBookingInputSchema),z.lazy(() => BookingRequestUncheckedUpdateWithoutBookingInputSchema) ]),
}).strict();

export const BookingRequestUpdateWithoutBookingInputSchema: z.ZodType<Prisma.BookingRequestUpdateWithoutBookingInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string({ invalid_type_error: "Message is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkIn: z.union([ z.coerce.date({ invalid_type_error: "Check-in date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkOut: z.union([ z.coerce.date({ invalid_type_error: "Check-out date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  guests: z.union([ z.number().int().min(1, { message: "At least 1 guest is required" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  pets: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  totalPrice: z.union([ z.number().positive({ message: "Total price must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => BookingRequestStatusSchema),z.lazy(() => EnumBookingRequestStatusFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutBookingRequestNestedInputSchema).optional(),
  listing: z.lazy(() => ListingUpdateOneRequiredWithoutBookingRequestNestedInputSchema).optional(),
  originalRequest: z.lazy(() => BookingRequestUpdateOneWithoutAlterationsNestedInputSchema).optional(),
  alterations: z.lazy(() => BookingRequestUpdateManyWithoutOriginalRequestNestedInputSchema).optional()
}).strict();

export const BookingRequestUncheckedUpdateWithoutBookingInputSchema: z.ZodType<Prisma.BookingRequestUncheckedUpdateWithoutBookingInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string({ invalid_type_error: "Message is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkIn: z.union([ z.coerce.date({ invalid_type_error: "Check-in date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkOut: z.union([ z.coerce.date({ invalid_type_error: "Check-out date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  guests: z.union([ z.number().int().min(1, { message: "At least 1 guest is required" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  pets: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  totalPrice: z.union([ z.number().positive({ message: "Total price must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => BookingRequestStatusSchema),z.lazy(() => EnumBookingRequestStatusFieldUpdateOperationsInputSchema) ]).optional(),
  alterationOf: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  listingId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  alterations: z.lazy(() => BookingRequestUncheckedUpdateManyWithoutOriginalRequestNestedInputSchema).optional()
}).strict();

export const ListingInventoryUpsertWithWhereUniqueWithoutBookingInputSchema: z.ZodType<Prisma.ListingInventoryUpsertWithWhereUniqueWithoutBookingInput> = z.object({
  where: z.lazy(() => ListingInventoryWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ListingInventoryUpdateWithoutBookingInputSchema),z.lazy(() => ListingInventoryUncheckedUpdateWithoutBookingInputSchema) ]),
  create: z.union([ z.lazy(() => ListingInventoryCreateWithoutBookingInputSchema),z.lazy(() => ListingInventoryUncheckedCreateWithoutBookingInputSchema) ]),
}).strict();

export const ListingInventoryUpdateWithWhereUniqueWithoutBookingInputSchema: z.ZodType<Prisma.ListingInventoryUpdateWithWhereUniqueWithoutBookingInput> = z.object({
  where: z.lazy(() => ListingInventoryWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ListingInventoryUpdateWithoutBookingInputSchema),z.lazy(() => ListingInventoryUncheckedUpdateWithoutBookingInputSchema) ]),
}).strict();

export const ListingInventoryUpdateManyWithWhereWithoutBookingInputSchema: z.ZodType<Prisma.ListingInventoryUpdateManyWithWhereWithoutBookingInput> = z.object({
  where: z.lazy(() => ListingInventoryScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ListingInventoryUpdateManyMutationInputSchema),z.lazy(() => ListingInventoryUncheckedUpdateManyWithoutBookingInputSchema) ]),
}).strict();

export const UserCreateWithoutBookingRequestInputSchema: z.ZodType<Prisma.UserCreateWithoutBookingRequestInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  firstName: z.string({required_error: "First name is required" }).optional().nullable(),
  lastName: z.string({required_error: "Last name is required" }).optional().nullable(),
  imageUrl: z.string({required_error: "Image URL must be valid" }).optional().nullable(),
  password: z.string({required_error: "Password must be at least 8 characters" }).optional().nullable(),
  emailAddresses: z.lazy(() => EmailAddressCreateNestedManyWithoutUserInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountCreateNestedManyWithoutUserInputSchema).optional(),
  listings: z.lazy(() => ListingCreateNestedManyWithoutOwnerInputSchema).optional(),
  roles: z.lazy(() => UserRoleCreateNestedManyWithoutUserInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionCreateNestedManyWithoutUserInputSchema).optional(),
  bookings: z.lazy(() => BookingCreateNestedManyWithoutUserInputSchema).optional(),
  sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputSchema).optional(),
  passwordReset: z.lazy(() => PasswordResetCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutBookingRequestInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutBookingRequestInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  firstName: z.string({required_error: "First name is required" }).optional().nullable(),
  lastName: z.string({required_error: "Last name is required" }).optional().nullable(),
  imageUrl: z.string({required_error: "Image URL must be valid" }).optional().nullable(),
  password: z.string({required_error: "Password must be at least 8 characters" }).optional().nullable(),
  emailAddresses: z.lazy(() => EmailAddressUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  listings: z.lazy(() => ListingUncheckedCreateNestedManyWithoutOwnerInputSchema).optional(),
  roles: z.lazy(() => UserRoleUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  bookings: z.lazy(() => BookingUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  passwordReset: z.lazy(() => PasswordResetUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutBookingRequestInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutBookingRequestInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutBookingRequestInputSchema),z.lazy(() => UserUncheckedCreateWithoutBookingRequestInputSchema) ]),
}).strict();

export const ListingCreateWithoutBookingRequestInputSchema: z.ZodType<Prisma.ListingCreateWithoutBookingRequestInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  title: z.string({required_error: "Title is required" }),
  slug: z.string({required_error: "Slug is required" }).optional(),
  description: z.string({required_error: "Description is required" }),
  propertyType: z.string({required_error: "Property type is required" }),
  address: z.string({required_error: "Address is required" }),
  latitude: z.number({ invalid_type_error: "Latitude must be a number" }).gt(-90, { message: "Latitude must be greater than -90" }).lt(90, { message: "Latitude must be less than 90" }).optional().nullable(),
  longitude: z.number({ invalid_type_error: "Longitude must be a number" }).gt(-180, { message: "Longitude must be greater than -180" }).lt(180, { message: "Longitude must be less than 180" }).optional().nullable(),
  timeZone: z.string({ invalid_type_error: "Time zone is required" }).optional(),
  checkInTime: z.string({ invalid_type_error: "Check-in time is required" }).optional(),
  checkOutTime: z.string({ invalid_type_error: "Check-out time is required" }).optional(),
  amenities: z.union([ z.lazy(() => ListingCreateamenitiesInputSchema),z.string().array() ]).optional(),
  pricePerNight: z.number().gt(0, { message: "Price per night must be greater than 0" }),
  currency: z.lazy(() => CurrencySchema).optional(),
  minimumStay: z.number().gt(0, { message: "Minimum stay must be greater than 0" }).optional(),
  maximumGuests: z.number().gt(0, { message: "Maximum guests must be greater than 0" }).optional(),
  houseRules: z.string({ invalid_type_error: "House rules are required" }),
  allowPets: z.boolean().optional(),
  petPolicy: z.string({ invalid_type_error: "Pet policy is required" }).optional(),
  published: z.boolean().optional(),
  showExactLocation: z.boolean().optional(),
  locationRadius: z.number().optional(),
  owner: z.lazy(() => UserCreateNestedOneWithoutListingsInputSchema),
  images: z.lazy(() => UploadedPhotoCreateNestedManyWithoutListingInputSchema).optional(),
  inventory: z.lazy(() => ListingInventoryCreateNestedManyWithoutListingInputSchema).optional()
}).strict();

export const ListingUncheckedCreateWithoutBookingRequestInputSchema: z.ZodType<Prisma.ListingUncheckedCreateWithoutBookingRequestInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  title: z.string({required_error: "Title is required" }),
  slug: z.string({required_error: "Slug is required" }).optional(),
  description: z.string({required_error: "Description is required" }),
  propertyType: z.string({required_error: "Property type is required" }),
  address: z.string({required_error: "Address is required" }),
  latitude: z.number({ invalid_type_error: "Latitude must be a number" }).gt(-90, { message: "Latitude must be greater than -90" }).lt(90, { message: "Latitude must be less than 90" }).optional().nullable(),
  longitude: z.number({ invalid_type_error: "Longitude must be a number" }).gt(-180, { message: "Longitude must be greater than -180" }).lt(180, { message: "Longitude must be less than 180" }).optional().nullable(),
  timeZone: z.string({ invalid_type_error: "Time zone is required" }).optional(),
  checkInTime: z.string({ invalid_type_error: "Check-in time is required" }).optional(),
  checkOutTime: z.string({ invalid_type_error: "Check-out time is required" }).optional(),
  amenities: z.union([ z.lazy(() => ListingCreateamenitiesInputSchema),z.string().array() ]).optional(),
  pricePerNight: z.number().gt(0, { message: "Price per night must be greater than 0" }),
  currency: z.lazy(() => CurrencySchema).optional(),
  minimumStay: z.number().gt(0, { message: "Minimum stay must be greater than 0" }).optional(),
  maximumGuests: z.number().gt(0, { message: "Maximum guests must be greater than 0" }).optional(),
  houseRules: z.string({ invalid_type_error: "House rules are required" }),
  allowPets: z.boolean().optional(),
  petPolicy: z.string({ invalid_type_error: "Pet policy is required" }).optional(),
  published: z.boolean().optional(),
  showExactLocation: z.boolean().optional(),
  locationRadius: z.number().optional(),
  ownerId: z.string(),
  images: z.lazy(() => UploadedPhotoUncheckedCreateNestedManyWithoutListingInputSchema).optional(),
  inventory: z.lazy(() => ListingInventoryUncheckedCreateNestedManyWithoutListingInputSchema).optional()
}).strict();

export const ListingCreateOrConnectWithoutBookingRequestInputSchema: z.ZodType<Prisma.ListingCreateOrConnectWithoutBookingRequestInput> = z.object({
  where: z.lazy(() => ListingWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ListingCreateWithoutBookingRequestInputSchema),z.lazy(() => ListingUncheckedCreateWithoutBookingRequestInputSchema) ]),
}).strict();

export const BookingCreateWithoutBookingRequestInputSchema: z.ZodType<Prisma.BookingCreateWithoutBookingRequestInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  checkIn: z.coerce.date({ invalid_type_error: "Check-in date is required" }),
  checkOut: z.coerce.date({ invalid_type_error: "Check-out date is required" }),
  totalPrice: z.number().positive({ message: "Total price must be greater than 0" }),
  status: z.lazy(() => BookingStatusSchema).optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutBookingsInputSchema),
  listingInventory: z.lazy(() => ListingInventoryCreateNestedManyWithoutBookingInputSchema).optional()
}).strict();

export const BookingUncheckedCreateWithoutBookingRequestInputSchema: z.ZodType<Prisma.BookingUncheckedCreateWithoutBookingRequestInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  checkIn: z.coerce.date({ invalid_type_error: "Check-in date is required" }),
  checkOut: z.coerce.date({ invalid_type_error: "Check-out date is required" }),
  totalPrice: z.number().positive({ message: "Total price must be greater than 0" }),
  status: z.lazy(() => BookingStatusSchema).optional(),
  userId: z.string({ invalid_type_error: "User ID is required" }),
  listingInventory: z.lazy(() => ListingInventoryUncheckedCreateNestedManyWithoutBookingInputSchema).optional()
}).strict();

export const BookingCreateOrConnectWithoutBookingRequestInputSchema: z.ZodType<Prisma.BookingCreateOrConnectWithoutBookingRequestInput> = z.object({
  where: z.lazy(() => BookingWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => BookingCreateWithoutBookingRequestInputSchema),z.lazy(() => BookingUncheckedCreateWithoutBookingRequestInputSchema) ]),
}).strict();

export const BookingCreateManyBookingRequestInputEnvelopeSchema: z.ZodType<Prisma.BookingCreateManyBookingRequestInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => BookingCreateManyBookingRequestInputSchema),z.lazy(() => BookingCreateManyBookingRequestInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const BookingRequestCreateWithoutAlterationsInputSchema: z.ZodType<Prisma.BookingRequestCreateWithoutAlterationsInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  message: z.string({ invalid_type_error: "Message is required" }),
  checkIn: z.coerce.date({ invalid_type_error: "Check-in date is required" }),
  checkOut: z.coerce.date({ invalid_type_error: "Check-out date is required" }),
  guests: z.number().int().min(1, { message: "At least 1 guest is required" }),
  pets: z.boolean().optional(),
  totalPrice: z.number().positive({ message: "Total price must be greater than 0" }).optional(),
  status: z.lazy(() => BookingRequestStatusSchema).optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutBookingRequestInputSchema),
  listing: z.lazy(() => ListingCreateNestedOneWithoutBookingRequestInputSchema),
  Booking: z.lazy(() => BookingCreateNestedManyWithoutBookingRequestInputSchema).optional(),
  originalRequest: z.lazy(() => BookingRequestCreateNestedOneWithoutAlterationsInputSchema).optional()
}).strict();

export const BookingRequestUncheckedCreateWithoutAlterationsInputSchema: z.ZodType<Prisma.BookingRequestUncheckedCreateWithoutAlterationsInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  message: z.string({ invalid_type_error: "Message is required" }),
  checkIn: z.coerce.date({ invalid_type_error: "Check-in date is required" }),
  checkOut: z.coerce.date({ invalid_type_error: "Check-out date is required" }),
  guests: z.number().int().min(1, { message: "At least 1 guest is required" }),
  pets: z.boolean().optional(),
  totalPrice: z.number().positive({ message: "Total price must be greater than 0" }).optional(),
  status: z.lazy(() => BookingRequestStatusSchema).optional(),
  alterationOf: z.string().optional().nullable(),
  userId: z.string(),
  listingId: z.string(),
  Booking: z.lazy(() => BookingUncheckedCreateNestedManyWithoutBookingRequestInputSchema).optional()
}).strict();

export const BookingRequestCreateOrConnectWithoutAlterationsInputSchema: z.ZodType<Prisma.BookingRequestCreateOrConnectWithoutAlterationsInput> = z.object({
  where: z.lazy(() => BookingRequestWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => BookingRequestCreateWithoutAlterationsInputSchema),z.lazy(() => BookingRequestUncheckedCreateWithoutAlterationsInputSchema) ]),
}).strict();

export const BookingRequestCreateWithoutOriginalRequestInputSchema: z.ZodType<Prisma.BookingRequestCreateWithoutOriginalRequestInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  message: z.string({ invalid_type_error: "Message is required" }),
  checkIn: z.coerce.date({ invalid_type_error: "Check-in date is required" }),
  checkOut: z.coerce.date({ invalid_type_error: "Check-out date is required" }),
  guests: z.number().int().min(1, { message: "At least 1 guest is required" }),
  pets: z.boolean().optional(),
  totalPrice: z.number().positive({ message: "Total price must be greater than 0" }).optional(),
  status: z.lazy(() => BookingRequestStatusSchema).optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutBookingRequestInputSchema),
  listing: z.lazy(() => ListingCreateNestedOneWithoutBookingRequestInputSchema),
  Booking: z.lazy(() => BookingCreateNestedManyWithoutBookingRequestInputSchema).optional(),
  alterations: z.lazy(() => BookingRequestCreateNestedManyWithoutOriginalRequestInputSchema).optional()
}).strict();

export const BookingRequestUncheckedCreateWithoutOriginalRequestInputSchema: z.ZodType<Prisma.BookingRequestUncheckedCreateWithoutOriginalRequestInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  message: z.string({ invalid_type_error: "Message is required" }),
  checkIn: z.coerce.date({ invalid_type_error: "Check-in date is required" }),
  checkOut: z.coerce.date({ invalid_type_error: "Check-out date is required" }),
  guests: z.number().int().min(1, { message: "At least 1 guest is required" }),
  pets: z.boolean().optional(),
  totalPrice: z.number().positive({ message: "Total price must be greater than 0" }).optional(),
  status: z.lazy(() => BookingRequestStatusSchema).optional(),
  userId: z.string(),
  listingId: z.string(),
  Booking: z.lazy(() => BookingUncheckedCreateNestedManyWithoutBookingRequestInputSchema).optional(),
  alterations: z.lazy(() => BookingRequestUncheckedCreateNestedManyWithoutOriginalRequestInputSchema).optional()
}).strict();

export const BookingRequestCreateOrConnectWithoutOriginalRequestInputSchema: z.ZodType<Prisma.BookingRequestCreateOrConnectWithoutOriginalRequestInput> = z.object({
  where: z.lazy(() => BookingRequestWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => BookingRequestCreateWithoutOriginalRequestInputSchema),z.lazy(() => BookingRequestUncheckedCreateWithoutOriginalRequestInputSchema) ]),
}).strict();

export const BookingRequestCreateManyOriginalRequestInputEnvelopeSchema: z.ZodType<Prisma.BookingRequestCreateManyOriginalRequestInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => BookingRequestCreateManyOriginalRequestInputSchema),z.lazy(() => BookingRequestCreateManyOriginalRequestInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const UserUpsertWithoutBookingRequestInputSchema: z.ZodType<Prisma.UserUpsertWithoutBookingRequestInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutBookingRequestInputSchema),z.lazy(() => UserUncheckedUpdateWithoutBookingRequestInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutBookingRequestInputSchema),z.lazy(() => UserUncheckedCreateWithoutBookingRequestInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutBookingRequestInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutBookingRequestInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutBookingRequestInputSchema),z.lazy(() => UserUncheckedUpdateWithoutBookingRequestInputSchema) ]),
}).strict();

export const UserUpdateWithoutBookingRequestInputSchema: z.ZodType<Prisma.UserUpdateWithoutBookingRequestInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string({required_error: "First name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string({required_error: "Last name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string({required_error: "Image URL must be valid" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string({required_error: "Password must be at least 8 characters" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailAddresses: z.lazy(() => EmailAddressUpdateManyWithoutUserNestedInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountUpdateManyWithoutUserNestedInputSchema).optional(),
  listings: z.lazy(() => ListingUpdateManyWithoutOwnerNestedInputSchema).optional(),
  roles: z.lazy(() => UserRoleUpdateManyWithoutUserNestedInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionUpdateManyWithoutUserNestedInputSchema).optional(),
  bookings: z.lazy(() => BookingUpdateManyWithoutUserNestedInputSchema).optional(),
  sessions: z.lazy(() => SessionUpdateManyWithoutUserNestedInputSchema).optional(),
  passwordReset: z.lazy(() => PasswordResetUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutBookingRequestInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutBookingRequestInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string({required_error: "First name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string({required_error: "Last name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string({required_error: "Image URL must be valid" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string({required_error: "Password must be at least 8 characters" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailAddresses: z.lazy(() => EmailAddressUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  listings: z.lazy(() => ListingUncheckedUpdateManyWithoutOwnerNestedInputSchema).optional(),
  roles: z.lazy(() => UserRoleUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  bookings: z.lazy(() => BookingUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  passwordReset: z.lazy(() => PasswordResetUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const ListingUpsertWithoutBookingRequestInputSchema: z.ZodType<Prisma.ListingUpsertWithoutBookingRequestInput> = z.object({
  update: z.union([ z.lazy(() => ListingUpdateWithoutBookingRequestInputSchema),z.lazy(() => ListingUncheckedUpdateWithoutBookingRequestInputSchema) ]),
  create: z.union([ z.lazy(() => ListingCreateWithoutBookingRequestInputSchema),z.lazy(() => ListingUncheckedCreateWithoutBookingRequestInputSchema) ]),
  where: z.lazy(() => ListingWhereInputSchema).optional()
}).strict();

export const ListingUpdateToOneWithWhereWithoutBookingRequestInputSchema: z.ZodType<Prisma.ListingUpdateToOneWithWhereWithoutBookingRequestInput> = z.object({
  where: z.lazy(() => ListingWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ListingUpdateWithoutBookingRequestInputSchema),z.lazy(() => ListingUncheckedUpdateWithoutBookingRequestInputSchema) ]),
}).strict();

export const ListingUpdateWithoutBookingRequestInputSchema: z.ZodType<Prisma.ListingUpdateWithoutBookingRequestInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string({required_error: "Title is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string({required_error: "Slug is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string({required_error: "Description is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  propertyType: z.union([ z.string({required_error: "Property type is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string({required_error: "Address is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latitude: z.union([ z.number({ invalid_type_error: "Latitude must be a number" }).gt(-90, { message: "Latitude must be greater than -90" }).lt(90, { message: "Latitude must be less than 90" }),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  longitude: z.union([ z.number({ invalid_type_error: "Longitude must be a number" }).gt(-180, { message: "Longitude must be greater than -180" }).lt(180, { message: "Longitude must be less than 180" }),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  timeZone: z.union([ z.string({ invalid_type_error: "Time zone is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkInTime: z.union([ z.string({ invalid_type_error: "Check-in time is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkOutTime: z.union([ z.string({ invalid_type_error: "Check-out time is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  amenities: z.union([ z.lazy(() => ListingUpdateamenitiesInputSchema),z.string().array() ]).optional(),
  pricePerNight: z.union([ z.number().gt(0, { message: "Price per night must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  currency: z.union([ z.lazy(() => CurrencySchema),z.lazy(() => EnumCurrencyFieldUpdateOperationsInputSchema) ]).optional(),
  minimumStay: z.union([ z.number().gt(0, { message: "Minimum stay must be greater than 0" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  maximumGuests: z.union([ z.number().gt(0, { message: "Maximum guests must be greater than 0" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  houseRules: z.union([ z.string({ invalid_type_error: "House rules are required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  allowPets: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  petPolicy: z.union([ z.string({ invalid_type_error: "Pet policy is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  published: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  showExactLocation: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  locationRadius: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  owner: z.lazy(() => UserUpdateOneRequiredWithoutListingsNestedInputSchema).optional(),
  images: z.lazy(() => UploadedPhotoUpdateManyWithoutListingNestedInputSchema).optional(),
  inventory: z.lazy(() => ListingInventoryUpdateManyWithoutListingNestedInputSchema).optional()
}).strict();

export const ListingUncheckedUpdateWithoutBookingRequestInputSchema: z.ZodType<Prisma.ListingUncheckedUpdateWithoutBookingRequestInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string({required_error: "Title is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string({required_error: "Slug is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string({required_error: "Description is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  propertyType: z.union([ z.string({required_error: "Property type is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string({required_error: "Address is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latitude: z.union([ z.number({ invalid_type_error: "Latitude must be a number" }).gt(-90, { message: "Latitude must be greater than -90" }).lt(90, { message: "Latitude must be less than 90" }),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  longitude: z.union([ z.number({ invalid_type_error: "Longitude must be a number" }).gt(-180, { message: "Longitude must be greater than -180" }).lt(180, { message: "Longitude must be less than 180" }),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  timeZone: z.union([ z.string({ invalid_type_error: "Time zone is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkInTime: z.union([ z.string({ invalid_type_error: "Check-in time is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkOutTime: z.union([ z.string({ invalid_type_error: "Check-out time is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  amenities: z.union([ z.lazy(() => ListingUpdateamenitiesInputSchema),z.string().array() ]).optional(),
  pricePerNight: z.union([ z.number().gt(0, { message: "Price per night must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  currency: z.union([ z.lazy(() => CurrencySchema),z.lazy(() => EnumCurrencyFieldUpdateOperationsInputSchema) ]).optional(),
  minimumStay: z.union([ z.number().gt(0, { message: "Minimum stay must be greater than 0" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  maximumGuests: z.union([ z.number().gt(0, { message: "Maximum guests must be greater than 0" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  houseRules: z.union([ z.string({ invalid_type_error: "House rules are required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  allowPets: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  petPolicy: z.union([ z.string({ invalid_type_error: "Pet policy is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  published: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  showExactLocation: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  locationRadius: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  ownerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  images: z.lazy(() => UploadedPhotoUncheckedUpdateManyWithoutListingNestedInputSchema).optional(),
  inventory: z.lazy(() => ListingInventoryUncheckedUpdateManyWithoutListingNestedInputSchema).optional()
}).strict();

export const BookingUpsertWithWhereUniqueWithoutBookingRequestInputSchema: z.ZodType<Prisma.BookingUpsertWithWhereUniqueWithoutBookingRequestInput> = z.object({
  where: z.lazy(() => BookingWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => BookingUpdateWithoutBookingRequestInputSchema),z.lazy(() => BookingUncheckedUpdateWithoutBookingRequestInputSchema) ]),
  create: z.union([ z.lazy(() => BookingCreateWithoutBookingRequestInputSchema),z.lazy(() => BookingUncheckedCreateWithoutBookingRequestInputSchema) ]),
}).strict();

export const BookingUpdateWithWhereUniqueWithoutBookingRequestInputSchema: z.ZodType<Prisma.BookingUpdateWithWhereUniqueWithoutBookingRequestInput> = z.object({
  where: z.lazy(() => BookingWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => BookingUpdateWithoutBookingRequestInputSchema),z.lazy(() => BookingUncheckedUpdateWithoutBookingRequestInputSchema) ]),
}).strict();

export const BookingUpdateManyWithWhereWithoutBookingRequestInputSchema: z.ZodType<Prisma.BookingUpdateManyWithWhereWithoutBookingRequestInput> = z.object({
  where: z.lazy(() => BookingScalarWhereInputSchema),
  data: z.union([ z.lazy(() => BookingUpdateManyMutationInputSchema),z.lazy(() => BookingUncheckedUpdateManyWithoutBookingRequestInputSchema) ]),
}).strict();

export const BookingRequestUpsertWithoutAlterationsInputSchema: z.ZodType<Prisma.BookingRequestUpsertWithoutAlterationsInput> = z.object({
  update: z.union([ z.lazy(() => BookingRequestUpdateWithoutAlterationsInputSchema),z.lazy(() => BookingRequestUncheckedUpdateWithoutAlterationsInputSchema) ]),
  create: z.union([ z.lazy(() => BookingRequestCreateWithoutAlterationsInputSchema),z.lazy(() => BookingRequestUncheckedCreateWithoutAlterationsInputSchema) ]),
  where: z.lazy(() => BookingRequestWhereInputSchema).optional()
}).strict();

export const BookingRequestUpdateToOneWithWhereWithoutAlterationsInputSchema: z.ZodType<Prisma.BookingRequestUpdateToOneWithWhereWithoutAlterationsInput> = z.object({
  where: z.lazy(() => BookingRequestWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => BookingRequestUpdateWithoutAlterationsInputSchema),z.lazy(() => BookingRequestUncheckedUpdateWithoutAlterationsInputSchema) ]),
}).strict();

export const BookingRequestUpdateWithoutAlterationsInputSchema: z.ZodType<Prisma.BookingRequestUpdateWithoutAlterationsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string({ invalid_type_error: "Message is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkIn: z.union([ z.coerce.date({ invalid_type_error: "Check-in date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkOut: z.union([ z.coerce.date({ invalid_type_error: "Check-out date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  guests: z.union([ z.number().int().min(1, { message: "At least 1 guest is required" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  pets: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  totalPrice: z.union([ z.number().positive({ message: "Total price must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => BookingRequestStatusSchema),z.lazy(() => EnumBookingRequestStatusFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutBookingRequestNestedInputSchema).optional(),
  listing: z.lazy(() => ListingUpdateOneRequiredWithoutBookingRequestNestedInputSchema).optional(),
  Booking: z.lazy(() => BookingUpdateManyWithoutBookingRequestNestedInputSchema).optional(),
  originalRequest: z.lazy(() => BookingRequestUpdateOneWithoutAlterationsNestedInputSchema).optional()
}).strict();

export const BookingRequestUncheckedUpdateWithoutAlterationsInputSchema: z.ZodType<Prisma.BookingRequestUncheckedUpdateWithoutAlterationsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string({ invalid_type_error: "Message is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkIn: z.union([ z.coerce.date({ invalid_type_error: "Check-in date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkOut: z.union([ z.coerce.date({ invalid_type_error: "Check-out date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  guests: z.union([ z.number().int().min(1, { message: "At least 1 guest is required" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  pets: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  totalPrice: z.union([ z.number().positive({ message: "Total price must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => BookingRequestStatusSchema),z.lazy(() => EnumBookingRequestStatusFieldUpdateOperationsInputSchema) ]).optional(),
  alterationOf: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  listingId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  Booking: z.lazy(() => BookingUncheckedUpdateManyWithoutBookingRequestNestedInputSchema).optional()
}).strict();

export const BookingRequestUpsertWithWhereUniqueWithoutOriginalRequestInputSchema: z.ZodType<Prisma.BookingRequestUpsertWithWhereUniqueWithoutOriginalRequestInput> = z.object({
  where: z.lazy(() => BookingRequestWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => BookingRequestUpdateWithoutOriginalRequestInputSchema),z.lazy(() => BookingRequestUncheckedUpdateWithoutOriginalRequestInputSchema) ]),
  create: z.union([ z.lazy(() => BookingRequestCreateWithoutOriginalRequestInputSchema),z.lazy(() => BookingRequestUncheckedCreateWithoutOriginalRequestInputSchema) ]),
}).strict();

export const BookingRequestUpdateWithWhereUniqueWithoutOriginalRequestInputSchema: z.ZodType<Prisma.BookingRequestUpdateWithWhereUniqueWithoutOriginalRequestInput> = z.object({
  where: z.lazy(() => BookingRequestWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => BookingRequestUpdateWithoutOriginalRequestInputSchema),z.lazy(() => BookingRequestUncheckedUpdateWithoutOriginalRequestInputSchema) ]),
}).strict();

export const BookingRequestUpdateManyWithWhereWithoutOriginalRequestInputSchema: z.ZodType<Prisma.BookingRequestUpdateManyWithWhereWithoutOriginalRequestInput> = z.object({
  where: z.lazy(() => BookingRequestScalarWhereInputSchema),
  data: z.union([ z.lazy(() => BookingRequestUpdateManyMutationInputSchema),z.lazy(() => BookingRequestUncheckedUpdateManyWithoutOriginalRequestInputSchema) ]),
}).strict();

export const UserCreateWithoutSessionsInputSchema: z.ZodType<Prisma.UserCreateWithoutSessionsInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  firstName: z.string({required_error: "First name is required" }).optional().nullable(),
  lastName: z.string({required_error: "Last name is required" }).optional().nullable(),
  imageUrl: z.string({required_error: "Image URL must be valid" }).optional().nullable(),
  password: z.string({required_error: "Password must be at least 8 characters" }).optional().nullable(),
  emailAddresses: z.lazy(() => EmailAddressCreateNestedManyWithoutUserInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountCreateNestedManyWithoutUserInputSchema).optional(),
  listings: z.lazy(() => ListingCreateNestedManyWithoutOwnerInputSchema).optional(),
  roles: z.lazy(() => UserRoleCreateNestedManyWithoutUserInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionCreateNestedManyWithoutUserInputSchema).optional(),
  bookings: z.lazy(() => BookingCreateNestedManyWithoutUserInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestCreateNestedManyWithoutUserInputSchema).optional(),
  passwordReset: z.lazy(() => PasswordResetCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutSessionsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutSessionsInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  firstName: z.string({required_error: "First name is required" }).optional().nullable(),
  lastName: z.string({required_error: "Last name is required" }).optional().nullable(),
  imageUrl: z.string({required_error: "Image URL must be valid" }).optional().nullable(),
  password: z.string({required_error: "Password must be at least 8 characters" }).optional().nullable(),
  emailAddresses: z.lazy(() => EmailAddressUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  listings: z.lazy(() => ListingUncheckedCreateNestedManyWithoutOwnerInputSchema).optional(),
  roles: z.lazy(() => UserRoleUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  bookings: z.lazy(() => BookingUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  passwordReset: z.lazy(() => PasswordResetUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutSessionsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutSessionsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutSessionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutSessionsInputSchema) ]),
}).strict();

export const UserUpsertWithoutSessionsInputSchema: z.ZodType<Prisma.UserUpsertWithoutSessionsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutSessionsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutSessionsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutSessionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutSessionsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutSessionsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutSessionsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutSessionsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutSessionsInputSchema) ]),
}).strict();

export const UserUpdateWithoutSessionsInputSchema: z.ZodType<Prisma.UserUpdateWithoutSessionsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string({required_error: "First name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string({required_error: "Last name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string({required_error: "Image URL must be valid" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string({required_error: "Password must be at least 8 characters" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailAddresses: z.lazy(() => EmailAddressUpdateManyWithoutUserNestedInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountUpdateManyWithoutUserNestedInputSchema).optional(),
  listings: z.lazy(() => ListingUpdateManyWithoutOwnerNestedInputSchema).optional(),
  roles: z.lazy(() => UserRoleUpdateManyWithoutUserNestedInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionUpdateManyWithoutUserNestedInputSchema).optional(),
  bookings: z.lazy(() => BookingUpdateManyWithoutUserNestedInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestUpdateManyWithoutUserNestedInputSchema).optional(),
  passwordReset: z.lazy(() => PasswordResetUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutSessionsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutSessionsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string({required_error: "First name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string({required_error: "Last name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string({required_error: "Image URL must be valid" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string({required_error: "Password must be at least 8 characters" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailAddresses: z.lazy(() => EmailAddressUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  listings: z.lazy(() => ListingUncheckedUpdateManyWithoutOwnerNestedInputSchema).optional(),
  roles: z.lazy(() => UserRoleUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  bookings: z.lazy(() => BookingUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  passwordReset: z.lazy(() => PasswordResetUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserCreateWithoutPasswordResetInputSchema: z.ZodType<Prisma.UserCreateWithoutPasswordResetInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  firstName: z.string({required_error: "First name is required" }).optional().nullable(),
  lastName: z.string({required_error: "Last name is required" }).optional().nullable(),
  imageUrl: z.string({required_error: "Image URL must be valid" }).optional().nullable(),
  password: z.string({required_error: "Password must be at least 8 characters" }).optional().nullable(),
  emailAddresses: z.lazy(() => EmailAddressCreateNestedManyWithoutUserInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountCreateNestedManyWithoutUserInputSchema).optional(),
  listings: z.lazy(() => ListingCreateNestedManyWithoutOwnerInputSchema).optional(),
  roles: z.lazy(() => UserRoleCreateNestedManyWithoutUserInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionCreateNestedManyWithoutUserInputSchema).optional(),
  bookings: z.lazy(() => BookingCreateNestedManyWithoutUserInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestCreateNestedManyWithoutUserInputSchema).optional(),
  sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutPasswordResetInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutPasswordResetInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  firstName: z.string({required_error: "First name is required" }).optional().nullable(),
  lastName: z.string({required_error: "Last name is required" }).optional().nullable(),
  imageUrl: z.string({required_error: "Image URL must be valid" }).optional().nullable(),
  password: z.string({required_error: "Password must be at least 8 characters" }).optional().nullable(),
  emailAddresses: z.lazy(() => EmailAddressUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  listings: z.lazy(() => ListingUncheckedCreateNestedManyWithoutOwnerInputSchema).optional(),
  roles: z.lazy(() => UserRoleUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  bookings: z.lazy(() => BookingUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutPasswordResetInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutPasswordResetInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutPasswordResetInputSchema),z.lazy(() => UserUncheckedCreateWithoutPasswordResetInputSchema) ]),
}).strict();

export const UserUpsertWithoutPasswordResetInputSchema: z.ZodType<Prisma.UserUpsertWithoutPasswordResetInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutPasswordResetInputSchema),z.lazy(() => UserUncheckedUpdateWithoutPasswordResetInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutPasswordResetInputSchema),z.lazy(() => UserUncheckedCreateWithoutPasswordResetInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutPasswordResetInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutPasswordResetInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutPasswordResetInputSchema),z.lazy(() => UserUncheckedUpdateWithoutPasswordResetInputSchema) ]),
}).strict();

export const UserUpdateWithoutPasswordResetInputSchema: z.ZodType<Prisma.UserUpdateWithoutPasswordResetInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string({required_error: "First name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string({required_error: "Last name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string({required_error: "Image URL must be valid" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string({required_error: "Password must be at least 8 characters" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailAddresses: z.lazy(() => EmailAddressUpdateManyWithoutUserNestedInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountUpdateManyWithoutUserNestedInputSchema).optional(),
  listings: z.lazy(() => ListingUpdateManyWithoutOwnerNestedInputSchema).optional(),
  roles: z.lazy(() => UserRoleUpdateManyWithoutUserNestedInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionUpdateManyWithoutUserNestedInputSchema).optional(),
  bookings: z.lazy(() => BookingUpdateManyWithoutUserNestedInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestUpdateManyWithoutUserNestedInputSchema).optional(),
  sessions: z.lazy(() => SessionUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutPasswordResetInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutPasswordResetInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string({required_error: "First name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string({required_error: "Last name is required" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string({required_error: "Image URL must be valid" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string({required_error: "Password must be at least 8 characters" }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailAddresses: z.lazy(() => EmailAddressUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  listings: z.lazy(() => ListingUncheckedUpdateManyWithoutOwnerNestedInputSchema).optional(),
  roles: z.lazy(() => UserRoleUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  bookings: z.lazy(() => BookingUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const EmailAddressCreateManyUserInputSchema: z.ZodType<Prisma.EmailAddressCreateManyUserInput> = z.object({
  id: z.string().cuid().optional(),
  emailAddress: z.string({required_error: "Email address is required" }).email({ message: "Must be a valid email address" }),
  isPrimary: z.boolean().optional(),
  verification: z.string().optional().nullable(),
  verified: z.boolean().optional()
}).strict();

export const ExternalAccountCreateManyUserInputSchema: z.ZodType<Prisma.ExternalAccountCreateManyUserInput> = z.object({
  id: z.string().cuid().optional(),
  provider: z.string({required_error: "Provider is required" }),
  externalId: z.string()
}).strict();

export const ListingCreateManyOwnerInputSchema: z.ZodType<Prisma.ListingCreateManyOwnerInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  title: z.string({required_error: "Title is required" }),
  slug: z.string({required_error: "Slug is required" }).optional(),
  description: z.string({required_error: "Description is required" }),
  propertyType: z.string({required_error: "Property type is required" }),
  address: z.string({required_error: "Address is required" }),
  latitude: z.number({ invalid_type_error: "Latitude must be a number" }).gt(-90, { message: "Latitude must be greater than -90" }).lt(90, { message: "Latitude must be less than 90" }).optional().nullable(),
  longitude: z.number({ invalid_type_error: "Longitude must be a number" }).gt(-180, { message: "Longitude must be greater than -180" }).lt(180, { message: "Longitude must be less than 180" }).optional().nullable(),
  timeZone: z.string({ invalid_type_error: "Time zone is required" }).optional(),
  checkInTime: z.string({ invalid_type_error: "Check-in time is required" }).optional(),
  checkOutTime: z.string({ invalid_type_error: "Check-out time is required" }).optional(),
  amenities: z.union([ z.lazy(() => ListingCreateamenitiesInputSchema),z.string().array() ]).optional(),
  pricePerNight: z.number().gt(0, { message: "Price per night must be greater than 0" }),
  currency: z.lazy(() => CurrencySchema).optional(),
  minimumStay: z.number().gt(0, { message: "Minimum stay must be greater than 0" }).optional(),
  maximumGuests: z.number().gt(0, { message: "Maximum guests must be greater than 0" }).optional(),
  houseRules: z.string({ invalid_type_error: "House rules are required" }),
  allowPets: z.boolean().optional(),
  petPolicy: z.string({ invalid_type_error: "Pet policy is required" }).optional(),
  published: z.boolean().optional(),
  showExactLocation: z.boolean().optional(),
  locationRadius: z.number().optional()
}).strict();

export const UserRoleCreateManyUserInputSchema: z.ZodType<Prisma.UserRoleCreateManyUserInput> = z.object({
  id: z.number().int().optional(),
  role: z.lazy(() => RoleSchema)
}).strict();

export const UserPermissionCreateManyUserInputSchema: z.ZodType<Prisma.UserPermissionCreateManyUserInput> = z.object({
  id: z.number().int().optional(),
  permission: z.lazy(() => PermissionSchema)
}).strict();

export const BookingCreateManyUserInputSchema: z.ZodType<Prisma.BookingCreateManyUserInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  checkIn: z.coerce.date({ invalid_type_error: "Check-in date is required" }),
  checkOut: z.coerce.date({ invalid_type_error: "Check-out date is required" }),
  totalPrice: z.number().positive({ message: "Total price must be greater than 0" }),
  status: z.lazy(() => BookingStatusSchema).optional(),
  bookingRequestId: z.string().optional().nullable()
}).strict();

export const BookingRequestCreateManyUserInputSchema: z.ZodType<Prisma.BookingRequestCreateManyUserInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  message: z.string({ invalid_type_error: "Message is required" }),
  checkIn: z.coerce.date({ invalid_type_error: "Check-in date is required" }),
  checkOut: z.coerce.date({ invalid_type_error: "Check-out date is required" }),
  guests: z.number().int().min(1, { message: "At least 1 guest is required" }),
  pets: z.boolean().optional(),
  totalPrice: z.number().positive({ message: "Total price must be greater than 0" }).optional(),
  status: z.lazy(() => BookingRequestStatusSchema).optional(),
  alterationOf: z.string().optional().nullable(),
  listingId: z.string()
}).strict();

export const SessionCreateManyUserInputSchema: z.ZodType<Prisma.SessionCreateManyUserInput> = z.object({
  id: z.string().cuid().optional(),
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date().optional(),
  lastActive: z.coerce.date().optional()
}).strict();

export const PasswordResetCreateManyUserInputSchema: z.ZodType<Prisma.PasswordResetCreateManyUserInput> = z.object({
  id: z.string().cuid().optional(),
  token: z.string(),
  expiresAt: z.coerce.date(),
  used: z.boolean().optional()
}).strict();

export const EmailAddressUpdateWithoutUserInputSchema: z.ZodType<Prisma.EmailAddressUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emailAddress: z.union([ z.string({required_error: "Email address is required" }).email({ message: "Must be a valid email address" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isPrimary: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  verification: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  verified: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const EmailAddressUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.EmailAddressUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emailAddress: z.union([ z.string({required_error: "Email address is required" }).email({ message: "Must be a valid email address" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isPrimary: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  verification: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  verified: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const EmailAddressUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.EmailAddressUncheckedUpdateManyWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emailAddress: z.union([ z.string({required_error: "Email address is required" }).email({ message: "Must be a valid email address" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isPrimary: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  verification: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  verified: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ExternalAccountUpdateWithoutUserInputSchema: z.ZodType<Prisma.ExternalAccountUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  provider: z.union([ z.string({required_error: "Provider is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  externalId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ExternalAccountUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.ExternalAccountUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  provider: z.union([ z.string({required_error: "Provider is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  externalId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ExternalAccountUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.ExternalAccountUncheckedUpdateManyWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  provider: z.union([ z.string({required_error: "Provider is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  externalId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ListingUpdateWithoutOwnerInputSchema: z.ZodType<Prisma.ListingUpdateWithoutOwnerInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string({required_error: "Title is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string({required_error: "Slug is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string({required_error: "Description is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  propertyType: z.union([ z.string({required_error: "Property type is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string({required_error: "Address is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latitude: z.union([ z.number({ invalid_type_error: "Latitude must be a number" }).gt(-90, { message: "Latitude must be greater than -90" }).lt(90, { message: "Latitude must be less than 90" }),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  longitude: z.union([ z.number({ invalid_type_error: "Longitude must be a number" }).gt(-180, { message: "Longitude must be greater than -180" }).lt(180, { message: "Longitude must be less than 180" }),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  timeZone: z.union([ z.string({ invalid_type_error: "Time zone is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkInTime: z.union([ z.string({ invalid_type_error: "Check-in time is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkOutTime: z.union([ z.string({ invalid_type_error: "Check-out time is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  amenities: z.union([ z.lazy(() => ListingUpdateamenitiesInputSchema),z.string().array() ]).optional(),
  pricePerNight: z.union([ z.number().gt(0, { message: "Price per night must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  currency: z.union([ z.lazy(() => CurrencySchema),z.lazy(() => EnumCurrencyFieldUpdateOperationsInputSchema) ]).optional(),
  minimumStay: z.union([ z.number().gt(0, { message: "Minimum stay must be greater than 0" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  maximumGuests: z.union([ z.number().gt(0, { message: "Maximum guests must be greater than 0" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  houseRules: z.union([ z.string({ invalid_type_error: "House rules are required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  allowPets: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  petPolicy: z.union([ z.string({ invalid_type_error: "Pet policy is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  published: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  showExactLocation: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  locationRadius: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  images: z.lazy(() => UploadedPhotoUpdateManyWithoutListingNestedInputSchema).optional(),
  inventory: z.lazy(() => ListingInventoryUpdateManyWithoutListingNestedInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestUpdateManyWithoutListingNestedInputSchema).optional()
}).strict();

export const ListingUncheckedUpdateWithoutOwnerInputSchema: z.ZodType<Prisma.ListingUncheckedUpdateWithoutOwnerInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string({required_error: "Title is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string({required_error: "Slug is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string({required_error: "Description is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  propertyType: z.union([ z.string({required_error: "Property type is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string({required_error: "Address is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latitude: z.union([ z.number({ invalid_type_error: "Latitude must be a number" }).gt(-90, { message: "Latitude must be greater than -90" }).lt(90, { message: "Latitude must be less than 90" }),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  longitude: z.union([ z.number({ invalid_type_error: "Longitude must be a number" }).gt(-180, { message: "Longitude must be greater than -180" }).lt(180, { message: "Longitude must be less than 180" }),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  timeZone: z.union([ z.string({ invalid_type_error: "Time zone is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkInTime: z.union([ z.string({ invalid_type_error: "Check-in time is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkOutTime: z.union([ z.string({ invalid_type_error: "Check-out time is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  amenities: z.union([ z.lazy(() => ListingUpdateamenitiesInputSchema),z.string().array() ]).optional(),
  pricePerNight: z.union([ z.number().gt(0, { message: "Price per night must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  currency: z.union([ z.lazy(() => CurrencySchema),z.lazy(() => EnumCurrencyFieldUpdateOperationsInputSchema) ]).optional(),
  minimumStay: z.union([ z.number().gt(0, { message: "Minimum stay must be greater than 0" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  maximumGuests: z.union([ z.number().gt(0, { message: "Maximum guests must be greater than 0" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  houseRules: z.union([ z.string({ invalid_type_error: "House rules are required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  allowPets: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  petPolicy: z.union([ z.string({ invalid_type_error: "Pet policy is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  published: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  showExactLocation: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  locationRadius: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  images: z.lazy(() => UploadedPhotoUncheckedUpdateManyWithoutListingNestedInputSchema).optional(),
  inventory: z.lazy(() => ListingInventoryUncheckedUpdateManyWithoutListingNestedInputSchema).optional(),
  BookingRequest: z.lazy(() => BookingRequestUncheckedUpdateManyWithoutListingNestedInputSchema).optional()
}).strict();

export const ListingUncheckedUpdateManyWithoutOwnerInputSchema: z.ZodType<Prisma.ListingUncheckedUpdateManyWithoutOwnerInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string({required_error: "Title is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string({required_error: "Slug is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string({required_error: "Description is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  propertyType: z.union([ z.string({required_error: "Property type is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string({required_error: "Address is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latitude: z.union([ z.number({ invalid_type_error: "Latitude must be a number" }).gt(-90, { message: "Latitude must be greater than -90" }).lt(90, { message: "Latitude must be less than 90" }),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  longitude: z.union([ z.number({ invalid_type_error: "Longitude must be a number" }).gt(-180, { message: "Longitude must be greater than -180" }).lt(180, { message: "Longitude must be less than 180" }),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  timeZone: z.union([ z.string({ invalid_type_error: "Time zone is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkInTime: z.union([ z.string({ invalid_type_error: "Check-in time is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkOutTime: z.union([ z.string({ invalid_type_error: "Check-out time is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  amenities: z.union([ z.lazy(() => ListingUpdateamenitiesInputSchema),z.string().array() ]).optional(),
  pricePerNight: z.union([ z.number().gt(0, { message: "Price per night must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  currency: z.union([ z.lazy(() => CurrencySchema),z.lazy(() => EnumCurrencyFieldUpdateOperationsInputSchema) ]).optional(),
  minimumStay: z.union([ z.number().gt(0, { message: "Minimum stay must be greater than 0" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  maximumGuests: z.union([ z.number().gt(0, { message: "Maximum guests must be greater than 0" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  houseRules: z.union([ z.string({ invalid_type_error: "House rules are required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  allowPets: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  petPolicy: z.union([ z.string({ invalid_type_error: "Pet policy is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  published: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  showExactLocation: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  locationRadius: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserRoleUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserRoleUpdateWithoutUserInput> = z.object({
  role: z.union([ z.lazy(() => RoleSchema),z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserRoleUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserRoleUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => RoleSchema),z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserRoleUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.UserRoleUncheckedUpdateManyWithoutUserInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => RoleSchema),z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserPermissionUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserPermissionUpdateWithoutUserInput> = z.object({
  permission: z.union([ z.lazy(() => PermissionSchema),z.lazy(() => EnumPermissionFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserPermissionUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserPermissionUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  permission: z.union([ z.lazy(() => PermissionSchema),z.lazy(() => EnumPermissionFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserPermissionUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.UserPermissionUncheckedUpdateManyWithoutUserInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  permission: z.union([ z.lazy(() => PermissionSchema),z.lazy(() => EnumPermissionFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const BookingUpdateWithoutUserInputSchema: z.ZodType<Prisma.BookingUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkIn: z.union([ z.coerce.date({ invalid_type_error: "Check-in date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkOut: z.union([ z.coerce.date({ invalid_type_error: "Check-out date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  totalPrice: z.union([ z.number().positive({ message: "Total price must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => BookingStatusSchema),z.lazy(() => EnumBookingStatusFieldUpdateOperationsInputSchema) ]).optional(),
  bookingRequest: z.lazy(() => BookingRequestUpdateOneWithoutBookingNestedInputSchema).optional(),
  listingInventory: z.lazy(() => ListingInventoryUpdateManyWithoutBookingNestedInputSchema).optional()
}).strict();

export const BookingUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.BookingUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkIn: z.union([ z.coerce.date({ invalid_type_error: "Check-in date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkOut: z.union([ z.coerce.date({ invalid_type_error: "Check-out date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  totalPrice: z.union([ z.number().positive({ message: "Total price must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => BookingStatusSchema),z.lazy(() => EnumBookingStatusFieldUpdateOperationsInputSchema) ]).optional(),
  bookingRequestId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  listingInventory: z.lazy(() => ListingInventoryUncheckedUpdateManyWithoutBookingNestedInputSchema).optional()
}).strict();

export const BookingUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.BookingUncheckedUpdateManyWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkIn: z.union([ z.coerce.date({ invalid_type_error: "Check-in date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkOut: z.union([ z.coerce.date({ invalid_type_error: "Check-out date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  totalPrice: z.union([ z.number().positive({ message: "Total price must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => BookingStatusSchema),z.lazy(() => EnumBookingStatusFieldUpdateOperationsInputSchema) ]).optional(),
  bookingRequestId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const BookingRequestUpdateWithoutUserInputSchema: z.ZodType<Prisma.BookingRequestUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string({ invalid_type_error: "Message is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkIn: z.union([ z.coerce.date({ invalid_type_error: "Check-in date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkOut: z.union([ z.coerce.date({ invalid_type_error: "Check-out date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  guests: z.union([ z.number().int().min(1, { message: "At least 1 guest is required" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  pets: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  totalPrice: z.union([ z.number().positive({ message: "Total price must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => BookingRequestStatusSchema),z.lazy(() => EnumBookingRequestStatusFieldUpdateOperationsInputSchema) ]).optional(),
  listing: z.lazy(() => ListingUpdateOneRequiredWithoutBookingRequestNestedInputSchema).optional(),
  Booking: z.lazy(() => BookingUpdateManyWithoutBookingRequestNestedInputSchema).optional(),
  originalRequest: z.lazy(() => BookingRequestUpdateOneWithoutAlterationsNestedInputSchema).optional(),
  alterations: z.lazy(() => BookingRequestUpdateManyWithoutOriginalRequestNestedInputSchema).optional()
}).strict();

export const BookingRequestUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.BookingRequestUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string({ invalid_type_error: "Message is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkIn: z.union([ z.coerce.date({ invalid_type_error: "Check-in date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkOut: z.union([ z.coerce.date({ invalid_type_error: "Check-out date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  guests: z.union([ z.number().int().min(1, { message: "At least 1 guest is required" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  pets: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  totalPrice: z.union([ z.number().positive({ message: "Total price must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => BookingRequestStatusSchema),z.lazy(() => EnumBookingRequestStatusFieldUpdateOperationsInputSchema) ]).optional(),
  alterationOf: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  listingId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  Booking: z.lazy(() => BookingUncheckedUpdateManyWithoutBookingRequestNestedInputSchema).optional(),
  alterations: z.lazy(() => BookingRequestUncheckedUpdateManyWithoutOriginalRequestNestedInputSchema).optional()
}).strict();

export const BookingRequestUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.BookingRequestUncheckedUpdateManyWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string({ invalid_type_error: "Message is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkIn: z.union([ z.coerce.date({ invalid_type_error: "Check-in date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkOut: z.union([ z.coerce.date({ invalid_type_error: "Check-out date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  guests: z.union([ z.number().int().min(1, { message: "At least 1 guest is required" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  pets: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  totalPrice: z.union([ z.number().positive({ message: "Total price must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => BookingRequestStatusSchema),z.lazy(() => EnumBookingRequestStatusFieldUpdateOperationsInputSchema) ]).optional(),
  alterationOf: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  listingId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SessionUpdateWithoutUserInputSchema: z.ZodType<Prisma.SessionUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  lastActive: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SessionUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.SessionUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  lastActive: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SessionUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.SessionUncheckedUpdateManyWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  lastActive: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const PasswordResetUpdateWithoutUserInputSchema: z.ZodType<Prisma.PasswordResetUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  used: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const PasswordResetUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.PasswordResetUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  used: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const PasswordResetUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.PasswordResetUncheckedUpdateManyWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  used: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UploadedPhotoCreateManyListingInputSchema: z.ZodType<Prisma.UploadedPhotoCreateManyListingInput> = z.object({
  id: z.string().cuid().optional(),
  url: z.string({required_error: "URL is required" }),
  key: z.string(),
  name: z.string()
}).strict();

export const ListingInventoryCreateManyListingInputSchema: z.ZodType<Prisma.ListingInventoryCreateManyListingInput> = z.object({
  id: z.number().int().optional(),
  date: z.coerce.date({ invalid_type_error: "Date is required" }),
  isAvailable: z.boolean().optional(),
  price: z.number().gt(0, { message: "Price must be greater than 0" }),
  bookingId: z.string().optional().nullable()
}).strict();

export const BookingRequestCreateManyListingInputSchema: z.ZodType<Prisma.BookingRequestCreateManyListingInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  message: z.string({ invalid_type_error: "Message is required" }),
  checkIn: z.coerce.date({ invalid_type_error: "Check-in date is required" }),
  checkOut: z.coerce.date({ invalid_type_error: "Check-out date is required" }),
  guests: z.number().int().min(1, { message: "At least 1 guest is required" }),
  pets: z.boolean().optional(),
  totalPrice: z.number().positive({ message: "Total price must be greater than 0" }).optional(),
  status: z.lazy(() => BookingRequestStatusSchema).optional(),
  alterationOf: z.string().optional().nullable(),
  userId: z.string()
}).strict();

export const UploadedPhotoUpdateWithoutListingInputSchema: z.ZodType<Prisma.UploadedPhotoUpdateWithoutListingInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  url: z.union([ z.string({required_error: "URL is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  key: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UploadedPhotoUncheckedUpdateWithoutListingInputSchema: z.ZodType<Prisma.UploadedPhotoUncheckedUpdateWithoutListingInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  url: z.union([ z.string({required_error: "URL is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  key: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UploadedPhotoUncheckedUpdateManyWithoutListingInputSchema: z.ZodType<Prisma.UploadedPhotoUncheckedUpdateManyWithoutListingInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  url: z.union([ z.string({required_error: "URL is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  key: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ListingInventoryUpdateWithoutListingInputSchema: z.ZodType<Prisma.ListingInventoryUpdateWithoutListingInput> = z.object({
  date: z.union([ z.coerce.date({ invalid_type_error: "Date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isAvailable: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.number().gt(0, { message: "Price must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  booking: z.lazy(() => BookingUpdateOneWithoutListingInventoryNestedInputSchema).optional()
}).strict();

export const ListingInventoryUncheckedUpdateWithoutListingInputSchema: z.ZodType<Prisma.ListingInventoryUncheckedUpdateWithoutListingInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  date: z.union([ z.coerce.date({ invalid_type_error: "Date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isAvailable: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.number().gt(0, { message: "Price must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  bookingId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const ListingInventoryUncheckedUpdateManyWithoutListingInputSchema: z.ZodType<Prisma.ListingInventoryUncheckedUpdateManyWithoutListingInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  date: z.union([ z.coerce.date({ invalid_type_error: "Date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isAvailable: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.number().gt(0, { message: "Price must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  bookingId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const BookingRequestUpdateWithoutListingInputSchema: z.ZodType<Prisma.BookingRequestUpdateWithoutListingInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string({ invalid_type_error: "Message is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkIn: z.union([ z.coerce.date({ invalid_type_error: "Check-in date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkOut: z.union([ z.coerce.date({ invalid_type_error: "Check-out date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  guests: z.union([ z.number().int().min(1, { message: "At least 1 guest is required" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  pets: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  totalPrice: z.union([ z.number().positive({ message: "Total price must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => BookingRequestStatusSchema),z.lazy(() => EnumBookingRequestStatusFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutBookingRequestNestedInputSchema).optional(),
  Booking: z.lazy(() => BookingUpdateManyWithoutBookingRequestNestedInputSchema).optional(),
  originalRequest: z.lazy(() => BookingRequestUpdateOneWithoutAlterationsNestedInputSchema).optional(),
  alterations: z.lazy(() => BookingRequestUpdateManyWithoutOriginalRequestNestedInputSchema).optional()
}).strict();

export const BookingRequestUncheckedUpdateWithoutListingInputSchema: z.ZodType<Prisma.BookingRequestUncheckedUpdateWithoutListingInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string({ invalid_type_error: "Message is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkIn: z.union([ z.coerce.date({ invalid_type_error: "Check-in date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkOut: z.union([ z.coerce.date({ invalid_type_error: "Check-out date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  guests: z.union([ z.number().int().min(1, { message: "At least 1 guest is required" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  pets: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  totalPrice: z.union([ z.number().positive({ message: "Total price must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => BookingRequestStatusSchema),z.lazy(() => EnumBookingRequestStatusFieldUpdateOperationsInputSchema) ]).optional(),
  alterationOf: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  Booking: z.lazy(() => BookingUncheckedUpdateManyWithoutBookingRequestNestedInputSchema).optional(),
  alterations: z.lazy(() => BookingRequestUncheckedUpdateManyWithoutOriginalRequestNestedInputSchema).optional()
}).strict();

export const BookingRequestUncheckedUpdateManyWithoutListingInputSchema: z.ZodType<Prisma.BookingRequestUncheckedUpdateManyWithoutListingInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string({ invalid_type_error: "Message is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkIn: z.union([ z.coerce.date({ invalid_type_error: "Check-in date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkOut: z.union([ z.coerce.date({ invalid_type_error: "Check-out date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  guests: z.union([ z.number().int().min(1, { message: "At least 1 guest is required" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  pets: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  totalPrice: z.union([ z.number().positive({ message: "Total price must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => BookingRequestStatusSchema),z.lazy(() => EnumBookingRequestStatusFieldUpdateOperationsInputSchema) ]).optional(),
  alterationOf: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ListingInventoryCreateManyBookingInputSchema: z.ZodType<Prisma.ListingInventoryCreateManyBookingInput> = z.object({
  id: z.number().int().optional(),
  date: z.coerce.date({ invalid_type_error: "Date is required" }),
  isAvailable: z.boolean().optional(),
  price: z.number().gt(0, { message: "Price must be greater than 0" }),
  listingId: z.string()
}).strict();

export const ListingInventoryUpdateWithoutBookingInputSchema: z.ZodType<Prisma.ListingInventoryUpdateWithoutBookingInput> = z.object({
  date: z.union([ z.coerce.date({ invalid_type_error: "Date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isAvailable: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.number().gt(0, { message: "Price must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  listing: z.lazy(() => ListingUpdateOneRequiredWithoutInventoryNestedInputSchema).optional()
}).strict();

export const ListingInventoryUncheckedUpdateWithoutBookingInputSchema: z.ZodType<Prisma.ListingInventoryUncheckedUpdateWithoutBookingInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  date: z.union([ z.coerce.date({ invalid_type_error: "Date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isAvailable: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.number().gt(0, { message: "Price must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  listingId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ListingInventoryUncheckedUpdateManyWithoutBookingInputSchema: z.ZodType<Prisma.ListingInventoryUncheckedUpdateManyWithoutBookingInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  date: z.union([ z.coerce.date({ invalid_type_error: "Date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isAvailable: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.number().gt(0, { message: "Price must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  listingId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const BookingCreateManyBookingRequestInputSchema: z.ZodType<Prisma.BookingCreateManyBookingRequestInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  checkIn: z.coerce.date({ invalid_type_error: "Check-in date is required" }),
  checkOut: z.coerce.date({ invalid_type_error: "Check-out date is required" }),
  totalPrice: z.number().positive({ message: "Total price must be greater than 0" }),
  status: z.lazy(() => BookingStatusSchema).optional(),
  userId: z.string({ invalid_type_error: "User ID is required" })
}).strict();

export const BookingRequestCreateManyOriginalRequestInputSchema: z.ZodType<Prisma.BookingRequestCreateManyOriginalRequestInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  message: z.string({ invalid_type_error: "Message is required" }),
  checkIn: z.coerce.date({ invalid_type_error: "Check-in date is required" }),
  checkOut: z.coerce.date({ invalid_type_error: "Check-out date is required" }),
  guests: z.number().int().min(1, { message: "At least 1 guest is required" }),
  pets: z.boolean().optional(),
  totalPrice: z.number().positive({ message: "Total price must be greater than 0" }).optional(),
  status: z.lazy(() => BookingRequestStatusSchema).optional(),
  userId: z.string(),
  listingId: z.string()
}).strict();

export const BookingUpdateWithoutBookingRequestInputSchema: z.ZodType<Prisma.BookingUpdateWithoutBookingRequestInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkIn: z.union([ z.coerce.date({ invalid_type_error: "Check-in date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkOut: z.union([ z.coerce.date({ invalid_type_error: "Check-out date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  totalPrice: z.union([ z.number().positive({ message: "Total price must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => BookingStatusSchema),z.lazy(() => EnumBookingStatusFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutBookingsNestedInputSchema).optional(),
  listingInventory: z.lazy(() => ListingInventoryUpdateManyWithoutBookingNestedInputSchema).optional()
}).strict();

export const BookingUncheckedUpdateWithoutBookingRequestInputSchema: z.ZodType<Prisma.BookingUncheckedUpdateWithoutBookingRequestInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkIn: z.union([ z.coerce.date({ invalid_type_error: "Check-in date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkOut: z.union([ z.coerce.date({ invalid_type_error: "Check-out date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  totalPrice: z.union([ z.number().positive({ message: "Total price must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => BookingStatusSchema),z.lazy(() => EnumBookingStatusFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string({ invalid_type_error: "User ID is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  listingInventory: z.lazy(() => ListingInventoryUncheckedUpdateManyWithoutBookingNestedInputSchema).optional()
}).strict();

export const BookingUncheckedUpdateManyWithoutBookingRequestInputSchema: z.ZodType<Prisma.BookingUncheckedUpdateManyWithoutBookingRequestInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkIn: z.union([ z.coerce.date({ invalid_type_error: "Check-in date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkOut: z.union([ z.coerce.date({ invalid_type_error: "Check-out date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  totalPrice: z.union([ z.number().positive({ message: "Total price must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => BookingStatusSchema),z.lazy(() => EnumBookingStatusFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string({ invalid_type_error: "User ID is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const BookingRequestUpdateWithoutOriginalRequestInputSchema: z.ZodType<Prisma.BookingRequestUpdateWithoutOriginalRequestInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string({ invalid_type_error: "Message is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkIn: z.union([ z.coerce.date({ invalid_type_error: "Check-in date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkOut: z.union([ z.coerce.date({ invalid_type_error: "Check-out date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  guests: z.union([ z.number().int().min(1, { message: "At least 1 guest is required" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  pets: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  totalPrice: z.union([ z.number().positive({ message: "Total price must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => BookingRequestStatusSchema),z.lazy(() => EnumBookingRequestStatusFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutBookingRequestNestedInputSchema).optional(),
  listing: z.lazy(() => ListingUpdateOneRequiredWithoutBookingRequestNestedInputSchema).optional(),
  Booking: z.lazy(() => BookingUpdateManyWithoutBookingRequestNestedInputSchema).optional(),
  alterations: z.lazy(() => BookingRequestUpdateManyWithoutOriginalRequestNestedInputSchema).optional()
}).strict();

export const BookingRequestUncheckedUpdateWithoutOriginalRequestInputSchema: z.ZodType<Prisma.BookingRequestUncheckedUpdateWithoutOriginalRequestInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string({ invalid_type_error: "Message is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkIn: z.union([ z.coerce.date({ invalid_type_error: "Check-in date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkOut: z.union([ z.coerce.date({ invalid_type_error: "Check-out date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  guests: z.union([ z.number().int().min(1, { message: "At least 1 guest is required" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  pets: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  totalPrice: z.union([ z.number().positive({ message: "Total price must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => BookingRequestStatusSchema),z.lazy(() => EnumBookingRequestStatusFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  listingId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  Booking: z.lazy(() => BookingUncheckedUpdateManyWithoutBookingRequestNestedInputSchema).optional(),
  alterations: z.lazy(() => BookingRequestUncheckedUpdateManyWithoutOriginalRequestNestedInputSchema).optional()
}).strict();

export const BookingRequestUncheckedUpdateManyWithoutOriginalRequestInputSchema: z.ZodType<Prisma.BookingRequestUncheckedUpdateManyWithoutOriginalRequestInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string({ invalid_type_error: "Message is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  checkIn: z.union([ z.coerce.date({ invalid_type_error: "Check-in date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkOut: z.union([ z.coerce.date({ invalid_type_error: "Check-out date is required" }),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  guests: z.union([ z.number().int().min(1, { message: "At least 1 guest is required" }),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  pets: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  totalPrice: z.union([ z.number().positive({ message: "Total price must be greater than 0" }),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => BookingRequestStatusSchema),z.lazy(() => EnumBookingRequestStatusFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  listingId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

/////////////////////////////////////////
// ARGS
/////////////////////////////////////////

export const UserRoleFindFirstArgsSchema: z.ZodType<Prisma.UserRoleFindFirstArgs> = z.object({
  select: UserRoleSelectSchema.optional(),
  include: UserRoleIncludeSchema.optional(),
  where: UserRoleWhereInputSchema.optional(),
  orderBy: z.union([ UserRoleOrderByWithRelationInputSchema.array(),UserRoleOrderByWithRelationInputSchema ]).optional(),
  cursor: UserRoleWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserRoleScalarFieldEnumSchema,UserRoleScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserRoleFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UserRoleFindFirstOrThrowArgs> = z.object({
  select: UserRoleSelectSchema.optional(),
  include: UserRoleIncludeSchema.optional(),
  where: UserRoleWhereInputSchema.optional(),
  orderBy: z.union([ UserRoleOrderByWithRelationInputSchema.array(),UserRoleOrderByWithRelationInputSchema ]).optional(),
  cursor: UserRoleWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserRoleScalarFieldEnumSchema,UserRoleScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserRoleFindManyArgsSchema: z.ZodType<Prisma.UserRoleFindManyArgs> = z.object({
  select: UserRoleSelectSchema.optional(),
  include: UserRoleIncludeSchema.optional(),
  where: UserRoleWhereInputSchema.optional(),
  orderBy: z.union([ UserRoleOrderByWithRelationInputSchema.array(),UserRoleOrderByWithRelationInputSchema ]).optional(),
  cursor: UserRoleWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserRoleScalarFieldEnumSchema,UserRoleScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserRoleAggregateArgsSchema: z.ZodType<Prisma.UserRoleAggregateArgs> = z.object({
  where: UserRoleWhereInputSchema.optional(),
  orderBy: z.union([ UserRoleOrderByWithRelationInputSchema.array(),UserRoleOrderByWithRelationInputSchema ]).optional(),
  cursor: UserRoleWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserRoleGroupByArgsSchema: z.ZodType<Prisma.UserRoleGroupByArgs> = z.object({
  where: UserRoleWhereInputSchema.optional(),
  orderBy: z.union([ UserRoleOrderByWithAggregationInputSchema.array(),UserRoleOrderByWithAggregationInputSchema ]).optional(),
  by: UserRoleScalarFieldEnumSchema.array(),
  having: UserRoleScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserRoleFindUniqueArgsSchema: z.ZodType<Prisma.UserRoleFindUniqueArgs> = z.object({
  select: UserRoleSelectSchema.optional(),
  include: UserRoleIncludeSchema.optional(),
  where: UserRoleWhereUniqueInputSchema,
}).strict() ;

export const UserRoleFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UserRoleFindUniqueOrThrowArgs> = z.object({
  select: UserRoleSelectSchema.optional(),
  include: UserRoleIncludeSchema.optional(),
  where: UserRoleWhereUniqueInputSchema,
}).strict() ;

export const UserPermissionFindFirstArgsSchema: z.ZodType<Prisma.UserPermissionFindFirstArgs> = z.object({
  select: UserPermissionSelectSchema.optional(),
  include: UserPermissionIncludeSchema.optional(),
  where: UserPermissionWhereInputSchema.optional(),
  orderBy: z.union([ UserPermissionOrderByWithRelationInputSchema.array(),UserPermissionOrderByWithRelationInputSchema ]).optional(),
  cursor: UserPermissionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserPermissionScalarFieldEnumSchema,UserPermissionScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserPermissionFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UserPermissionFindFirstOrThrowArgs> = z.object({
  select: UserPermissionSelectSchema.optional(),
  include: UserPermissionIncludeSchema.optional(),
  where: UserPermissionWhereInputSchema.optional(),
  orderBy: z.union([ UserPermissionOrderByWithRelationInputSchema.array(),UserPermissionOrderByWithRelationInputSchema ]).optional(),
  cursor: UserPermissionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserPermissionScalarFieldEnumSchema,UserPermissionScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserPermissionFindManyArgsSchema: z.ZodType<Prisma.UserPermissionFindManyArgs> = z.object({
  select: UserPermissionSelectSchema.optional(),
  include: UserPermissionIncludeSchema.optional(),
  where: UserPermissionWhereInputSchema.optional(),
  orderBy: z.union([ UserPermissionOrderByWithRelationInputSchema.array(),UserPermissionOrderByWithRelationInputSchema ]).optional(),
  cursor: UserPermissionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserPermissionScalarFieldEnumSchema,UserPermissionScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserPermissionAggregateArgsSchema: z.ZodType<Prisma.UserPermissionAggregateArgs> = z.object({
  where: UserPermissionWhereInputSchema.optional(),
  orderBy: z.union([ UserPermissionOrderByWithRelationInputSchema.array(),UserPermissionOrderByWithRelationInputSchema ]).optional(),
  cursor: UserPermissionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserPermissionGroupByArgsSchema: z.ZodType<Prisma.UserPermissionGroupByArgs> = z.object({
  where: UserPermissionWhereInputSchema.optional(),
  orderBy: z.union([ UserPermissionOrderByWithAggregationInputSchema.array(),UserPermissionOrderByWithAggregationInputSchema ]).optional(),
  by: UserPermissionScalarFieldEnumSchema.array(),
  having: UserPermissionScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserPermissionFindUniqueArgsSchema: z.ZodType<Prisma.UserPermissionFindUniqueArgs> = z.object({
  select: UserPermissionSelectSchema.optional(),
  include: UserPermissionIncludeSchema.optional(),
  where: UserPermissionWhereUniqueInputSchema,
}).strict() ;

export const UserPermissionFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UserPermissionFindUniqueOrThrowArgs> = z.object({
  select: UserPermissionSelectSchema.optional(),
  include: UserPermissionIncludeSchema.optional(),
  where: UserPermissionWhereUniqueInputSchema,
}).strict() ;

export const UserFindFirstArgsSchema: z.ZodType<Prisma.UserFindFirstArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema,UserScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UserFindFirstOrThrowArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema,UserScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserFindManyArgsSchema: z.ZodType<Prisma.UserFindManyArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema,UserScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserAggregateArgsSchema: z.ZodType<Prisma.UserAggregateArgs> = z.object({
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserGroupByArgsSchema: z.ZodType<Prisma.UserGroupByArgs> = z.object({
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithAggregationInputSchema.array(),UserOrderByWithAggregationInputSchema ]).optional(),
  by: UserScalarFieldEnumSchema.array(),
  having: UserScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserFindUniqueArgsSchema: z.ZodType<Prisma.UserFindUniqueArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema,
}).strict() ;

export const UserFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UserFindUniqueOrThrowArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema,
}).strict() ;

export const EmailAddressFindFirstArgsSchema: z.ZodType<Prisma.EmailAddressFindFirstArgs> = z.object({
  select: EmailAddressSelectSchema.optional(),
  include: EmailAddressIncludeSchema.optional(),
  where: EmailAddressWhereInputSchema.optional(),
  orderBy: z.union([ EmailAddressOrderByWithRelationInputSchema.array(),EmailAddressOrderByWithRelationInputSchema ]).optional(),
  cursor: EmailAddressWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ EmailAddressScalarFieldEnumSchema,EmailAddressScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const EmailAddressFindFirstOrThrowArgsSchema: z.ZodType<Prisma.EmailAddressFindFirstOrThrowArgs> = z.object({
  select: EmailAddressSelectSchema.optional(),
  include: EmailAddressIncludeSchema.optional(),
  where: EmailAddressWhereInputSchema.optional(),
  orderBy: z.union([ EmailAddressOrderByWithRelationInputSchema.array(),EmailAddressOrderByWithRelationInputSchema ]).optional(),
  cursor: EmailAddressWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ EmailAddressScalarFieldEnumSchema,EmailAddressScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const EmailAddressFindManyArgsSchema: z.ZodType<Prisma.EmailAddressFindManyArgs> = z.object({
  select: EmailAddressSelectSchema.optional(),
  include: EmailAddressIncludeSchema.optional(),
  where: EmailAddressWhereInputSchema.optional(),
  orderBy: z.union([ EmailAddressOrderByWithRelationInputSchema.array(),EmailAddressOrderByWithRelationInputSchema ]).optional(),
  cursor: EmailAddressWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ EmailAddressScalarFieldEnumSchema,EmailAddressScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const EmailAddressAggregateArgsSchema: z.ZodType<Prisma.EmailAddressAggregateArgs> = z.object({
  where: EmailAddressWhereInputSchema.optional(),
  orderBy: z.union([ EmailAddressOrderByWithRelationInputSchema.array(),EmailAddressOrderByWithRelationInputSchema ]).optional(),
  cursor: EmailAddressWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const EmailAddressGroupByArgsSchema: z.ZodType<Prisma.EmailAddressGroupByArgs> = z.object({
  where: EmailAddressWhereInputSchema.optional(),
  orderBy: z.union([ EmailAddressOrderByWithAggregationInputSchema.array(),EmailAddressOrderByWithAggregationInputSchema ]).optional(),
  by: EmailAddressScalarFieldEnumSchema.array(),
  having: EmailAddressScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const EmailAddressFindUniqueArgsSchema: z.ZodType<Prisma.EmailAddressFindUniqueArgs> = z.object({
  select: EmailAddressSelectSchema.optional(),
  include: EmailAddressIncludeSchema.optional(),
  where: EmailAddressWhereUniqueInputSchema,
}).strict() ;

export const EmailAddressFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.EmailAddressFindUniqueOrThrowArgs> = z.object({
  select: EmailAddressSelectSchema.optional(),
  include: EmailAddressIncludeSchema.optional(),
  where: EmailAddressWhereUniqueInputSchema,
}).strict() ;

export const ExternalAccountFindFirstArgsSchema: z.ZodType<Prisma.ExternalAccountFindFirstArgs> = z.object({
  select: ExternalAccountSelectSchema.optional(),
  include: ExternalAccountIncludeSchema.optional(),
  where: ExternalAccountWhereInputSchema.optional(),
  orderBy: z.union([ ExternalAccountOrderByWithRelationInputSchema.array(),ExternalAccountOrderByWithRelationInputSchema ]).optional(),
  cursor: ExternalAccountWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ExternalAccountScalarFieldEnumSchema,ExternalAccountScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ExternalAccountFindFirstOrThrowArgsSchema: z.ZodType<Prisma.ExternalAccountFindFirstOrThrowArgs> = z.object({
  select: ExternalAccountSelectSchema.optional(),
  include: ExternalAccountIncludeSchema.optional(),
  where: ExternalAccountWhereInputSchema.optional(),
  orderBy: z.union([ ExternalAccountOrderByWithRelationInputSchema.array(),ExternalAccountOrderByWithRelationInputSchema ]).optional(),
  cursor: ExternalAccountWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ExternalAccountScalarFieldEnumSchema,ExternalAccountScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ExternalAccountFindManyArgsSchema: z.ZodType<Prisma.ExternalAccountFindManyArgs> = z.object({
  select: ExternalAccountSelectSchema.optional(),
  include: ExternalAccountIncludeSchema.optional(),
  where: ExternalAccountWhereInputSchema.optional(),
  orderBy: z.union([ ExternalAccountOrderByWithRelationInputSchema.array(),ExternalAccountOrderByWithRelationInputSchema ]).optional(),
  cursor: ExternalAccountWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ExternalAccountScalarFieldEnumSchema,ExternalAccountScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ExternalAccountAggregateArgsSchema: z.ZodType<Prisma.ExternalAccountAggregateArgs> = z.object({
  where: ExternalAccountWhereInputSchema.optional(),
  orderBy: z.union([ ExternalAccountOrderByWithRelationInputSchema.array(),ExternalAccountOrderByWithRelationInputSchema ]).optional(),
  cursor: ExternalAccountWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const ExternalAccountGroupByArgsSchema: z.ZodType<Prisma.ExternalAccountGroupByArgs> = z.object({
  where: ExternalAccountWhereInputSchema.optional(),
  orderBy: z.union([ ExternalAccountOrderByWithAggregationInputSchema.array(),ExternalAccountOrderByWithAggregationInputSchema ]).optional(),
  by: ExternalAccountScalarFieldEnumSchema.array(),
  having: ExternalAccountScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const ExternalAccountFindUniqueArgsSchema: z.ZodType<Prisma.ExternalAccountFindUniqueArgs> = z.object({
  select: ExternalAccountSelectSchema.optional(),
  include: ExternalAccountIncludeSchema.optional(),
  where: ExternalAccountWhereUniqueInputSchema,
}).strict() ;

export const ExternalAccountFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.ExternalAccountFindUniqueOrThrowArgs> = z.object({
  select: ExternalAccountSelectSchema.optional(),
  include: ExternalAccountIncludeSchema.optional(),
  where: ExternalAccountWhereUniqueInputSchema,
}).strict() ;

export const UploadedPhotoFindFirstArgsSchema: z.ZodType<Prisma.UploadedPhotoFindFirstArgs> = z.object({
  select: UploadedPhotoSelectSchema.optional(),
  include: UploadedPhotoIncludeSchema.optional(),
  where: UploadedPhotoWhereInputSchema.optional(),
  orderBy: z.union([ UploadedPhotoOrderByWithRelationInputSchema.array(),UploadedPhotoOrderByWithRelationInputSchema ]).optional(),
  cursor: UploadedPhotoWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UploadedPhotoScalarFieldEnumSchema,UploadedPhotoScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UploadedPhotoFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UploadedPhotoFindFirstOrThrowArgs> = z.object({
  select: UploadedPhotoSelectSchema.optional(),
  include: UploadedPhotoIncludeSchema.optional(),
  where: UploadedPhotoWhereInputSchema.optional(),
  orderBy: z.union([ UploadedPhotoOrderByWithRelationInputSchema.array(),UploadedPhotoOrderByWithRelationInputSchema ]).optional(),
  cursor: UploadedPhotoWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UploadedPhotoScalarFieldEnumSchema,UploadedPhotoScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UploadedPhotoFindManyArgsSchema: z.ZodType<Prisma.UploadedPhotoFindManyArgs> = z.object({
  select: UploadedPhotoSelectSchema.optional(),
  include: UploadedPhotoIncludeSchema.optional(),
  where: UploadedPhotoWhereInputSchema.optional(),
  orderBy: z.union([ UploadedPhotoOrderByWithRelationInputSchema.array(),UploadedPhotoOrderByWithRelationInputSchema ]).optional(),
  cursor: UploadedPhotoWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UploadedPhotoScalarFieldEnumSchema,UploadedPhotoScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UploadedPhotoAggregateArgsSchema: z.ZodType<Prisma.UploadedPhotoAggregateArgs> = z.object({
  where: UploadedPhotoWhereInputSchema.optional(),
  orderBy: z.union([ UploadedPhotoOrderByWithRelationInputSchema.array(),UploadedPhotoOrderByWithRelationInputSchema ]).optional(),
  cursor: UploadedPhotoWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UploadedPhotoGroupByArgsSchema: z.ZodType<Prisma.UploadedPhotoGroupByArgs> = z.object({
  where: UploadedPhotoWhereInputSchema.optional(),
  orderBy: z.union([ UploadedPhotoOrderByWithAggregationInputSchema.array(),UploadedPhotoOrderByWithAggregationInputSchema ]).optional(),
  by: UploadedPhotoScalarFieldEnumSchema.array(),
  having: UploadedPhotoScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UploadedPhotoFindUniqueArgsSchema: z.ZodType<Prisma.UploadedPhotoFindUniqueArgs> = z.object({
  select: UploadedPhotoSelectSchema.optional(),
  include: UploadedPhotoIncludeSchema.optional(),
  where: UploadedPhotoWhereUniqueInputSchema,
}).strict() ;

export const UploadedPhotoFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UploadedPhotoFindUniqueOrThrowArgs> = z.object({
  select: UploadedPhotoSelectSchema.optional(),
  include: UploadedPhotoIncludeSchema.optional(),
  where: UploadedPhotoWhereUniqueInputSchema,
}).strict() ;

export const ListingFindFirstArgsSchema: z.ZodType<Prisma.ListingFindFirstArgs> = z.object({
  select: ListingSelectSchema.optional(),
  include: ListingIncludeSchema.optional(),
  where: ListingWhereInputSchema.optional(),
  orderBy: z.union([ ListingOrderByWithRelationInputSchema.array(),ListingOrderByWithRelationInputSchema ]).optional(),
  cursor: ListingWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ListingScalarFieldEnumSchema,ListingScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ListingFindFirstOrThrowArgsSchema: z.ZodType<Prisma.ListingFindFirstOrThrowArgs> = z.object({
  select: ListingSelectSchema.optional(),
  include: ListingIncludeSchema.optional(),
  where: ListingWhereInputSchema.optional(),
  orderBy: z.union([ ListingOrderByWithRelationInputSchema.array(),ListingOrderByWithRelationInputSchema ]).optional(),
  cursor: ListingWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ListingScalarFieldEnumSchema,ListingScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ListingFindManyArgsSchema: z.ZodType<Prisma.ListingFindManyArgs> = z.object({
  select: ListingSelectSchema.optional(),
  include: ListingIncludeSchema.optional(),
  where: ListingWhereInputSchema.optional(),
  orderBy: z.union([ ListingOrderByWithRelationInputSchema.array(),ListingOrderByWithRelationInputSchema ]).optional(),
  cursor: ListingWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ListingScalarFieldEnumSchema,ListingScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ListingAggregateArgsSchema: z.ZodType<Prisma.ListingAggregateArgs> = z.object({
  where: ListingWhereInputSchema.optional(),
  orderBy: z.union([ ListingOrderByWithRelationInputSchema.array(),ListingOrderByWithRelationInputSchema ]).optional(),
  cursor: ListingWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const ListingGroupByArgsSchema: z.ZodType<Prisma.ListingGroupByArgs> = z.object({
  where: ListingWhereInputSchema.optional(),
  orderBy: z.union([ ListingOrderByWithAggregationInputSchema.array(),ListingOrderByWithAggregationInputSchema ]).optional(),
  by: ListingScalarFieldEnumSchema.array(),
  having: ListingScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const ListingFindUniqueArgsSchema: z.ZodType<Prisma.ListingFindUniqueArgs> = z.object({
  select: ListingSelectSchema.optional(),
  include: ListingIncludeSchema.optional(),
  where: ListingWhereUniqueInputSchema,
}).strict() ;

export const ListingFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.ListingFindUniqueOrThrowArgs> = z.object({
  select: ListingSelectSchema.optional(),
  include: ListingIncludeSchema.optional(),
  where: ListingWhereUniqueInputSchema,
}).strict() ;

export const ListingInventoryFindFirstArgsSchema: z.ZodType<Prisma.ListingInventoryFindFirstArgs> = z.object({
  select: ListingInventorySelectSchema.optional(),
  include: ListingInventoryIncludeSchema.optional(),
  where: ListingInventoryWhereInputSchema.optional(),
  orderBy: z.union([ ListingInventoryOrderByWithRelationInputSchema.array(),ListingInventoryOrderByWithRelationInputSchema ]).optional(),
  cursor: ListingInventoryWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ListingInventoryScalarFieldEnumSchema,ListingInventoryScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ListingInventoryFindFirstOrThrowArgsSchema: z.ZodType<Prisma.ListingInventoryFindFirstOrThrowArgs> = z.object({
  select: ListingInventorySelectSchema.optional(),
  include: ListingInventoryIncludeSchema.optional(),
  where: ListingInventoryWhereInputSchema.optional(),
  orderBy: z.union([ ListingInventoryOrderByWithRelationInputSchema.array(),ListingInventoryOrderByWithRelationInputSchema ]).optional(),
  cursor: ListingInventoryWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ListingInventoryScalarFieldEnumSchema,ListingInventoryScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ListingInventoryFindManyArgsSchema: z.ZodType<Prisma.ListingInventoryFindManyArgs> = z.object({
  select: ListingInventorySelectSchema.optional(),
  include: ListingInventoryIncludeSchema.optional(),
  where: ListingInventoryWhereInputSchema.optional(),
  orderBy: z.union([ ListingInventoryOrderByWithRelationInputSchema.array(),ListingInventoryOrderByWithRelationInputSchema ]).optional(),
  cursor: ListingInventoryWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ListingInventoryScalarFieldEnumSchema,ListingInventoryScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ListingInventoryAggregateArgsSchema: z.ZodType<Prisma.ListingInventoryAggregateArgs> = z.object({
  where: ListingInventoryWhereInputSchema.optional(),
  orderBy: z.union([ ListingInventoryOrderByWithRelationInputSchema.array(),ListingInventoryOrderByWithRelationInputSchema ]).optional(),
  cursor: ListingInventoryWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const ListingInventoryGroupByArgsSchema: z.ZodType<Prisma.ListingInventoryGroupByArgs> = z.object({
  where: ListingInventoryWhereInputSchema.optional(),
  orderBy: z.union([ ListingInventoryOrderByWithAggregationInputSchema.array(),ListingInventoryOrderByWithAggregationInputSchema ]).optional(),
  by: ListingInventoryScalarFieldEnumSchema.array(),
  having: ListingInventoryScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const ListingInventoryFindUniqueArgsSchema: z.ZodType<Prisma.ListingInventoryFindUniqueArgs> = z.object({
  select: ListingInventorySelectSchema.optional(),
  include: ListingInventoryIncludeSchema.optional(),
  where: ListingInventoryWhereUniqueInputSchema,
}).strict() ;

export const ListingInventoryFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.ListingInventoryFindUniqueOrThrowArgs> = z.object({
  select: ListingInventorySelectSchema.optional(),
  include: ListingInventoryIncludeSchema.optional(),
  where: ListingInventoryWhereUniqueInputSchema,
}).strict() ;

export const BookingFindFirstArgsSchema: z.ZodType<Prisma.BookingFindFirstArgs> = z.object({
  select: BookingSelectSchema.optional(),
  include: BookingIncludeSchema.optional(),
  where: BookingWhereInputSchema.optional(),
  orderBy: z.union([ BookingOrderByWithRelationInputSchema.array(),BookingOrderByWithRelationInputSchema ]).optional(),
  cursor: BookingWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ BookingScalarFieldEnumSchema,BookingScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const BookingFindFirstOrThrowArgsSchema: z.ZodType<Prisma.BookingFindFirstOrThrowArgs> = z.object({
  select: BookingSelectSchema.optional(),
  include: BookingIncludeSchema.optional(),
  where: BookingWhereInputSchema.optional(),
  orderBy: z.union([ BookingOrderByWithRelationInputSchema.array(),BookingOrderByWithRelationInputSchema ]).optional(),
  cursor: BookingWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ BookingScalarFieldEnumSchema,BookingScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const BookingFindManyArgsSchema: z.ZodType<Prisma.BookingFindManyArgs> = z.object({
  select: BookingSelectSchema.optional(),
  include: BookingIncludeSchema.optional(),
  where: BookingWhereInputSchema.optional(),
  orderBy: z.union([ BookingOrderByWithRelationInputSchema.array(),BookingOrderByWithRelationInputSchema ]).optional(),
  cursor: BookingWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ BookingScalarFieldEnumSchema,BookingScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const BookingAggregateArgsSchema: z.ZodType<Prisma.BookingAggregateArgs> = z.object({
  where: BookingWhereInputSchema.optional(),
  orderBy: z.union([ BookingOrderByWithRelationInputSchema.array(),BookingOrderByWithRelationInputSchema ]).optional(),
  cursor: BookingWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const BookingGroupByArgsSchema: z.ZodType<Prisma.BookingGroupByArgs> = z.object({
  where: BookingWhereInputSchema.optional(),
  orderBy: z.union([ BookingOrderByWithAggregationInputSchema.array(),BookingOrderByWithAggregationInputSchema ]).optional(),
  by: BookingScalarFieldEnumSchema.array(),
  having: BookingScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const BookingFindUniqueArgsSchema: z.ZodType<Prisma.BookingFindUniqueArgs> = z.object({
  select: BookingSelectSchema.optional(),
  include: BookingIncludeSchema.optional(),
  where: BookingWhereUniqueInputSchema,
}).strict() ;

export const BookingFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.BookingFindUniqueOrThrowArgs> = z.object({
  select: BookingSelectSchema.optional(),
  include: BookingIncludeSchema.optional(),
  where: BookingWhereUniqueInputSchema,
}).strict() ;

export const BookingRequestFindFirstArgsSchema: z.ZodType<Prisma.BookingRequestFindFirstArgs> = z.object({
  select: BookingRequestSelectSchema.optional(),
  include: BookingRequestIncludeSchema.optional(),
  where: BookingRequestWhereInputSchema.optional(),
  orderBy: z.union([ BookingRequestOrderByWithRelationInputSchema.array(),BookingRequestOrderByWithRelationInputSchema ]).optional(),
  cursor: BookingRequestWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ BookingRequestScalarFieldEnumSchema,BookingRequestScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const BookingRequestFindFirstOrThrowArgsSchema: z.ZodType<Prisma.BookingRequestFindFirstOrThrowArgs> = z.object({
  select: BookingRequestSelectSchema.optional(),
  include: BookingRequestIncludeSchema.optional(),
  where: BookingRequestWhereInputSchema.optional(),
  orderBy: z.union([ BookingRequestOrderByWithRelationInputSchema.array(),BookingRequestOrderByWithRelationInputSchema ]).optional(),
  cursor: BookingRequestWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ BookingRequestScalarFieldEnumSchema,BookingRequestScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const BookingRequestFindManyArgsSchema: z.ZodType<Prisma.BookingRequestFindManyArgs> = z.object({
  select: BookingRequestSelectSchema.optional(),
  include: BookingRequestIncludeSchema.optional(),
  where: BookingRequestWhereInputSchema.optional(),
  orderBy: z.union([ BookingRequestOrderByWithRelationInputSchema.array(),BookingRequestOrderByWithRelationInputSchema ]).optional(),
  cursor: BookingRequestWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ BookingRequestScalarFieldEnumSchema,BookingRequestScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const BookingRequestAggregateArgsSchema: z.ZodType<Prisma.BookingRequestAggregateArgs> = z.object({
  where: BookingRequestWhereInputSchema.optional(),
  orderBy: z.union([ BookingRequestOrderByWithRelationInputSchema.array(),BookingRequestOrderByWithRelationInputSchema ]).optional(),
  cursor: BookingRequestWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const BookingRequestGroupByArgsSchema: z.ZodType<Prisma.BookingRequestGroupByArgs> = z.object({
  where: BookingRequestWhereInputSchema.optional(),
  orderBy: z.union([ BookingRequestOrderByWithAggregationInputSchema.array(),BookingRequestOrderByWithAggregationInputSchema ]).optional(),
  by: BookingRequestScalarFieldEnumSchema.array(),
  having: BookingRequestScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const BookingRequestFindUniqueArgsSchema: z.ZodType<Prisma.BookingRequestFindUniqueArgs> = z.object({
  select: BookingRequestSelectSchema.optional(),
  include: BookingRequestIncludeSchema.optional(),
  where: BookingRequestWhereUniqueInputSchema,
}).strict() ;

export const BookingRequestFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.BookingRequestFindUniqueOrThrowArgs> = z.object({
  select: BookingRequestSelectSchema.optional(),
  include: BookingRequestIncludeSchema.optional(),
  where: BookingRequestWhereUniqueInputSchema,
}).strict() ;

export const SessionFindFirstArgsSchema: z.ZodType<Prisma.SessionFindFirstArgs> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  where: SessionWhereInputSchema.optional(),
  orderBy: z.union([ SessionOrderByWithRelationInputSchema.array(),SessionOrderByWithRelationInputSchema ]).optional(),
  cursor: SessionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ SessionScalarFieldEnumSchema,SessionScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const SessionFindFirstOrThrowArgsSchema: z.ZodType<Prisma.SessionFindFirstOrThrowArgs> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  where: SessionWhereInputSchema.optional(),
  orderBy: z.union([ SessionOrderByWithRelationInputSchema.array(),SessionOrderByWithRelationInputSchema ]).optional(),
  cursor: SessionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ SessionScalarFieldEnumSchema,SessionScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const SessionFindManyArgsSchema: z.ZodType<Prisma.SessionFindManyArgs> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  where: SessionWhereInputSchema.optional(),
  orderBy: z.union([ SessionOrderByWithRelationInputSchema.array(),SessionOrderByWithRelationInputSchema ]).optional(),
  cursor: SessionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ SessionScalarFieldEnumSchema,SessionScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const SessionAggregateArgsSchema: z.ZodType<Prisma.SessionAggregateArgs> = z.object({
  where: SessionWhereInputSchema.optional(),
  orderBy: z.union([ SessionOrderByWithRelationInputSchema.array(),SessionOrderByWithRelationInputSchema ]).optional(),
  cursor: SessionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const SessionGroupByArgsSchema: z.ZodType<Prisma.SessionGroupByArgs> = z.object({
  where: SessionWhereInputSchema.optional(),
  orderBy: z.union([ SessionOrderByWithAggregationInputSchema.array(),SessionOrderByWithAggregationInputSchema ]).optional(),
  by: SessionScalarFieldEnumSchema.array(),
  having: SessionScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const SessionFindUniqueArgsSchema: z.ZodType<Prisma.SessionFindUniqueArgs> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  where: SessionWhereUniqueInputSchema,
}).strict() ;

export const SessionFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.SessionFindUniqueOrThrowArgs> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  where: SessionWhereUniqueInputSchema,
}).strict() ;

export const PasswordResetFindFirstArgsSchema: z.ZodType<Prisma.PasswordResetFindFirstArgs> = z.object({
  select: PasswordResetSelectSchema.optional(),
  include: PasswordResetIncludeSchema.optional(),
  where: PasswordResetWhereInputSchema.optional(),
  orderBy: z.union([ PasswordResetOrderByWithRelationInputSchema.array(),PasswordResetOrderByWithRelationInputSchema ]).optional(),
  cursor: PasswordResetWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ PasswordResetScalarFieldEnumSchema,PasswordResetScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const PasswordResetFindFirstOrThrowArgsSchema: z.ZodType<Prisma.PasswordResetFindFirstOrThrowArgs> = z.object({
  select: PasswordResetSelectSchema.optional(),
  include: PasswordResetIncludeSchema.optional(),
  where: PasswordResetWhereInputSchema.optional(),
  orderBy: z.union([ PasswordResetOrderByWithRelationInputSchema.array(),PasswordResetOrderByWithRelationInputSchema ]).optional(),
  cursor: PasswordResetWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ PasswordResetScalarFieldEnumSchema,PasswordResetScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const PasswordResetFindManyArgsSchema: z.ZodType<Prisma.PasswordResetFindManyArgs> = z.object({
  select: PasswordResetSelectSchema.optional(),
  include: PasswordResetIncludeSchema.optional(),
  where: PasswordResetWhereInputSchema.optional(),
  orderBy: z.union([ PasswordResetOrderByWithRelationInputSchema.array(),PasswordResetOrderByWithRelationInputSchema ]).optional(),
  cursor: PasswordResetWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ PasswordResetScalarFieldEnumSchema,PasswordResetScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const PasswordResetAggregateArgsSchema: z.ZodType<Prisma.PasswordResetAggregateArgs> = z.object({
  where: PasswordResetWhereInputSchema.optional(),
  orderBy: z.union([ PasswordResetOrderByWithRelationInputSchema.array(),PasswordResetOrderByWithRelationInputSchema ]).optional(),
  cursor: PasswordResetWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const PasswordResetGroupByArgsSchema: z.ZodType<Prisma.PasswordResetGroupByArgs> = z.object({
  where: PasswordResetWhereInputSchema.optional(),
  orderBy: z.union([ PasswordResetOrderByWithAggregationInputSchema.array(),PasswordResetOrderByWithAggregationInputSchema ]).optional(),
  by: PasswordResetScalarFieldEnumSchema.array(),
  having: PasswordResetScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const PasswordResetFindUniqueArgsSchema: z.ZodType<Prisma.PasswordResetFindUniqueArgs> = z.object({
  select: PasswordResetSelectSchema.optional(),
  include: PasswordResetIncludeSchema.optional(),
  where: PasswordResetWhereUniqueInputSchema,
}).strict() ;

export const PasswordResetFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.PasswordResetFindUniqueOrThrowArgs> = z.object({
  select: PasswordResetSelectSchema.optional(),
  include: PasswordResetIncludeSchema.optional(),
  where: PasswordResetWhereUniqueInputSchema,
}).strict() ;

export const LocalEmailFindFirstArgsSchema: z.ZodType<Prisma.LocalEmailFindFirstArgs> = z.object({
  select: LocalEmailSelectSchema.optional(),
  where: LocalEmailWhereInputSchema.optional(),
  orderBy: z.union([ LocalEmailOrderByWithRelationInputSchema.array(),LocalEmailOrderByWithRelationInputSchema ]).optional(),
  cursor: LocalEmailWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ LocalEmailScalarFieldEnumSchema,LocalEmailScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const LocalEmailFindFirstOrThrowArgsSchema: z.ZodType<Prisma.LocalEmailFindFirstOrThrowArgs> = z.object({
  select: LocalEmailSelectSchema.optional(),
  where: LocalEmailWhereInputSchema.optional(),
  orderBy: z.union([ LocalEmailOrderByWithRelationInputSchema.array(),LocalEmailOrderByWithRelationInputSchema ]).optional(),
  cursor: LocalEmailWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ LocalEmailScalarFieldEnumSchema,LocalEmailScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const LocalEmailFindManyArgsSchema: z.ZodType<Prisma.LocalEmailFindManyArgs> = z.object({
  select: LocalEmailSelectSchema.optional(),
  where: LocalEmailWhereInputSchema.optional(),
  orderBy: z.union([ LocalEmailOrderByWithRelationInputSchema.array(),LocalEmailOrderByWithRelationInputSchema ]).optional(),
  cursor: LocalEmailWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ LocalEmailScalarFieldEnumSchema,LocalEmailScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const LocalEmailAggregateArgsSchema: z.ZodType<Prisma.LocalEmailAggregateArgs> = z.object({
  where: LocalEmailWhereInputSchema.optional(),
  orderBy: z.union([ LocalEmailOrderByWithRelationInputSchema.array(),LocalEmailOrderByWithRelationInputSchema ]).optional(),
  cursor: LocalEmailWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const LocalEmailGroupByArgsSchema: z.ZodType<Prisma.LocalEmailGroupByArgs> = z.object({
  where: LocalEmailWhereInputSchema.optional(),
  orderBy: z.union([ LocalEmailOrderByWithAggregationInputSchema.array(),LocalEmailOrderByWithAggregationInputSchema ]).optional(),
  by: LocalEmailScalarFieldEnumSchema.array(),
  having: LocalEmailScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const LocalEmailFindUniqueArgsSchema: z.ZodType<Prisma.LocalEmailFindUniqueArgs> = z.object({
  select: LocalEmailSelectSchema.optional(),
  where: LocalEmailWhereUniqueInputSchema,
}).strict() ;

export const LocalEmailFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.LocalEmailFindUniqueOrThrowArgs> = z.object({
  select: LocalEmailSelectSchema.optional(),
  where: LocalEmailWhereUniqueInputSchema,
}).strict() ;

export const EarlyAccessSignupFindFirstArgsSchema: z.ZodType<Prisma.EarlyAccessSignupFindFirstArgs> = z.object({
  select: EarlyAccessSignupSelectSchema.optional(),
  where: EarlyAccessSignupWhereInputSchema.optional(),
  orderBy: z.union([ EarlyAccessSignupOrderByWithRelationInputSchema.array(),EarlyAccessSignupOrderByWithRelationInputSchema ]).optional(),
  cursor: EarlyAccessSignupWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ EarlyAccessSignupScalarFieldEnumSchema,EarlyAccessSignupScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const EarlyAccessSignupFindFirstOrThrowArgsSchema: z.ZodType<Prisma.EarlyAccessSignupFindFirstOrThrowArgs> = z.object({
  select: EarlyAccessSignupSelectSchema.optional(),
  where: EarlyAccessSignupWhereInputSchema.optional(),
  orderBy: z.union([ EarlyAccessSignupOrderByWithRelationInputSchema.array(),EarlyAccessSignupOrderByWithRelationInputSchema ]).optional(),
  cursor: EarlyAccessSignupWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ EarlyAccessSignupScalarFieldEnumSchema,EarlyAccessSignupScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const EarlyAccessSignupFindManyArgsSchema: z.ZodType<Prisma.EarlyAccessSignupFindManyArgs> = z.object({
  select: EarlyAccessSignupSelectSchema.optional(),
  where: EarlyAccessSignupWhereInputSchema.optional(),
  orderBy: z.union([ EarlyAccessSignupOrderByWithRelationInputSchema.array(),EarlyAccessSignupOrderByWithRelationInputSchema ]).optional(),
  cursor: EarlyAccessSignupWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ EarlyAccessSignupScalarFieldEnumSchema,EarlyAccessSignupScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const EarlyAccessSignupAggregateArgsSchema: z.ZodType<Prisma.EarlyAccessSignupAggregateArgs> = z.object({
  where: EarlyAccessSignupWhereInputSchema.optional(),
  orderBy: z.union([ EarlyAccessSignupOrderByWithRelationInputSchema.array(),EarlyAccessSignupOrderByWithRelationInputSchema ]).optional(),
  cursor: EarlyAccessSignupWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const EarlyAccessSignupGroupByArgsSchema: z.ZodType<Prisma.EarlyAccessSignupGroupByArgs> = z.object({
  where: EarlyAccessSignupWhereInputSchema.optional(),
  orderBy: z.union([ EarlyAccessSignupOrderByWithAggregationInputSchema.array(),EarlyAccessSignupOrderByWithAggregationInputSchema ]).optional(),
  by: EarlyAccessSignupScalarFieldEnumSchema.array(),
  having: EarlyAccessSignupScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const EarlyAccessSignupFindUniqueArgsSchema: z.ZodType<Prisma.EarlyAccessSignupFindUniqueArgs> = z.object({
  select: EarlyAccessSignupSelectSchema.optional(),
  where: EarlyAccessSignupWhereUniqueInputSchema,
}).strict() ;

export const EarlyAccessSignupFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.EarlyAccessSignupFindUniqueOrThrowArgs> = z.object({
  select: EarlyAccessSignupSelectSchema.optional(),
  where: EarlyAccessSignupWhereUniqueInputSchema,
}).strict() ;

export const UserRoleCreateArgsSchema: z.ZodType<Prisma.UserRoleCreateArgs> = z.object({
  select: UserRoleSelectSchema.optional(),
  include: UserRoleIncludeSchema.optional(),
  data: z.union([ UserRoleCreateInputSchema,UserRoleUncheckedCreateInputSchema ]),
}).strict() ;

export const UserRoleUpsertArgsSchema: z.ZodType<Prisma.UserRoleUpsertArgs> = z.object({
  select: UserRoleSelectSchema.optional(),
  include: UserRoleIncludeSchema.optional(),
  where: UserRoleWhereUniqueInputSchema,
  create: z.union([ UserRoleCreateInputSchema,UserRoleUncheckedCreateInputSchema ]),
  update: z.union([ UserRoleUpdateInputSchema,UserRoleUncheckedUpdateInputSchema ]),
}).strict() ;

export const UserRoleCreateManyArgsSchema: z.ZodType<Prisma.UserRoleCreateManyArgs> = z.object({
  data: z.union([ UserRoleCreateManyInputSchema,UserRoleCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const UserRoleCreateManyAndReturnArgsSchema: z.ZodType<Prisma.UserRoleCreateManyAndReturnArgs> = z.object({
  data: z.union([ UserRoleCreateManyInputSchema,UserRoleCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const UserRoleDeleteArgsSchema: z.ZodType<Prisma.UserRoleDeleteArgs> = z.object({
  select: UserRoleSelectSchema.optional(),
  include: UserRoleIncludeSchema.optional(),
  where: UserRoleWhereUniqueInputSchema,
}).strict() ;

export const UserRoleUpdateArgsSchema: z.ZodType<Prisma.UserRoleUpdateArgs> = z.object({
  select: UserRoleSelectSchema.optional(),
  include: UserRoleIncludeSchema.optional(),
  data: z.union([ UserRoleUpdateInputSchema,UserRoleUncheckedUpdateInputSchema ]),
  where: UserRoleWhereUniqueInputSchema,
}).strict() ;

export const UserRoleUpdateManyArgsSchema: z.ZodType<Prisma.UserRoleUpdateManyArgs> = z.object({
  data: z.union([ UserRoleUpdateManyMutationInputSchema,UserRoleUncheckedUpdateManyInputSchema ]),
  where: UserRoleWhereInputSchema.optional(),
}).strict() ;

export const updateManyUserRoleCreateManyAndReturnArgsSchema: z.ZodType<Prisma.updateManyUserRoleCreateManyAndReturnArgs> = z.object({
  data: z.union([ UserRoleUpdateManyMutationInputSchema,UserRoleUncheckedUpdateManyInputSchema ]),
  where: UserRoleWhereInputSchema.optional(),
}).strict() ;

export const UserRoleDeleteManyArgsSchema: z.ZodType<Prisma.UserRoleDeleteManyArgs> = z.object({
  where: UserRoleWhereInputSchema.optional(),
}).strict() ;

export const UserPermissionCreateArgsSchema: z.ZodType<Prisma.UserPermissionCreateArgs> = z.object({
  select: UserPermissionSelectSchema.optional(),
  include: UserPermissionIncludeSchema.optional(),
  data: z.union([ UserPermissionCreateInputSchema,UserPermissionUncheckedCreateInputSchema ]),
}).strict() ;

export const UserPermissionUpsertArgsSchema: z.ZodType<Prisma.UserPermissionUpsertArgs> = z.object({
  select: UserPermissionSelectSchema.optional(),
  include: UserPermissionIncludeSchema.optional(),
  where: UserPermissionWhereUniqueInputSchema,
  create: z.union([ UserPermissionCreateInputSchema,UserPermissionUncheckedCreateInputSchema ]),
  update: z.union([ UserPermissionUpdateInputSchema,UserPermissionUncheckedUpdateInputSchema ]),
}).strict() ;

export const UserPermissionCreateManyArgsSchema: z.ZodType<Prisma.UserPermissionCreateManyArgs> = z.object({
  data: z.union([ UserPermissionCreateManyInputSchema,UserPermissionCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const UserPermissionCreateManyAndReturnArgsSchema: z.ZodType<Prisma.UserPermissionCreateManyAndReturnArgs> = z.object({
  data: z.union([ UserPermissionCreateManyInputSchema,UserPermissionCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const UserPermissionDeleteArgsSchema: z.ZodType<Prisma.UserPermissionDeleteArgs> = z.object({
  select: UserPermissionSelectSchema.optional(),
  include: UserPermissionIncludeSchema.optional(),
  where: UserPermissionWhereUniqueInputSchema,
}).strict() ;

export const UserPermissionUpdateArgsSchema: z.ZodType<Prisma.UserPermissionUpdateArgs> = z.object({
  select: UserPermissionSelectSchema.optional(),
  include: UserPermissionIncludeSchema.optional(),
  data: z.union([ UserPermissionUpdateInputSchema,UserPermissionUncheckedUpdateInputSchema ]),
  where: UserPermissionWhereUniqueInputSchema,
}).strict() ;

export const UserPermissionUpdateManyArgsSchema: z.ZodType<Prisma.UserPermissionUpdateManyArgs> = z.object({
  data: z.union([ UserPermissionUpdateManyMutationInputSchema,UserPermissionUncheckedUpdateManyInputSchema ]),
  where: UserPermissionWhereInputSchema.optional(),
}).strict() ;

export const updateManyUserPermissionCreateManyAndReturnArgsSchema: z.ZodType<Prisma.updateManyUserPermissionCreateManyAndReturnArgs> = z.object({
  data: z.union([ UserPermissionUpdateManyMutationInputSchema,UserPermissionUncheckedUpdateManyInputSchema ]),
  where: UserPermissionWhereInputSchema.optional(),
}).strict() ;

export const UserPermissionDeleteManyArgsSchema: z.ZodType<Prisma.UserPermissionDeleteManyArgs> = z.object({
  where: UserPermissionWhereInputSchema.optional(),
}).strict() ;

export const UserCreateArgsSchema: z.ZodType<Prisma.UserCreateArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  data: z.union([ UserCreateInputSchema,UserUncheckedCreateInputSchema ]),
}).strict() ;

export const UserUpsertArgsSchema: z.ZodType<Prisma.UserUpsertArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema,
  create: z.union([ UserCreateInputSchema,UserUncheckedCreateInputSchema ]),
  update: z.union([ UserUpdateInputSchema,UserUncheckedUpdateInputSchema ]),
}).strict() ;

export const UserCreateManyArgsSchema: z.ZodType<Prisma.UserCreateManyArgs> = z.object({
  data: z.union([ UserCreateManyInputSchema,UserCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const UserCreateManyAndReturnArgsSchema: z.ZodType<Prisma.UserCreateManyAndReturnArgs> = z.object({
  data: z.union([ UserCreateManyInputSchema,UserCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const UserDeleteArgsSchema: z.ZodType<Prisma.UserDeleteArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema,
}).strict() ;

export const UserUpdateArgsSchema: z.ZodType<Prisma.UserUpdateArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  data: z.union([ UserUpdateInputSchema,UserUncheckedUpdateInputSchema ]),
  where: UserWhereUniqueInputSchema,
}).strict() ;

export const UserUpdateManyArgsSchema: z.ZodType<Prisma.UserUpdateManyArgs> = z.object({
  data: z.union([ UserUpdateManyMutationInputSchema,UserUncheckedUpdateManyInputSchema ]),
  where: UserWhereInputSchema.optional(),
}).strict() ;

export const updateManyUserCreateManyAndReturnArgsSchema: z.ZodType<Prisma.updateManyUserCreateManyAndReturnArgs> = z.object({
  data: z.union([ UserUpdateManyMutationInputSchema,UserUncheckedUpdateManyInputSchema ]),
  where: UserWhereInputSchema.optional(),
}).strict() ;

export const UserDeleteManyArgsSchema: z.ZodType<Prisma.UserDeleteManyArgs> = z.object({
  where: UserWhereInputSchema.optional(),
}).strict() ;

export const EmailAddressCreateArgsSchema: z.ZodType<Prisma.EmailAddressCreateArgs> = z.object({
  select: EmailAddressSelectSchema.optional(),
  include: EmailAddressIncludeSchema.optional(),
  data: z.union([ EmailAddressCreateInputSchema,EmailAddressUncheckedCreateInputSchema ]),
}).strict() ;

export const EmailAddressUpsertArgsSchema: z.ZodType<Prisma.EmailAddressUpsertArgs> = z.object({
  select: EmailAddressSelectSchema.optional(),
  include: EmailAddressIncludeSchema.optional(),
  where: EmailAddressWhereUniqueInputSchema,
  create: z.union([ EmailAddressCreateInputSchema,EmailAddressUncheckedCreateInputSchema ]),
  update: z.union([ EmailAddressUpdateInputSchema,EmailAddressUncheckedUpdateInputSchema ]),
}).strict() ;

export const EmailAddressCreateManyArgsSchema: z.ZodType<Prisma.EmailAddressCreateManyArgs> = z.object({
  data: z.union([ EmailAddressCreateManyInputSchema,EmailAddressCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const EmailAddressCreateManyAndReturnArgsSchema: z.ZodType<Prisma.EmailAddressCreateManyAndReturnArgs> = z.object({
  data: z.union([ EmailAddressCreateManyInputSchema,EmailAddressCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const EmailAddressDeleteArgsSchema: z.ZodType<Prisma.EmailAddressDeleteArgs> = z.object({
  select: EmailAddressSelectSchema.optional(),
  include: EmailAddressIncludeSchema.optional(),
  where: EmailAddressWhereUniqueInputSchema,
}).strict() ;

export const EmailAddressUpdateArgsSchema: z.ZodType<Prisma.EmailAddressUpdateArgs> = z.object({
  select: EmailAddressSelectSchema.optional(),
  include: EmailAddressIncludeSchema.optional(),
  data: z.union([ EmailAddressUpdateInputSchema,EmailAddressUncheckedUpdateInputSchema ]),
  where: EmailAddressWhereUniqueInputSchema,
}).strict() ;

export const EmailAddressUpdateManyArgsSchema: z.ZodType<Prisma.EmailAddressUpdateManyArgs> = z.object({
  data: z.union([ EmailAddressUpdateManyMutationInputSchema,EmailAddressUncheckedUpdateManyInputSchema ]),
  where: EmailAddressWhereInputSchema.optional(),
}).strict() ;

export const updateManyEmailAddressCreateManyAndReturnArgsSchema: z.ZodType<Prisma.updateManyEmailAddressCreateManyAndReturnArgs> = z.object({
  data: z.union([ EmailAddressUpdateManyMutationInputSchema,EmailAddressUncheckedUpdateManyInputSchema ]),
  where: EmailAddressWhereInputSchema.optional(),
}).strict() ;

export const EmailAddressDeleteManyArgsSchema: z.ZodType<Prisma.EmailAddressDeleteManyArgs> = z.object({
  where: EmailAddressWhereInputSchema.optional(),
}).strict() ;

export const ExternalAccountCreateArgsSchema: z.ZodType<Prisma.ExternalAccountCreateArgs> = z.object({
  select: ExternalAccountSelectSchema.optional(),
  include: ExternalAccountIncludeSchema.optional(),
  data: z.union([ ExternalAccountCreateInputSchema,ExternalAccountUncheckedCreateInputSchema ]),
}).strict() ;

export const ExternalAccountUpsertArgsSchema: z.ZodType<Prisma.ExternalAccountUpsertArgs> = z.object({
  select: ExternalAccountSelectSchema.optional(),
  include: ExternalAccountIncludeSchema.optional(),
  where: ExternalAccountWhereUniqueInputSchema,
  create: z.union([ ExternalAccountCreateInputSchema,ExternalAccountUncheckedCreateInputSchema ]),
  update: z.union([ ExternalAccountUpdateInputSchema,ExternalAccountUncheckedUpdateInputSchema ]),
}).strict() ;

export const ExternalAccountCreateManyArgsSchema: z.ZodType<Prisma.ExternalAccountCreateManyArgs> = z.object({
  data: z.union([ ExternalAccountCreateManyInputSchema,ExternalAccountCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const ExternalAccountCreateManyAndReturnArgsSchema: z.ZodType<Prisma.ExternalAccountCreateManyAndReturnArgs> = z.object({
  data: z.union([ ExternalAccountCreateManyInputSchema,ExternalAccountCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const ExternalAccountDeleteArgsSchema: z.ZodType<Prisma.ExternalAccountDeleteArgs> = z.object({
  select: ExternalAccountSelectSchema.optional(),
  include: ExternalAccountIncludeSchema.optional(),
  where: ExternalAccountWhereUniqueInputSchema,
}).strict() ;

export const ExternalAccountUpdateArgsSchema: z.ZodType<Prisma.ExternalAccountUpdateArgs> = z.object({
  select: ExternalAccountSelectSchema.optional(),
  include: ExternalAccountIncludeSchema.optional(),
  data: z.union([ ExternalAccountUpdateInputSchema,ExternalAccountUncheckedUpdateInputSchema ]),
  where: ExternalAccountWhereUniqueInputSchema,
}).strict() ;

export const ExternalAccountUpdateManyArgsSchema: z.ZodType<Prisma.ExternalAccountUpdateManyArgs> = z.object({
  data: z.union([ ExternalAccountUpdateManyMutationInputSchema,ExternalAccountUncheckedUpdateManyInputSchema ]),
  where: ExternalAccountWhereInputSchema.optional(),
}).strict() ;

export const updateManyExternalAccountCreateManyAndReturnArgsSchema: z.ZodType<Prisma.updateManyExternalAccountCreateManyAndReturnArgs> = z.object({
  data: z.union([ ExternalAccountUpdateManyMutationInputSchema,ExternalAccountUncheckedUpdateManyInputSchema ]),
  where: ExternalAccountWhereInputSchema.optional(),
}).strict() ;

export const ExternalAccountDeleteManyArgsSchema: z.ZodType<Prisma.ExternalAccountDeleteManyArgs> = z.object({
  where: ExternalAccountWhereInputSchema.optional(),
}).strict() ;

export const UploadedPhotoCreateArgsSchema: z.ZodType<Prisma.UploadedPhotoCreateArgs> = z.object({
  select: UploadedPhotoSelectSchema.optional(),
  include: UploadedPhotoIncludeSchema.optional(),
  data: z.union([ UploadedPhotoCreateInputSchema,UploadedPhotoUncheckedCreateInputSchema ]),
}).strict() ;

export const UploadedPhotoUpsertArgsSchema: z.ZodType<Prisma.UploadedPhotoUpsertArgs> = z.object({
  select: UploadedPhotoSelectSchema.optional(),
  include: UploadedPhotoIncludeSchema.optional(),
  where: UploadedPhotoWhereUniqueInputSchema,
  create: z.union([ UploadedPhotoCreateInputSchema,UploadedPhotoUncheckedCreateInputSchema ]),
  update: z.union([ UploadedPhotoUpdateInputSchema,UploadedPhotoUncheckedUpdateInputSchema ]),
}).strict() ;

export const UploadedPhotoCreateManyArgsSchema: z.ZodType<Prisma.UploadedPhotoCreateManyArgs> = z.object({
  data: z.union([ UploadedPhotoCreateManyInputSchema,UploadedPhotoCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const UploadedPhotoCreateManyAndReturnArgsSchema: z.ZodType<Prisma.UploadedPhotoCreateManyAndReturnArgs> = z.object({
  data: z.union([ UploadedPhotoCreateManyInputSchema,UploadedPhotoCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const UploadedPhotoDeleteArgsSchema: z.ZodType<Prisma.UploadedPhotoDeleteArgs> = z.object({
  select: UploadedPhotoSelectSchema.optional(),
  include: UploadedPhotoIncludeSchema.optional(),
  where: UploadedPhotoWhereUniqueInputSchema,
}).strict() ;

export const UploadedPhotoUpdateArgsSchema: z.ZodType<Prisma.UploadedPhotoUpdateArgs> = z.object({
  select: UploadedPhotoSelectSchema.optional(),
  include: UploadedPhotoIncludeSchema.optional(),
  data: z.union([ UploadedPhotoUpdateInputSchema,UploadedPhotoUncheckedUpdateInputSchema ]),
  where: UploadedPhotoWhereUniqueInputSchema,
}).strict() ;

export const UploadedPhotoUpdateManyArgsSchema: z.ZodType<Prisma.UploadedPhotoUpdateManyArgs> = z.object({
  data: z.union([ UploadedPhotoUpdateManyMutationInputSchema,UploadedPhotoUncheckedUpdateManyInputSchema ]),
  where: UploadedPhotoWhereInputSchema.optional(),
}).strict() ;

export const updateManyUploadedPhotoCreateManyAndReturnArgsSchema: z.ZodType<Prisma.updateManyUploadedPhotoCreateManyAndReturnArgs> = z.object({
  data: z.union([ UploadedPhotoUpdateManyMutationInputSchema,UploadedPhotoUncheckedUpdateManyInputSchema ]),
  where: UploadedPhotoWhereInputSchema.optional(),
}).strict() ;

export const UploadedPhotoDeleteManyArgsSchema: z.ZodType<Prisma.UploadedPhotoDeleteManyArgs> = z.object({
  where: UploadedPhotoWhereInputSchema.optional(),
}).strict() ;

export const ListingCreateArgsSchema: z.ZodType<Prisma.ListingCreateArgs> = z.object({
  select: ListingSelectSchema.optional(),
  include: ListingIncludeSchema.optional(),
  data: z.union([ ListingCreateInputSchema,ListingUncheckedCreateInputSchema ]),
}).strict() ;

export const ListingUpsertArgsSchema: z.ZodType<Prisma.ListingUpsertArgs> = z.object({
  select: ListingSelectSchema.optional(),
  include: ListingIncludeSchema.optional(),
  where: ListingWhereUniqueInputSchema,
  create: z.union([ ListingCreateInputSchema,ListingUncheckedCreateInputSchema ]),
  update: z.union([ ListingUpdateInputSchema,ListingUncheckedUpdateInputSchema ]),
}).strict() ;

export const ListingCreateManyArgsSchema: z.ZodType<Prisma.ListingCreateManyArgs> = z.object({
  data: z.union([ ListingCreateManyInputSchema,ListingCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const ListingCreateManyAndReturnArgsSchema: z.ZodType<Prisma.ListingCreateManyAndReturnArgs> = z.object({
  data: z.union([ ListingCreateManyInputSchema,ListingCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const ListingDeleteArgsSchema: z.ZodType<Prisma.ListingDeleteArgs> = z.object({
  select: ListingSelectSchema.optional(),
  include: ListingIncludeSchema.optional(),
  where: ListingWhereUniqueInputSchema,
}).strict() ;

export const ListingUpdateArgsSchema: z.ZodType<Prisma.ListingUpdateArgs> = z.object({
  select: ListingSelectSchema.optional(),
  include: ListingIncludeSchema.optional(),
  data: z.union([ ListingUpdateInputSchema,ListingUncheckedUpdateInputSchema ]),
  where: ListingWhereUniqueInputSchema,
}).strict() ;

export const ListingUpdateManyArgsSchema: z.ZodType<Prisma.ListingUpdateManyArgs> = z.object({
  data: z.union([ ListingUpdateManyMutationInputSchema,ListingUncheckedUpdateManyInputSchema ]),
  where: ListingWhereInputSchema.optional(),
}).strict() ;

export const updateManyListingCreateManyAndReturnArgsSchema: z.ZodType<Prisma.updateManyListingCreateManyAndReturnArgs> = z.object({
  data: z.union([ ListingUpdateManyMutationInputSchema,ListingUncheckedUpdateManyInputSchema ]),
  where: ListingWhereInputSchema.optional(),
}).strict() ;

export const ListingDeleteManyArgsSchema: z.ZodType<Prisma.ListingDeleteManyArgs> = z.object({
  where: ListingWhereInputSchema.optional(),
}).strict() ;

export const ListingInventoryCreateArgsSchema: z.ZodType<Prisma.ListingInventoryCreateArgs> = z.object({
  select: ListingInventorySelectSchema.optional(),
  include: ListingInventoryIncludeSchema.optional(),
  data: z.union([ ListingInventoryCreateInputSchema,ListingInventoryUncheckedCreateInputSchema ]),
}).strict() ;

export const ListingInventoryUpsertArgsSchema: z.ZodType<Prisma.ListingInventoryUpsertArgs> = z.object({
  select: ListingInventorySelectSchema.optional(),
  include: ListingInventoryIncludeSchema.optional(),
  where: ListingInventoryWhereUniqueInputSchema,
  create: z.union([ ListingInventoryCreateInputSchema,ListingInventoryUncheckedCreateInputSchema ]),
  update: z.union([ ListingInventoryUpdateInputSchema,ListingInventoryUncheckedUpdateInputSchema ]),
}).strict() ;

export const ListingInventoryCreateManyArgsSchema: z.ZodType<Prisma.ListingInventoryCreateManyArgs> = z.object({
  data: z.union([ ListingInventoryCreateManyInputSchema,ListingInventoryCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const ListingInventoryCreateManyAndReturnArgsSchema: z.ZodType<Prisma.ListingInventoryCreateManyAndReturnArgs> = z.object({
  data: z.union([ ListingInventoryCreateManyInputSchema,ListingInventoryCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const ListingInventoryDeleteArgsSchema: z.ZodType<Prisma.ListingInventoryDeleteArgs> = z.object({
  select: ListingInventorySelectSchema.optional(),
  include: ListingInventoryIncludeSchema.optional(),
  where: ListingInventoryWhereUniqueInputSchema,
}).strict() ;

export const ListingInventoryUpdateArgsSchema: z.ZodType<Prisma.ListingInventoryUpdateArgs> = z.object({
  select: ListingInventorySelectSchema.optional(),
  include: ListingInventoryIncludeSchema.optional(),
  data: z.union([ ListingInventoryUpdateInputSchema,ListingInventoryUncheckedUpdateInputSchema ]),
  where: ListingInventoryWhereUniqueInputSchema,
}).strict() ;

export const ListingInventoryUpdateManyArgsSchema: z.ZodType<Prisma.ListingInventoryUpdateManyArgs> = z.object({
  data: z.union([ ListingInventoryUpdateManyMutationInputSchema,ListingInventoryUncheckedUpdateManyInputSchema ]),
  where: ListingInventoryWhereInputSchema.optional(),
}).strict() ;

export const updateManyListingInventoryCreateManyAndReturnArgsSchema: z.ZodType<Prisma.updateManyListingInventoryCreateManyAndReturnArgs> = z.object({
  data: z.union([ ListingInventoryUpdateManyMutationInputSchema,ListingInventoryUncheckedUpdateManyInputSchema ]),
  where: ListingInventoryWhereInputSchema.optional(),
}).strict() ;

export const ListingInventoryDeleteManyArgsSchema: z.ZodType<Prisma.ListingInventoryDeleteManyArgs> = z.object({
  where: ListingInventoryWhereInputSchema.optional(),
}).strict() ;

export const BookingCreateArgsSchema: z.ZodType<Prisma.BookingCreateArgs> = z.object({
  select: BookingSelectSchema.optional(),
  include: BookingIncludeSchema.optional(),
  data: z.union([ BookingCreateInputSchema,BookingUncheckedCreateInputSchema ]),
}).strict() ;

export const BookingUpsertArgsSchema: z.ZodType<Prisma.BookingUpsertArgs> = z.object({
  select: BookingSelectSchema.optional(),
  include: BookingIncludeSchema.optional(),
  where: BookingWhereUniqueInputSchema,
  create: z.union([ BookingCreateInputSchema,BookingUncheckedCreateInputSchema ]),
  update: z.union([ BookingUpdateInputSchema,BookingUncheckedUpdateInputSchema ]),
}).strict() ;

export const BookingCreateManyArgsSchema: z.ZodType<Prisma.BookingCreateManyArgs> = z.object({
  data: z.union([ BookingCreateManyInputSchema,BookingCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const BookingCreateManyAndReturnArgsSchema: z.ZodType<Prisma.BookingCreateManyAndReturnArgs> = z.object({
  data: z.union([ BookingCreateManyInputSchema,BookingCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const BookingDeleteArgsSchema: z.ZodType<Prisma.BookingDeleteArgs> = z.object({
  select: BookingSelectSchema.optional(),
  include: BookingIncludeSchema.optional(),
  where: BookingWhereUniqueInputSchema,
}).strict() ;

export const BookingUpdateArgsSchema: z.ZodType<Prisma.BookingUpdateArgs> = z.object({
  select: BookingSelectSchema.optional(),
  include: BookingIncludeSchema.optional(),
  data: z.union([ BookingUpdateInputSchema,BookingUncheckedUpdateInputSchema ]),
  where: BookingWhereUniqueInputSchema,
}).strict() ;

export const BookingUpdateManyArgsSchema: z.ZodType<Prisma.BookingUpdateManyArgs> = z.object({
  data: z.union([ BookingUpdateManyMutationInputSchema,BookingUncheckedUpdateManyInputSchema ]),
  where: BookingWhereInputSchema.optional(),
}).strict() ;

export const updateManyBookingCreateManyAndReturnArgsSchema: z.ZodType<Prisma.updateManyBookingCreateManyAndReturnArgs> = z.object({
  data: z.union([ BookingUpdateManyMutationInputSchema,BookingUncheckedUpdateManyInputSchema ]),
  where: BookingWhereInputSchema.optional(),
}).strict() ;

export const BookingDeleteManyArgsSchema: z.ZodType<Prisma.BookingDeleteManyArgs> = z.object({
  where: BookingWhereInputSchema.optional(),
}).strict() ;

export const BookingRequestCreateArgsSchema: z.ZodType<Prisma.BookingRequestCreateArgs> = z.object({
  select: BookingRequestSelectSchema.optional(),
  include: BookingRequestIncludeSchema.optional(),
  data: z.union([ BookingRequestCreateInputSchema,BookingRequestUncheckedCreateInputSchema ]),
}).strict() ;

export const BookingRequestUpsertArgsSchema: z.ZodType<Prisma.BookingRequestUpsertArgs> = z.object({
  select: BookingRequestSelectSchema.optional(),
  include: BookingRequestIncludeSchema.optional(),
  where: BookingRequestWhereUniqueInputSchema,
  create: z.union([ BookingRequestCreateInputSchema,BookingRequestUncheckedCreateInputSchema ]),
  update: z.union([ BookingRequestUpdateInputSchema,BookingRequestUncheckedUpdateInputSchema ]),
}).strict() ;

export const BookingRequestCreateManyArgsSchema: z.ZodType<Prisma.BookingRequestCreateManyArgs> = z.object({
  data: z.union([ BookingRequestCreateManyInputSchema,BookingRequestCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const BookingRequestCreateManyAndReturnArgsSchema: z.ZodType<Prisma.BookingRequestCreateManyAndReturnArgs> = z.object({
  data: z.union([ BookingRequestCreateManyInputSchema,BookingRequestCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const BookingRequestDeleteArgsSchema: z.ZodType<Prisma.BookingRequestDeleteArgs> = z.object({
  select: BookingRequestSelectSchema.optional(),
  include: BookingRequestIncludeSchema.optional(),
  where: BookingRequestWhereUniqueInputSchema,
}).strict() ;

export const BookingRequestUpdateArgsSchema: z.ZodType<Prisma.BookingRequestUpdateArgs> = z.object({
  select: BookingRequestSelectSchema.optional(),
  include: BookingRequestIncludeSchema.optional(),
  data: z.union([ BookingRequestUpdateInputSchema,BookingRequestUncheckedUpdateInputSchema ]),
  where: BookingRequestWhereUniqueInputSchema,
}).strict() ;

export const BookingRequestUpdateManyArgsSchema: z.ZodType<Prisma.BookingRequestUpdateManyArgs> = z.object({
  data: z.union([ BookingRequestUpdateManyMutationInputSchema,BookingRequestUncheckedUpdateManyInputSchema ]),
  where: BookingRequestWhereInputSchema.optional(),
}).strict() ;

export const updateManyBookingRequestCreateManyAndReturnArgsSchema: z.ZodType<Prisma.updateManyBookingRequestCreateManyAndReturnArgs> = z.object({
  data: z.union([ BookingRequestUpdateManyMutationInputSchema,BookingRequestUncheckedUpdateManyInputSchema ]),
  where: BookingRequestWhereInputSchema.optional(),
}).strict() ;

export const BookingRequestDeleteManyArgsSchema: z.ZodType<Prisma.BookingRequestDeleteManyArgs> = z.object({
  where: BookingRequestWhereInputSchema.optional(),
}).strict() ;

export const SessionCreateArgsSchema: z.ZodType<Prisma.SessionCreateArgs> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  data: z.union([ SessionCreateInputSchema,SessionUncheckedCreateInputSchema ]),
}).strict() ;

export const SessionUpsertArgsSchema: z.ZodType<Prisma.SessionUpsertArgs> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  where: SessionWhereUniqueInputSchema,
  create: z.union([ SessionCreateInputSchema,SessionUncheckedCreateInputSchema ]),
  update: z.union([ SessionUpdateInputSchema,SessionUncheckedUpdateInputSchema ]),
}).strict() ;

export const SessionCreateManyArgsSchema: z.ZodType<Prisma.SessionCreateManyArgs> = z.object({
  data: z.union([ SessionCreateManyInputSchema,SessionCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const SessionCreateManyAndReturnArgsSchema: z.ZodType<Prisma.SessionCreateManyAndReturnArgs> = z.object({
  data: z.union([ SessionCreateManyInputSchema,SessionCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const SessionDeleteArgsSchema: z.ZodType<Prisma.SessionDeleteArgs> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  where: SessionWhereUniqueInputSchema,
}).strict() ;

export const SessionUpdateArgsSchema: z.ZodType<Prisma.SessionUpdateArgs> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  data: z.union([ SessionUpdateInputSchema,SessionUncheckedUpdateInputSchema ]),
  where: SessionWhereUniqueInputSchema,
}).strict() ;

export const SessionUpdateManyArgsSchema: z.ZodType<Prisma.SessionUpdateManyArgs> = z.object({
  data: z.union([ SessionUpdateManyMutationInputSchema,SessionUncheckedUpdateManyInputSchema ]),
  where: SessionWhereInputSchema.optional(),
}).strict() ;

export const updateManySessionCreateManyAndReturnArgsSchema: z.ZodType<Prisma.updateManySessionCreateManyAndReturnArgs> = z.object({
  data: z.union([ SessionUpdateManyMutationInputSchema,SessionUncheckedUpdateManyInputSchema ]),
  where: SessionWhereInputSchema.optional(),
}).strict() ;

export const SessionDeleteManyArgsSchema: z.ZodType<Prisma.SessionDeleteManyArgs> = z.object({
  where: SessionWhereInputSchema.optional(),
}).strict() ;

export const PasswordResetCreateArgsSchema: z.ZodType<Prisma.PasswordResetCreateArgs> = z.object({
  select: PasswordResetSelectSchema.optional(),
  include: PasswordResetIncludeSchema.optional(),
  data: z.union([ PasswordResetCreateInputSchema,PasswordResetUncheckedCreateInputSchema ]),
}).strict() ;

export const PasswordResetUpsertArgsSchema: z.ZodType<Prisma.PasswordResetUpsertArgs> = z.object({
  select: PasswordResetSelectSchema.optional(),
  include: PasswordResetIncludeSchema.optional(),
  where: PasswordResetWhereUniqueInputSchema,
  create: z.union([ PasswordResetCreateInputSchema,PasswordResetUncheckedCreateInputSchema ]),
  update: z.union([ PasswordResetUpdateInputSchema,PasswordResetUncheckedUpdateInputSchema ]),
}).strict() ;

export const PasswordResetCreateManyArgsSchema: z.ZodType<Prisma.PasswordResetCreateManyArgs> = z.object({
  data: z.union([ PasswordResetCreateManyInputSchema,PasswordResetCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const PasswordResetCreateManyAndReturnArgsSchema: z.ZodType<Prisma.PasswordResetCreateManyAndReturnArgs> = z.object({
  data: z.union([ PasswordResetCreateManyInputSchema,PasswordResetCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const PasswordResetDeleteArgsSchema: z.ZodType<Prisma.PasswordResetDeleteArgs> = z.object({
  select: PasswordResetSelectSchema.optional(),
  include: PasswordResetIncludeSchema.optional(),
  where: PasswordResetWhereUniqueInputSchema,
}).strict() ;

export const PasswordResetUpdateArgsSchema: z.ZodType<Prisma.PasswordResetUpdateArgs> = z.object({
  select: PasswordResetSelectSchema.optional(),
  include: PasswordResetIncludeSchema.optional(),
  data: z.union([ PasswordResetUpdateInputSchema,PasswordResetUncheckedUpdateInputSchema ]),
  where: PasswordResetWhereUniqueInputSchema,
}).strict() ;

export const PasswordResetUpdateManyArgsSchema: z.ZodType<Prisma.PasswordResetUpdateManyArgs> = z.object({
  data: z.union([ PasswordResetUpdateManyMutationInputSchema,PasswordResetUncheckedUpdateManyInputSchema ]),
  where: PasswordResetWhereInputSchema.optional(),
}).strict() ;

export const updateManyPasswordResetCreateManyAndReturnArgsSchema: z.ZodType<Prisma.updateManyPasswordResetCreateManyAndReturnArgs> = z.object({
  data: z.union([ PasswordResetUpdateManyMutationInputSchema,PasswordResetUncheckedUpdateManyInputSchema ]),
  where: PasswordResetWhereInputSchema.optional(),
}).strict() ;

export const PasswordResetDeleteManyArgsSchema: z.ZodType<Prisma.PasswordResetDeleteManyArgs> = z.object({
  where: PasswordResetWhereInputSchema.optional(),
}).strict() ;

export const LocalEmailCreateArgsSchema: z.ZodType<Prisma.LocalEmailCreateArgs> = z.object({
  select: LocalEmailSelectSchema.optional(),
  data: z.union([ LocalEmailCreateInputSchema,LocalEmailUncheckedCreateInputSchema ]),
}).strict() ;

export const LocalEmailUpsertArgsSchema: z.ZodType<Prisma.LocalEmailUpsertArgs> = z.object({
  select: LocalEmailSelectSchema.optional(),
  where: LocalEmailWhereUniqueInputSchema,
  create: z.union([ LocalEmailCreateInputSchema,LocalEmailUncheckedCreateInputSchema ]),
  update: z.union([ LocalEmailUpdateInputSchema,LocalEmailUncheckedUpdateInputSchema ]),
}).strict() ;

export const LocalEmailCreateManyArgsSchema: z.ZodType<Prisma.LocalEmailCreateManyArgs> = z.object({
  data: z.union([ LocalEmailCreateManyInputSchema,LocalEmailCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const LocalEmailCreateManyAndReturnArgsSchema: z.ZodType<Prisma.LocalEmailCreateManyAndReturnArgs> = z.object({
  data: z.union([ LocalEmailCreateManyInputSchema,LocalEmailCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const LocalEmailDeleteArgsSchema: z.ZodType<Prisma.LocalEmailDeleteArgs> = z.object({
  select: LocalEmailSelectSchema.optional(),
  where: LocalEmailWhereUniqueInputSchema,
}).strict() ;

export const LocalEmailUpdateArgsSchema: z.ZodType<Prisma.LocalEmailUpdateArgs> = z.object({
  select: LocalEmailSelectSchema.optional(),
  data: z.union([ LocalEmailUpdateInputSchema,LocalEmailUncheckedUpdateInputSchema ]),
  where: LocalEmailWhereUniqueInputSchema,
}).strict() ;

export const LocalEmailUpdateManyArgsSchema: z.ZodType<Prisma.LocalEmailUpdateManyArgs> = z.object({
  data: z.union([ LocalEmailUpdateManyMutationInputSchema,LocalEmailUncheckedUpdateManyInputSchema ]),
  where: LocalEmailWhereInputSchema.optional(),
}).strict() ;

export const updateManyLocalEmailCreateManyAndReturnArgsSchema: z.ZodType<Prisma.updateManyLocalEmailCreateManyAndReturnArgs> = z.object({
  data: z.union([ LocalEmailUpdateManyMutationInputSchema,LocalEmailUncheckedUpdateManyInputSchema ]),
  where: LocalEmailWhereInputSchema.optional(),
}).strict() ;

export const LocalEmailDeleteManyArgsSchema: z.ZodType<Prisma.LocalEmailDeleteManyArgs> = z.object({
  where: LocalEmailWhereInputSchema.optional(),
}).strict() ;

export const EarlyAccessSignupCreateArgsSchema: z.ZodType<Prisma.EarlyAccessSignupCreateArgs> = z.object({
  select: EarlyAccessSignupSelectSchema.optional(),
  data: z.union([ EarlyAccessSignupCreateInputSchema,EarlyAccessSignupUncheckedCreateInputSchema ]),
}).strict() ;

export const EarlyAccessSignupUpsertArgsSchema: z.ZodType<Prisma.EarlyAccessSignupUpsertArgs> = z.object({
  select: EarlyAccessSignupSelectSchema.optional(),
  where: EarlyAccessSignupWhereUniqueInputSchema,
  create: z.union([ EarlyAccessSignupCreateInputSchema,EarlyAccessSignupUncheckedCreateInputSchema ]),
  update: z.union([ EarlyAccessSignupUpdateInputSchema,EarlyAccessSignupUncheckedUpdateInputSchema ]),
}).strict() ;

export const EarlyAccessSignupCreateManyArgsSchema: z.ZodType<Prisma.EarlyAccessSignupCreateManyArgs> = z.object({
  data: z.union([ EarlyAccessSignupCreateManyInputSchema,EarlyAccessSignupCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const EarlyAccessSignupCreateManyAndReturnArgsSchema: z.ZodType<Prisma.EarlyAccessSignupCreateManyAndReturnArgs> = z.object({
  data: z.union([ EarlyAccessSignupCreateManyInputSchema,EarlyAccessSignupCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const EarlyAccessSignupDeleteArgsSchema: z.ZodType<Prisma.EarlyAccessSignupDeleteArgs> = z.object({
  select: EarlyAccessSignupSelectSchema.optional(),
  where: EarlyAccessSignupWhereUniqueInputSchema,
}).strict() ;

export const EarlyAccessSignupUpdateArgsSchema: z.ZodType<Prisma.EarlyAccessSignupUpdateArgs> = z.object({
  select: EarlyAccessSignupSelectSchema.optional(),
  data: z.union([ EarlyAccessSignupUpdateInputSchema,EarlyAccessSignupUncheckedUpdateInputSchema ]),
  where: EarlyAccessSignupWhereUniqueInputSchema,
}).strict() ;

export const EarlyAccessSignupUpdateManyArgsSchema: z.ZodType<Prisma.EarlyAccessSignupUpdateManyArgs> = z.object({
  data: z.union([ EarlyAccessSignupUpdateManyMutationInputSchema,EarlyAccessSignupUncheckedUpdateManyInputSchema ]),
  where: EarlyAccessSignupWhereInputSchema.optional(),
}).strict() ;

export const updateManyEarlyAccessSignupCreateManyAndReturnArgsSchema: z.ZodType<Prisma.updateManyEarlyAccessSignupCreateManyAndReturnArgs> = z.object({
  data: z.union([ EarlyAccessSignupUpdateManyMutationInputSchema,EarlyAccessSignupUncheckedUpdateManyInputSchema ]),
  where: EarlyAccessSignupWhereInputSchema.optional(),
}).strict() ;

export const EarlyAccessSignupDeleteManyArgsSchema: z.ZodType<Prisma.EarlyAccessSignupDeleteManyArgs> = z.object({
  where: EarlyAccessSignupWhereInputSchema.optional(),
}).strict() ;