import { z } from "zod";

export const settleDebtGroupRequest = z.object({
    groupId: z.string().uuid(),
    payerId: z.string().uuid(),
    payeeId: z.string().uuid(),
    amount: z.number(),
});

export type SettleDebtGroupRequest = z.infer<typeof settleDebtGroupRequest>;