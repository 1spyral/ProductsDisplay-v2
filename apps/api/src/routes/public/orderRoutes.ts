import { createOrder } from "@/db/queries/orderQueries";
import { publicRateLimitConfig } from "@/routes/shared/rateLimit";
import type { ApiErrorDto, CreateOrderRequestDto } from "@productsdisplay/contracts";
import type { FastifyInstance } from "fastify";
import { z } from "zod";

const orderItemSchema = z.object({
    productId: z.string().trim().min(1),
    quantity: z.coerce.number().int().positive(),
});

const createOrderSchema = z
    .object({
        name: z.string().trim().min(1, "Name is required"),
        email: z
            .string()
            .trim()
            .email("Enter a valid email address")
            .optional()
            .or(z.literal("")),
        phone: z.string().trim().optional().or(z.literal("")),
        additionalComments: z.string().trim().optional().or(z.literal("")),
        items: z.array(orderItemSchema).min(1, "Cart cannot be empty"),
    })
    .superRefine((value, ctx) => {
        if (!value.email && !value.phone) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Provide an email address or phone number",
                path: ["email"],
            });
        }
    });

export async function publicOrderRoutes(app: FastifyInstance): Promise<void> {
    app.post(
        "/orders",
        {
            config: publicRateLimitConfig("createOrder", 15),
        },
        async (request, reply) => {
            const parsed = createOrderSchema.safeParse(request.body);

            if (!parsed.success) {
                const issue = parsed.error.issues[0];
                const message = issue?.message ?? "Invalid order request";
                return reply.code(400).send({
                    error: "Invalid order request",
                    message,
                } satisfies ApiErrorDto);
            }

            const body = parsed.data;
            const id = await createOrder({
                name: body.name.trim(),
                email: body.email?.trim() || null,
                phone: body.phone?.trim() || null,
                additionalComments: body.additionalComments?.trim() || null,
                items: body.items,
            } satisfies CreateOrderRequestDto);

            return reply.code(201).send({ success: true, id });
        }
    );
}
