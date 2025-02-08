import { pgTable, text } from "drizzle-orm/pg-core"

export const products = pgTable("products", {
	id: text().primaryKey().notNull(),
	name: text(),
	description: text(),
	category: text(),
});
