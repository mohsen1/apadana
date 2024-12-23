import * as z from "zod"
import { CompleteUser, RelatedUserBaseModel } from "./index"

export const SessionBaseModel = z.object({
  id: z.string(),
  userId: z.string(),
  expiresAt: z.date(),
  createdAt: z.date(),
  lastActive: z.date(),
})

export interface CompleteSession extends z.infer<typeof SessionBaseModel> {
  user: CompleteUser
}

/**
 * RelatedSessionBaseModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedSessionBaseModel: z.ZodSchema<CompleteSession> = z.lazy(() => SessionBaseModel.extend({
  user: RelatedUserBaseModel,
}))
