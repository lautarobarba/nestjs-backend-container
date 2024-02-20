import {
  boolean,
  datetime,
  mysqlTable,
  serial,
  text,
  varchar,
} from "drizzle-orm/mysql-core";

export const notes = mysqlTable("notes", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  createdAt: datetime("created_at"),
  updatedAt: datetime("updated_at"),
  deleted: boolean("deleted").default(false),
});

export type Note = typeof notes.$inferSelect; // return type when queried
export type NewNote = typeof notes.$inferInsert; // return type when queried
