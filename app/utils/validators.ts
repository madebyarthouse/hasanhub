import { z } from "zod";

export type DurationType = z.infer<typeof DurationValidator>;
export const DurationValidator = z.enum([
  "short",
  "medium",
  "long",
  "extralong",
]);

export type DurationListType = z.infer<typeof DurationListValidator>;
export const DurationListValidator = z.array(DurationValidator, {
  invalid_type_error: "durationList must be an array of strings",
});

export type TimeframeType = z.infer<typeof TimeframeValidator>;
export const TimeframeValidator = z
  .enum([
    "recent", // last 24h
    "week", // last week
    "month", // last month
    "quarter", // last quarter
    "year", // last year
  ])
  .optional()
  .nullable();

export type TimeframeListType = z.infer<typeof TimeframeListValidator>;
export const TimeframeListValidator = z.array(TimeframeValidator, {
  invalid_type_error: "timeframeList must be an array of strings",
});

export type OrderDirectionType = z.infer<typeof OrderDirectionValidator>;
export const OrderDirectionValidator = z.optional(z.enum(["asc", "desc"]));

export type LastVideoIdType = z.infer<typeof LastVideoIdValidator>;
export const LastVideoIdValidator = z.optional(
  z.number({
    invalid_type_error: "lastVideoId must be a number",
  })
);

export type OrderByType = z.infer<typeof OrderByValdiator>;
export const OrderByValdiator = z.optional(z.enum(["publishedAt", "views"]));

export const UrlParamsSchema = z.object({
  durations: z.optional(DurationListValidator),
  timeframe: z.optional(TimeframeValidator),
  order: OrderDirectionValidator,
  by: OrderByValdiator,
  lastVideoId: LastVideoIdValidator,
});
