import * as z from "zod"
import { CompleteListing, RelatedListingBaseModel, CompleteBooking, RelatedBookingBaseModel } from "./index"

export const ListingInventoryBaseModel = z.object({
  id: z.number().int(),
  listingId: z.string(),
  date: z.date(),
  /**
   * is this date available for booking
   */
  isAvailable: z.boolean(),
  price: z.number(),
  bookingId: z.string().nullish(),
})

export interface CompleteListingInventory extends z.infer<typeof ListingInventoryBaseModel> {
  listing: CompleteListing
  booking?: CompleteBooking | null
}

/**
 * RelatedListingInventoryBaseModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedListingInventoryBaseModel: z.ZodSchema<CompleteListingInventory> = z.lazy(() => ListingInventoryBaseModel.extend({
  listing: RelatedListingBaseModel,
  /**
   * related booking for this date
   */
  booking: RelatedBookingBaseModel.nullish(),
}))
