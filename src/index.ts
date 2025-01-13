import { z } from "zod";

type SchemaFactory<I, Z extends z.ZodTypeAny> = {
  $type: z.infer<Z>;
  (input: I): Z;
  (): Z;
};

export function schemaFactory<I, Z extends z.ZodTypeAny>(
  factory: ((input: I) => Z) | (() => Z)
): SchemaFactory<I, Z> {
  return factory as SchemaFactory<I, Z>;
}
