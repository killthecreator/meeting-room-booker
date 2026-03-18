import z from "zod";

export const googleAuthSchema = z
  .object({
    sub: z.string(),
    name: z.string(),
    email: z.email(),
    picture: z.url(),
  })
  .transform(({ sub: id, ...rest }) => ({ id, ...rest }));

export const authUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  picture: z.url(),
});
