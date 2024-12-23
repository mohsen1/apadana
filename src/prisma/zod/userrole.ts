import * as z from "zod"
import { Role } from "@prisma/client"
import { CompleteUser, RelatedUserBaseModel } from "./index"

export const UserRoleBaseModel = z.object({
  id: z.number().int(),
  role: z.nativeEnum(Role),
  userId: z.string(),
})

export interface CompleteUserRole extends z.infer<typeof UserRoleBaseModel> {
  user: CompleteUser
}

/**
 * RelatedUserRoleBaseModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedUserRoleBaseModel: z.ZodSchema<CompleteUserRole> = z.lazy(() => UserRoleBaseModel.extend({
  user: RelatedUserBaseModel,
}))
