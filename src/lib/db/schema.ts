import { relations } from 'drizzle-orm'
import { integer, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core'

export const secrets = pgTable('secrets', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 50 }),
  value: text('value').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('user'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
})

export const clusters = pgTable('clusters', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const clusterMembers = pgTable('cluster_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  clusterId: integer('cluster_id')
    .notNull()
    .references(() => clusters.id),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
})

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  clusterId: integer('cluster_id')
    .notNull()
    .references(() => clusters.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
})

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  clusterId: integer('cluster_id')
    .notNull()
    .references(() => clusters.id),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: integer('invited_by')
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
})

export const clustersRelations = relations(clusters, ({ many }) => ({
  clusterMembers: many(clusterMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}))

export const usersRelations = relations(users, ({ many }) => ({
  clusterMembers: many(clusterMembers),
  invitationsSent: many(invitations),
}))

export const invitationsRelations = relations(invitations, ({ one }) => ({
  cluster: one(clusters, {
    fields: [invitations.clusterId],
    references: [clusters.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}))

export const clusterMembersRelations = relations(clusterMembers, ({ one }) => ({
  user: one(users, {
    fields: [clusterMembers.userId],
    references: [users.id],
  }),
  cluster: one(clusters, {
    fields: [clusterMembers.clusterId],
    references: [clusters.id],
  }),
}))

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  cluster: one(clusters, {
    fields: [activityLogs.clusterId],
    references: [clusters.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}))

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Cluster = typeof clusters.$inferSelect
export type NewCluster = typeof clusters.$inferInsert
export type ClusterMember = typeof clusterMembers.$inferSelect
export type NewClusterMember = typeof clusterMembers.$inferInsert
export type ActivityLog = typeof activityLogs.$inferSelect
export type NewActivityLog = typeof activityLogs.$inferInsert
export type Invitation = typeof invitations.$inferSelect
export type NewInvitation = typeof invitations.$inferInsert
export type ClusterDataWithMembers = Cluster & {
  clusterMembers: (ClusterMember & {
    user: Pick<User, 'id' | 'name' | 'email'>
  })[]
}

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_CLUSTER = 'CREATE_CLUSTER',
  REMOVE_CLUSTER_MEMBER = 'REMOVE_CLUSTER_MEMBER',
  INVITE_CLUSTER_MEMBER = 'INVITE_CLUSTER_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
}
