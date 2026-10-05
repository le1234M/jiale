import { sql } from "drizzle-orm";
import { pgTable, serial, timestamp, varchar, boolean, integer, index } from "drizzle-orm/pg-core";

export const healthCheck = pgTable("health_check", {
  id: serial().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const merchants = pgTable(
  "merchants",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 128 }).notNull(),
    password: varchar("password", { length: 64 }).notNull(),
    expiry_date: timestamp("expiry_date", { withTimezone: true }).notNull(),
    quota_total: integer("quota_total"),
    quota_used: integer("quota_used").default(0).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    disabled: boolean("disabled").default(false).notNull(),
    note: varchar("note", { length: 500 }),
    // 默认门店信息（管理员在创建/编辑商家时预填，商家登录后自动带出）
    category_l1: varchar("category_l1", { length: 64 }),
    category_l2: varchar("category_l2", { length: 64 }),
    store_name: varchar("store_name", { length: 256 }),
    selling_points: varchar("selling_points", { length: 1024 }),
    price_range: varchar("price_range", { length: 32 }),
    audience: varchar("audience", { length: 256 }),
    location: varchar("location", { length: 256 }),
  },
  (table) => [
    index("merchants_password_idx").on(table.password),
    index("merchants_expiry_idx").on(table.expiry_date),
  ]
);