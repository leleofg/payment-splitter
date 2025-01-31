import { z } from "zod";

export const createGroupRequest = z.object({
    name: z.string()
});

export type CreateGroupRequest = z.infer<typeof createGroupRequest>;