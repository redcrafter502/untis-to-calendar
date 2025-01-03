import { pgTable, unique, serial, varchar, timestamp, foreignKey, integer, pgEnum } from "drizzle-orm/pg-core"

export const enumUntisAccessesType = pgEnum("enum_untisAccesses_type", ['public', 'private'])


export const users = pgTable("users", {
	userId: serial().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	unique("users_email_key").on(table.email),
]);

export const untisAccesses = pgTable("untisAccesses", {
	untisAccessId: serial().primaryKey().notNull(),
	userId: integer().notNull(),
	type: enumUntisAccessesType().notNull(),
	name: varchar({ length: 255 }).notNull(),
	urlId: varchar({ length: 255 }).notNull(),
	school: varchar({ length: 255 }).notNull(),
	domain: varchar({ length: 255 }).notNull(),
	timezone: varchar({ length: 255 }).notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "untisAccesses_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	unique("untisAccesses_urlId_key").on(table.urlId),
]);

export const publicUntisAccesses = pgTable("publicUntisAccesses", {
	untisAccessId: integer().primaryKey().notNull(),
	classId: varchar({ length: 255 }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.untisAccessId],
			foreignColumns: [untisAccesses.untisAccessId],
			name: "publicUntisAccesses_untisAccessId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const privateUntisAccesses = pgTable("privateUntisAccesses", {
	untisAccessId: integer().primaryKey().notNull(),
	username: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.untisAccessId],
			foreignColumns: [untisAccesses.untisAccessId],
			name: "privateUntisAccesses_untisAccessId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);
