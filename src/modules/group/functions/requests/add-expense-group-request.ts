import { z } from "zod";

export const addExpenseGroupRequest = z.object({
    groupId: z.string().uuid(),
    expenseName: z.string(),
    amount: z.number(),
    payerId: z.string().uuid(),
    splitWithIds: z.array(z.string().uuid()).optional()
});

export type AddExpenseGroupRequest = z.infer<typeof addExpenseGroupRequest>;