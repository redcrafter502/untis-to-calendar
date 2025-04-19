import "server-only";
import { redis } from "./redis";
import { type Result, ok, err } from "neverthrow";
import { tryCatch } from "@/lib/try-catch";
import { type } from "arktype";

const AccessByIdBase = type({
  name: "string",
  domain: "string",
  school: "string",
  timezone: "string",
});

const AccessById = type(AccessByIdBase, "&", {
  authType: "'public' | 'password' | 'secret'",
});

export const AccessByIdPublic = type(AccessByIdBase, "&", {
  authType: "'public'",
  classId: "number",
});

export const AccessByIdPassword = type(AccessByIdBase, "&", {
  authType: "'password'",
  username: "string",
  password: "string",
});

export const AccessByIdSecret = type(AccessByIdBase, "&", {
  authType: "'secret'",
  username: "string",
  secret: "string",
});

export type AccessById =
  | typeof AccessByIdPublic.infer
  | typeof AccessByIdPassword.infer
  | typeof AccessByIdSecret.infer;

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
      redis.hgetall(`untis-to-calendar:access:ics:${id}`),
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

export const MUTATIONS = {
  async addAccess(
    access: AccessById,
    id: string,
  ): Promise<Result<void, string>> {
    const result = await tryCatch(
      redis.hset(`untis-to-calendar:access:ics:${id}`, access),
    );
    if (result.isErr()) return err(result.error.message);
    return ok();
  },
  async deleteAccess(id: string): Promise<Result<void, string>> {
    const result = await tryCatch(
      redis.del(`untis-to-calendar:access:ics:${id}`),
    );
    if (result.isErr()) return err(result.error.message);
    return ok();
  },
};
