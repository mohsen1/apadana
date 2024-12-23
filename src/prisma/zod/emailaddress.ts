import * as z from "zod"
import { CompleteUser, RelatedUserBaseModel } from "./index"

export const EmailAddressBaseModel = z.object({
  id: z.string(),
  emailAddress: z.string(),
  isPrimary: z.boolean(),
  verification: z.string().nullish(),
  userId: z.string(),
})

export interface CompleteEmailAddress extends z.infer<typeof EmailAddressBaseModel> {
  user: CompleteUser
}

/**
 * RelatedEmailAddressBaseModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedEmailAddressBaseModel: z.ZodSchema<CompleteEmailAddress> = z.lazy(() => EmailAddressBaseModel.extend({
  user: RelatedUserBaseModel,
}))
