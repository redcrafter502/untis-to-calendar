import "server-only";
import { redis } from "./redis";
import { type Result, ok, err } from "neverthrow";
import { tryCatch } from "@/lib/try-catch";
import { type } from "arktype";

const AccessByIdBase = type({
  name: "string",
  type: "'ics'",
  domain: "string",
  school: "string",
});

const AccessById = type(AccessByIdBase, "&", {
  authType: "'public' | 'password' | 'secret'",
});

const AccessByIdPublic = type(AccessByIdBase, "&", {
  authType: "'public'",
  classId: "number",
});

const AccessByIdPassword = type(AccessByIdBase, "&", {
  authType: "'password'",
  username: "string",
  password: "string",
});

const AccessByIdSecret = type(AccessByIdBase, "&", {
  authType: "'secret'",
  username: "string",
  secret: "string",
});

export const QUERIES = {
  async getAccessById(
    id: string,
  ): Promise<
    Result<
      | typeof AccessByIdPublic.infer
      | typeof AccessByIdPassword.infer
      | typeof AccessByIdSecret.infer,
      string
    >
  > {
    const data = await tryCatch(
      redis.hgetall(`untis-to-calendar:access:${id}`),
    );
    if (data.isErr()) return err(data.error.message);
    if (data.value === null) return err("No access found");
    const validatedData = AccessById(data.value);
    if (validatedData instanceof type.errors) return err(validatedData.summary);
    if (validatedData.authType === "public") {
      const validatedDataPublic = AccessByIdPublic(validatedData);
      if (validatedDataPublic instanceof type.errors)
        return err(validatedDataPublic.summary);
      return ok(validatedDataPublic);
    }
    if (validatedData.authType === "password") {
      const validatedDataPassword = AccessByIdPassword(validatedData);
      if (validatedDataPassword instanceof type.errors)
        return err(validatedDataPassword.summary);
      return ok(validatedDataPassword);
    }
    if (validatedData.authType === "secret") {
      const validatedDataSecret = AccessByIdSecret(validatedData);
      if (validatedDataSecret instanceof type.errors)
        return err(validatedDataSecret.summary);
      return ok(validatedDataSecret);
    }
    return err("Unknown auth type");
  },
};
