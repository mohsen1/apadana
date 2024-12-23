import * as z from "zod"
import { BookingRequestStatus } from "@prisma/client"
import { CompleteUser, RelatedUserBaseModel, CompleteListing, RelatedListingBaseModel, CompleteBooking, RelatedBookingBaseModel } from "./index"

export const BookingRequestBaseModel = z.object({
  id: z.string(),
  userId: z.string(),
  listingId: z.string(),
  message: z.string(),
  checkIn: z.date(),
  checkOut: z.date(),
  guests: z.number().int(),
  status: z.nativeEnum(BookingRequestStatus),
  pets: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  /**
   * Total price for the booking request calculated from the listing price per night and the number of nights at the time of the booking request
   */
  totalPrice: z.number(),
  /**
   * Reference to the original booking request if this is an alteration
   */
  alterationOf: z.string().nullish(),
})

export interface CompleteBookingRequest extends z.infer<typeof BookingRequestBaseModel> {
  user: CompleteUser
  listing: CompleteListing
  Booking: CompleteBooking[]
  originalRequest?: CompleteBookingRequest | null
  alterations: CompleteBookingRequest[]
}

/**
 * RelatedBookingRequestBaseModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedBookingRequestBaseModel: z.ZodSchema<CompleteBookingRequest> = z.lazy(() => BookingRequestBaseModel.extend({
  user: RelatedUserBaseModel,
  listing: RelatedListingBaseModel,
  Booking: RelatedBookingBaseModel.array(),
  /**
   * Reference to the original booking request
   */
  originalRequest: RelatedBookingRequestBaseModel.nullish(),
  /**
   * Alterations made to this booking request
   */
  alterations: RelatedBookingRequestBaseModel.array(),
}))
