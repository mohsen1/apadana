import * as z from "zod"

export const LocalEmailBaseModel = z.object({
  id: z.string(),
  to: z.string(),
  from: z.string(),
  subject: z.string(),
  html: z.string(),
  createdAt: z.date(),
})
