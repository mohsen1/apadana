import * as z from "zod"
import { Permission } from "@prisma/client"
import { CompleteUser, RelatedUserBaseModel } from "./index"

export const UserPermissionBaseModel = z.object({
  id: z.number().int(),
  permission: z.nativeEnum(Permission),
  userId: z.string(),
})

export interface CompleteUserPermission extends z.infer<typeof UserPermissionBaseModel> {
  user: CompleteUser
}

/**
 * RelatedUserPermissionBaseModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedUserPermissionBaseModel: z.ZodSchema<CompleteUserPermission> = z.lazy(() => UserPermissionBaseModel.extend({
  user: RelatedUserBaseModel,
}))
