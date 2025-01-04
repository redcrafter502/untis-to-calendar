import { relations } from 'drizzle-orm/relations'
import {
  users,
  untisAccesses,
  publicUntisAccesses,
  privateUntisAccesses,
} from '@/db/schema'

export const untisAccessesRelations = relations(
  untisAccesses,
  ({ one, many }) => ({
    user: one(users, {
      fields: [untisAccesses.userId],
      references: [users.userId],
    }),
    publicUntisAccesses: many(publicUntisAccesses),
    privateUntisAccesses: many(privateUntisAccesses),
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

export const privateUntisAccessesRelations = relations(
  privateUntisAccesses,
  ({ one }) => ({
    untisAccess: one(untisAccesses, {
      fields: [privateUntisAccesses.untisAccessId],
      references: [untisAccesses.untisAccessId],
    }),
  }),
)
