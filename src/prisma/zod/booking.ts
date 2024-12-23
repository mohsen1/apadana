import * as z from "zod"
import { BookingStatus } from "@prisma/client"
import { CompleteUser, RelatedUserBaseModel, CompleteListingInventory, RelatedListingInventoryBaseModel, CompleteBookingRequest, RelatedBookingRequestBaseModel } from "./index"

export const BookingBaseModel = z.object({
  id: z.string(),
  userId: z.string(),
  totalPrice: z.number(),
  checkIn: z.date(),
  checkOut: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
  bookingRequestId: z.string().nullish(),
  status: z.nativeEnum(BookingStatus),
})

export interface CompleteBooking extends z.infer<typeof BookingBaseModel> {
  user: CompleteUser
  listingInventory: CompleteListingInventory[]
  bookingRequest?: CompleteBookingRequest | null
}

/**
 * RelatedBookingBaseModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedBookingBaseModel: z.ZodSchema<CompleteBooking> = z.lazy(() => BookingBaseModel.extend({
  user: RelatedUserBaseModel,
  listingInventory: RelatedListingInventoryBaseModel.array(),
  bookingRequest: RelatedBookingRequestBaseModel.nullish(),
}))
