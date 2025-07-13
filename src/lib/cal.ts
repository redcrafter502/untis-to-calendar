import {
  type ExamsForCurrentSchoolYear,
  type LessonsWithHomework,
} from "@/lib/untis";
import {
  ICalEventBusyStatus,
  ICalEventStatus,
  ICalEventTransparency,
} from "ical-generator";

export function getExamCalEvents(exams: ExamsForCurrentSchoolYear) {
  return exams.map((exam) => {
    if (exam.startTime.isErr()) return;
    if (exam.endTime.isErr()) return;
    const summary = exam.exam.name
      ? `${exam.exam.name} (Exam)`
      : "No exam title found";
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

export function getLessonCalEvents(lessons: LessonsWithHomework) {
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
      attachments: [
        ...lesson.homeworkStart.flatMap((v) => v.attachments as string[]),
        ...lesson.homeworkEnd.flatMap((v) => v.attachments as string[]),
      ],
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
