import * as z from "zod"
import { CompleteEmailAddress, RelatedEmailAddressBaseModel, CompleteExternalAccount, RelatedExternalAccountBaseModel, CompleteListing, RelatedListingBaseModel, CompleteUserRole, RelatedUserRoleBaseModel, CompleteUserPermission, RelatedUserPermissionBaseModel, CompleteBooking, RelatedBookingBaseModel, CompleteBookingRequest, RelatedBookingRequestBaseModel, CompleteSession, RelatedSessionBaseModel, CompletePasswordReset, RelatedPasswordResetBaseModel } from "./index"

export const UserBaseModel = z.object({
  id: z.string(),
  firstName: z.string().nullish(),
  lastName: z.string().nullish(),
  imageUrl: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  password: z.string().nullish(),
})

export interface CompleteUser extends z.infer<typeof UserBaseModel> {
  emailAddresses: CompleteEmailAddress[]
  externalAccounts: CompleteExternalAccount[]
  listings: CompleteListing[]
  roles: CompleteUserRole[]
  permissions: CompleteUserPermission[]
  bookings: CompleteBooking[]
  BookingRequest: CompleteBookingRequest[]
  sessions: CompleteSession[]
  passwordReset: CompletePasswordReset[]
}

/**
 * RelatedUserBaseModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedUserBaseModel: z.ZodSchema<CompleteUser> = z.lazy(() => UserBaseModel.extend({
  emailAddresses: RelatedEmailAddressBaseModel.array(),
  externalAccounts: RelatedExternalAccountBaseModel.array(),
  listings: RelatedListingBaseModel.array(),
  roles: RelatedUserRoleBaseModel.array(),
  permissions: RelatedUserPermissionBaseModel.array(),
  bookings: RelatedBookingBaseModel.array(),
  BookingRequest: RelatedBookingRequestBaseModel.array(),
  sessions: RelatedSessionBaseModel.array(),
  passwordReset: RelatedPasswordResetBaseModel.array(),
}))
