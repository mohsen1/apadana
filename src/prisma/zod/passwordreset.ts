import * as z from "zod"
import { CompleteUser, RelatedUserBaseModel } from "./index"

export const PasswordResetBaseModel = z.object({
  id: z.string(),
  userId: z.string(),
  token: z.string(),
  expiresAt: z.date(),
})

export interface CompletePasswordReset extends z.infer<typeof PasswordResetBaseModel> {
  user: CompleteUser
}

/**
 * RelatedPasswordResetBaseModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedPasswordResetBaseModel: z.ZodSchema<CompletePasswordReset> = z.lazy(() => PasswordResetBaseModel.extend({
  user: RelatedUserBaseModel,
}))
