import { pgTable, text, serial, integer, boolean, decimal, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Question Types Table (لفظي/كمي)
export const questionTypes = pgTable("question_types", {
  typeId: serial("type_id").primaryKey(),
  typeName: varchar("type_name", { length: 50 }).notNull().unique(),
  typeNameEn: varchar("type_name_en", { length: 50 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// Internal Types Table (subtopics)
export const internalTypes = pgTable("internal_types", {
  internalTypeId: serial("internal_type_id").primaryKey(),
  typeId: integer("type_id").notNull().references(() => questionTypes.typeId, { onDelete: "cascade" }),
  internalName: varchar("internal_name", { length: 100 }).notNull(),
  internalNameEn: varchar("internal_name_en", { length: 100 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// Passages Table
export const passages = pgTable("passages", {
  passageId: serial("passage_id").primaryKey(),
  passageTitle: varchar("passage_title", { length: 200 }),
  passageImage: varchar("passage_image", { length: 500 }).notNull(),
  avgDifficulty: decimal("avg_difficulty", { precision: 5, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  status: varchar("status", { length: 20 }).default("draft")
});

// Main Questions Table
export const questions = pgTable("questions", {
  qNo: serial("q_no").primaryKey(),
  questionTitle: varchar("question_title", { length: 200 }),
  questionText: text("question_text").notNull(),
  questionImage: varchar("question_image", { length: 500 }),
  mcA: text("mc_a").notNull(),
  mcB: text("mc_b").notNull(),
  mcC: text("mc_c").notNull(),
  mcD: text("mc_d").notNull(),
  mcCorrect: varchar("mc_correct", { length: 1 }).notNull(),
  typeId: integer("type_id").notNull().references(() => questionTypes.typeId, { onDelete: "restrict" }),
  internalTypeId: integer("internal_type_id").notNull().references(() => internalTypes.internalTypeId, { onDelete: "restrict" }),
  passageId: integer("passage_id").references(() => passages.passageId, { onDelete: "cascade" }),
  questionOrder: integer("question_order").default(1),
  avgDifficulty: decimal("avg_difficulty", { precision: 5, scale: 2 }).default("0.00"),
  totalAttempts: integer("total_attempts").default(0),
  correctAttempts: integer("correct_attempts").default(0),
  explanationImage: varchar("explanation_image", { length: 500 }),
  hintImage: varchar("hint_image", { length: 500 }),
  tags: text("tags"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  status: varchar("status", { length: 20 }).default("draft")
});

// Question Attempts Table
export const questionAttempts = pgTable("question_attempts", {
  attemptId: serial("attempt_id").primaryKey(),
  qNo: integer("q_no").notNull().references(() => questions.qNo, { onDelete: "cascade" }),
  studentId: varchar("student_id", { length: 100 }),
  selectedAnswer: varchar("selected_answer", { length: 1 }).notNull(),
  isCorrect: boolean("is_correct").notNull(),
  timeTakenSeconds: integer("time_taken_seconds"),
  attemptDate: timestamp("attempt_date", { withTimezone: true }).defaultNow()
});

// Insert Schemas
export const insertQuestionTypeSchema = createInsertSchema(questionTypes).omit({
  typeId: true,
  createdAt: true
});

export const insertInternalTypeSchema = createInsertSchema(internalTypes).omit({
  internalTypeId: true,
  createdAt: true
});

export const insertPassageSchema = createInsertSchema(passages).omit({
  passageId: true,
  avgDifficulty: true,
  createdAt: true,
  updatedAt: true
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  qNo: true,
  avgDifficulty: true,
  totalAttempts: true,
  correctAttempts: true,
  createdAt: true,
  updatedAt: true
});

export const insertQuestionAttemptSchema = createInsertSchema(questionAttempts).omit({
  attemptId: true,
  attemptDate: true
});

// Types
export type InsertQuestionType = z.infer<typeof insertQuestionTypeSchema>;
export type QuestionType = typeof questionTypes.$inferSelect;

export type InsertInternalType = z.infer<typeof insertInternalTypeSchema>;
export type InternalType = typeof internalTypes.$inferSelect;

export type InsertPassage = z.infer<typeof insertPassageSchema>;
export type Passage = typeof passages.$inferSelect;

export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;

export type InsertQuestionAttempt = z.infer<typeof insertQuestionAttemptSchema>;
export type QuestionAttempt = typeof questionAttempts.$inferSelect;

// Question Details View Type (for joining data)
export type QuestionDetails = Question & {
  typeName: string;
  internalName: string;
  passageTitle?: string;
  passageImage?: string;
};

// Dashboard Stats Type
export type DashboardStats = {
  totalQuestions: number;
  activeQuestions: number;
  totalPassages: number;
  totalAttempts: number;
  verbalQuestions: number;
  quantQuestions: number;
  readingComprehension: number;
  verbalAnalogies: number;
  sentenceCompletion: number;
  contextualError: number;
};
