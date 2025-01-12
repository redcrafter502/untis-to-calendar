import { relations } from 'drizzle-orm/relations'
import {
  users,
  untisAccesses,
  publicUntisAccesses,
  passwordUntisAccesses,
  secretUntisAccesses,
} from '@/db/schema'

export const untisAccessesRelations = relations(
  untisAccesses,
  ({ one, many }) => ({
    user: one(users, {
      fields: [untisAccesses.userId],
      references: [users.userId],
    }),
    publicUntisAccesses: many(publicUntisAccesses),
    passwordUntisAccesses: many(passwordUntisAccesses),
    secretUntisAccesses: many(secretUntisAccesses),
  }),
)

export const usersRelations = relations(users, ({ many }) => ({
  untisAccesses: many(untisAccesses),
}))

export const publicUntisAccessesRelations = relations(
  publicUntisAccesses,
  ({ one }) => ({
    untisAccess: one(untisAccesses, {
      fields: [publicUntisAccesses.untisAccessId],
      references: [untisAccesses.untisAccessId],
    }),
  }),
)

export const passwordUntisAccessesRelations = relations(
  passwordUntisAccesses,
  ({ one }) => ({
    untisAccess: one(untisAccesses, {
      fields: [passwordUntisAccesses.untisAccessId],
      references: [untisAccesses.untisAccessId],
    }),
  }),
)

export const secretUntisAccessesRelations = relations(
  secretUntisAccesses,
  ({ one }) => ({
    untisAccess: one(untisAccesses, {
      fields: [secretUntisAccesses.untisAccessId],
      references: [untisAccesses.untisAccessId],
    }),
  }),
)
