import * as z from "zod"
import { CompleteListing, RelatedListingBaseModel } from "./index"

export const UploadedPhotoBaseModel = z.object({
  id: z.string(),
  url: z.string(),
  key: z.string(),
  name: z.string(),
  listingId: z.string().nullish(),
})

export interface CompleteUploadedPhoto extends z.infer<typeof UploadedPhotoBaseModel> {
  Listing?: CompleteListing | null
}

/**
 * RelatedUploadedPhotoBaseModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedUploadedPhotoBaseModel: z.ZodSchema<CompleteUploadedPhoto> = z.lazy(() => UploadedPhotoBaseModel.extend({
  Listing: RelatedListingBaseModel.nullish(),
}))
