import { AccessById, QUERIES } from "@/db/queries";
import { getUntis } from "@/lib/untis";
import ical from "ical-generator";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const data = await QUERIES.getAccessById(id);
  if (data.isErr()) return new Response("Access not found", { status: 404 });
  const untis = getUntis({
    url: data.value.domain,
    school: data.value.school,
    timezone: "Europe/Berlin",
    auth: getAuth(data.value),
  });
  const session = await untis.login();
  if (session.isErr())
    return new Response("Login to Untis failed", { status: 500 });
  const exams = await untis.getExamsForCurrentSchoolyear(session.value);
  await untis.logout(session.value);
  if (exams.isErr())
    return new Response("Failed to get exams", { status: 500 });

  const calendar = ical({ name: data.value.name });
  if (data.value.authType === "password" || data.value.authType === "secret") {
    exams.value.forEach((exam) => {
      if (exam.startTime.isErr()) return;
      if (exam.endTime.isErr()) return;
      const summary = exam.exam.name
        ? `${exam.exam.name} (Exam)`
        : "No exam title founs";
      const location = [exam.exam.location, ...exam.exam.rooms]
        .filter((v) => v)
        .join(", ");
      const description = [
        exam.exam.examType,
        exam.exam.subject,
        ...exam.exam.teachers.join(", "),
        exam.exam.grade ? `Grade: ${exam.exam.grade}` : undefined,
        exam.exam.text,
      ]
        .filter((v) => v)
        .join("\n");

      calendar.createEvent({
        start: exam.startTime.value,
        end: exam.endTime.value,
        summary,
        description,
        location,
      });
    });
  }

  const startTime = new Date();
  const endTime = new Date();
  endTime.setHours(startTime.getHours() + 1);
  calendar.createEvent({
    start: startTime,
    end: endTime,
    summary: "Example Event",
    description: "It works ;)",
    location: "my room",
    url: "http://sebbo.net/",
  });

  return new Response(calendar.toString(), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${data.value.name}.ics"`,
    },
  });
}

function getAuth(access: AccessById):
  | {
      type: "public";
      classId: number;
    }
  | {
      type: "password";
      username: string;
      password: string;
    }
  | {
      type: "secret";
      username: string;
      secret: string;
    } {
  switch (access.authType) {
    case "public":
      return { type: "public", classId: access.classId };
    case "password":
      return {
        type: "password",
        username: access.username,
        password: access.password,
      };
    case "secret":
      return {
        type: "secret",
        username: access.username,
        secret: access.secret,
      };
  }
}
