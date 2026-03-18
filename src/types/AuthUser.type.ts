import type z from "zod";
import { authUserSchema } from "../schemas/authUser";

export type AuthUser = z.infer<typeof authUserSchema>;
