import { AccessById, QUERIES } from "@/db/queries";
import {
  type ExamsForCurrentSchoolYear,
  getUntis,
  type LessonsWithHomework,
} from "@/lib/untis";
import ical, {
  ICalEventBusyStatus,
  ICalEventStatus,
  ICalEventTransparency,
} from "ical-generator";

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

  const calendar = ical({ name: data.value.name });

  if (data.value.authType === "password" || data.value.authType === "secret") {
    const exams = await untis.getExamsForCurrentSchoolyear(session.value);
    if (exams.isErr()) {
      await untis.logout(session.value);
      return new Response("Failed to get exams", { status: 500 });
    }
    getExamCalEvents(exams.value).forEach((event) => {
      if (!event) return;
      calendar.createEvent(event);
    });
  }

  const { startOfCurrentWeek, endOfNextWeek } = getCurrentAndNextWeekRange();
  const lessons = await untis.getTimetableWithHomework(
    startOfCurrentWeek,
    endOfNextWeek,
    session.value,
  );
  if (lessons.isErr()) {
    await untis.logout(session.value);
    return new Response("Failed to get lessons", { status: 500 });
  }
  getLessonCalEvents(lessons.value).forEach((event) => {
    if (!event) return;
    calendar.createEvent(event);
  });

  await untis.logout(session.value);

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

function getExamCalEvents(exams: ExamsForCurrentSchoolYear) {
  return exams.map((exam) => {
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

    return {
      start: exam.startTime.value,
      end: exam.endTime.value,
      summary,
      description,
      location,
    };
  });
}

function getLessonCalEvents(lessons: LessonsWithHomework) {
  return lessons.map((lesson) => {
    if (lesson.startTime.isErr()) return;
    if (lesson.endTime.isErr()) return;
    const summary = [
      ...(lesson.lesson.su ? lesson.lesson.su.map((v) => v.name) : []),
      lesson.lesson.lstext,
    ]
      .filter((v) => v)
      .join(", ");
    const location = [
      ...(lesson.lesson.ro
        ? lesson.lesson.ro.map((v) => {
            if (!v.orgname) return `${v.longname} - ${v.name}`;
            return `${v.longname} - ${v.name} (${v.orgname})`;
          })
        : []),
    ].join(", ");
    const description = [
      summary,
      (lesson.lesson.kl ? lesson.lesson.kl.map((v) => v.name) : []).join(", "),
      lesson.lesson.activityType,
      lesson.lesson.info,
      lesson.lesson.substText,
      lesson.homeworkEnd.length > 0 ? "Homework to this lesson:" : undefined,
      lesson.homeworkEnd.map((v) => {
        if (!v.remark) return `${v.completed ? "✅" : "-"} ${v.text}`;
        return `${v.completed ? "✅" : "-"} ${v.text} - ${v.remark}`;
      }),
      lesson.homeworkStart.length > 0
        ? "Homework from this lesson:"
        : undefined,
      lesson.homeworkStart.map((v) => {
        if (!v.remark) return `${v.completed ? "✅" : "-"} ${v.text}`;
        return `${v.completed ? "✅" : "-"} ${v.text} - ${v.remark}`;
      }),
    ]
      .filter((v) => v)
      .join("\n");

    const summaryWithInfoMark =
      lesson.lesson.info ||
      lesson.homeworkStart.length > 0 ||
      lesson.homeworkEnd.length > 0
        ? `ℹ️ ${summary}`
        : summary;

    return {
      start: lesson.startTime.value,
      end: lesson.endTime.value,
      summary: summaryWithInfoMark,
      description,
      location,
      busystatus:
        lesson.lesson.code === "cancelled"
          ? ICalEventBusyStatus.FREE
          : ICalEventBusyStatus.BUSY,
      status:
        lesson.lesson.code === "cancelled"
          ? ICalEventStatus.CANCELLED
          : ICalEventStatus.CONFIRMED,
      transparency:
        lesson.lesson.code === "cancelled"
          ? ICalEventTransparency.TRANSPARENT
          : ICalEventTransparency.OPAQUE,
    };
  });
}

const getCurrentAndNextWeekRange = () => {
  const now = new Date();

  // Calculate the start of the current week (Monday)
  const startOfCurrentWeek = new Date(now);
  // !!!! TODO: This is not correct, it should be Monday of the current week !!!! CHANGE THIS to + 1
  startOfCurrentWeek.setDate(now.getDate() - now.getDay() + 1); // Monday

  // Calculate the end of the next week (Sunday)
  const endOfNextWeek = new Date(startOfCurrentWeek);
  endOfNextWeek.setDate(startOfCurrentWeek.getDate() + 13); // Next week's Sunday

  return { startOfCurrentWeek, endOfNextWeek };
};
