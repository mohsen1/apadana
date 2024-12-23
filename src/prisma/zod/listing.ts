import * as z from "zod"
import { Currency } from "@prisma/client"
import { CompleteUser, RelatedUserBaseModel, CompleteUploadedPhoto, RelatedUploadedPhotoBaseModel, CompleteListingInventory, RelatedListingInventoryBaseModel, CompleteBookingRequest, RelatedBookingRequestBaseModel } from "./index"

export const ListingBaseModel = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  propertyType: z.string(),
  address: z.string(),
  latitude: z.number().nullish(),
  longitude: z.number().nullish(),
  timeZone: z.string(),
  /**
   * HH:MM 24-hour format
   */
  checkInTime: z.string(),
  /**
   * HH:MM 24-hour format
   */
  checkOutTime: z.string(),
  amenities: z.string().array(),
  pricePerNight: z.number(),
  currency: z.nativeEnum(Currency),
  minimumStay: z.number().int(),
  maximumGuests: z.number().int(),
  houseRules: z.string(),
  allowPets: z.boolean(),
  petPolicy: z.string(),
  published: z.boolean(),
  showExactLocation: z.boolean(),
  locationRadius: z.number(),
  ownerId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteListing extends z.infer<typeof ListingBaseModel> {
  owner: CompleteUser
  images: CompleteUploadedPhoto[]
  inventory: CompleteListingInventory[]
  BookingRequest: CompleteBookingRequest[]
}

/**
 * RelatedListingBaseModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedListingBaseModel: z.ZodSchema<CompleteListing> = z.lazy(() => ListingBaseModel.extend({
  owner: RelatedUserBaseModel,
  images: RelatedUploadedPhotoBaseModel.array(),
  inventory: RelatedListingInventoryBaseModel.array(),
  BookingRequest: RelatedBookingRequestBaseModel.array(),
}))
