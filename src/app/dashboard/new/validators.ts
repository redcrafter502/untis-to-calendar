import { type } from "arktype";

export const formSchema = type({
  name: "string > 0",
  timezone: "string > 0",
  domain: "string > 0",
  school: "string > 0",
  authType: "'public' | 'password' | 'secret'",
  classId: "string",
  username: "string",
  password: "string",
  secret: "string",
});
