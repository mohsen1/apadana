import * as z from "zod"
import { CompleteUser, RelatedUserBaseModel } from "./index"

export const ExternalAccountBaseModel = z.object({
  id: z.string(),
  provider: z.string(),
  externalId: z.string(),
  userId: z.string(),
})

export interface CompleteExternalAccount extends z.infer<typeof ExternalAccountBaseModel> {
  user: CompleteUser
}

/**
 * RelatedExternalAccountBaseModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedExternalAccountBaseModel: z.ZodSchema<CompleteExternalAccount> = z.lazy(() => ExternalAccountBaseModel.extend({
  user: RelatedUserBaseModel,
}))
