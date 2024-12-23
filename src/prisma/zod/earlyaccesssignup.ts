import * as z from "zod"

export const EarlyAccessSignupBaseModel = z.object({
  id: z.string(),
  email: z.string(),
  createdAt: z.date(),
})
