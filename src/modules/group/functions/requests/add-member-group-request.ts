import { z } from "zod";

export const addMemberGroupRequest = z.object({
    groupId: z.string().uuid(),
    memberName: z.string(),
    memberEmail: z.string().email(),
});

export type AddMemberGroupRequest = z.infer<typeof addMemberGroupRequest>;