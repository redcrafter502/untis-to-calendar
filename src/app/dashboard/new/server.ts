"use server";

import { formSchema } from "./validators";
import { type } from "arktype";
import { ok, err, type Result } from "neverthrow";

export async function createAccess(values: typeof formSchema.infer) {
  const validatedValues = formSchema(values);
  if (validatedValues instanceof type.errors)
    return { error: validatedValues.summary };
  console.log(validatedValues);
  return { error: "not implemented" };
}
