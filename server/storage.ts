import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, desc, and, like, or, sql, count } from "drizzle-orm";
import { 
  questions, 
  questionTypes, 
  internalTypes, 
  passages, 
  questionAttempts,
  type InsertQuestion,
  type InsertPassage,
  type InsertQuestionAttempt,
  type Question,
  type Passage,
  type QuestionDetails,
  type DashboardStats
} from "@shared/schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const client = neon(connectionString);
const db = drizzle(client);

export interface IStorage {
  // Questions
  getQuestions(limit?: number, offset?: number, searchTerm?: string, typeFilter?: string): Promise<QuestionDetails[]>;
  getQuestion(qNo: number): Promise<QuestionDetails | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  updateQuestion(qNo: number, question: Partial<InsertQuestion>): Promise<Question>;
  deleteQuestion(qNo: number): Promise<void>;
  
  // Passages
  getPassages(limit?: number, offset?: number): Promise<Passage[]>;
  getPassage(passageId: number): Promise<Passage | undefined>;
  createPassage(passage: InsertPassage): Promise<Passage>;
  updatePassage(passageId: number, passage: Partial<InsertPassage>): Promise<Passage>;
  deletePassage(passageId: number): Promise<void>;
  
  // Question Types and Internal Types
  getQuestionTypes(): Promise<typeof questionTypes.$inferSelect[]>;
  getInternalTypes(typeId?: number): Promise<typeof internalTypes.$inferSelect[]>;
  
  // Attempts
  createQuestionAttempt(attempt: InsertQuestionAttempt): Promise<typeof questionAttempts.$inferSelect>;
  
  // Dashboard Stats
  getDashboardStats(): Promise<DashboardStats>;
}

export class DatabaseStorage implements IStorage {
  async getQuestions(limit = 50, offset = 0, searchTerm?: string, typeFilter?: string): Promise<QuestionDetails[]> {
    let baseQuery = db
      .select({
        qNo: questions.qNo,
        questionTitle: questions.questionTitle,
        questionText: questions.questionText,
        questionImage: questions.questionImage,
        mcA: questions.mcA,
        mcB: questions.mcB,
        mcC: questions.mcC,
        mcD: questions.mcD,
        mcCorrect: questions.mcCorrect,
        typeId: questions.typeId,
        internalTypeId: questions.internalTypeId,
        passageId: questions.passageId,
        questionOrder: questions.questionOrder,
        avgDifficulty: questions.avgDifficulty,
        totalAttempts: questions.totalAttempts,
        correctAttempts: questions.correctAttempts,
        explanationImage: questions.explanationImage,
        hintImage: questions.hintImage,
        tags: questions.tags,
        createdAt: questions.createdAt,
        updatedAt: questions.updatedAt,
        status: questions.status,
        typeName: questionTypes.typeName,
        internalName: internalTypes.internalName,
        passageTitle: passages.passageTitle,
        passageImage: passages.passageImage
      })
      .from(questions)
      .innerJoin(questionTypes, eq(questions.typeId, questionTypes.typeId))
      .innerJoin(internalTypes, eq(questions.internalTypeId, internalTypes.internalTypeId))
      .leftJoin(passages, eq(questions.passageId, passages.passageId));

    // Apply filters
    if (searchTerm && typeFilter && typeFilter !== 'all') {
      const results = await baseQuery
        .where(and(
          or(
            like(questions.questionText, `%${searchTerm}%`),
            like(questions.questionTitle, `%${searchTerm}%`)
          ),
          eq(questionTypes.typeName, typeFilter)
        ))
        .orderBy(desc(questions.qNo))
        .limit(limit)
        .offset(offset);
      
      return results.map(row => ({
        ...row,
        passageTitle: row.passageTitle || undefined,
        passageImage: row.passageImage || undefined
      }));
    } else if (searchTerm) {
      const results = await baseQuery
        .where(
          or(
            like(questions.questionText, `%${searchTerm}%`),
            like(questions.questionTitle, `%${searchTerm}%`)
          )
        )
        .orderBy(desc(questions.qNo))
        .limit(limit)
        .offset(offset);
      
      return results.map(row => ({
        ...row,
        passageTitle: row.passageTitle || undefined,
        passageImage: row.passageImage || undefined
      }));
    } else if (typeFilter && typeFilter !== 'all') {
      const results = await baseQuery
        .where(eq(questionTypes.typeName, typeFilter))
        .orderBy(desc(questions.qNo))
        .limit(limit)
        .offset(offset);
      
      return results.map(row => ({
        ...row,
        passageTitle: row.passageTitle || undefined,
        passageImage: row.passageImage || undefined
      }));
    }

    const results = await baseQuery
      .orderBy(desc(questions.qNo))
      .limit(limit)
      .offset(offset);

    return results.map(row => ({
      ...row,
      passageTitle: row.passageTitle || undefined,
      passageImage: row.passageImage || undefined
    }));
  }

  async getQuestion(qNo: number): Promise<QuestionDetails | undefined> {
    const result = await db
      .select({
        qNo: questions.qNo,
        questionTitle: questions.questionTitle,
        questionText: questions.questionText,
        questionImage: questions.questionImage,
        mcA: questions.mcA,
        mcB: questions.mcB,
        mcC: questions.mcC,
        mcD: questions.mcD,
        mcCorrect: questions.mcCorrect,
        typeId: questions.typeId,
        internalTypeId: questions.internalTypeId,
        passageId: questions.passageId,
        questionOrder: questions.questionOrder,
        avgDifficulty: questions.avgDifficulty,
        totalAttempts: questions.totalAttempts,
        correctAttempts: questions.correctAttempts,
        explanationImage: questions.explanationImage,
        hintImage: questions.hintImage,
        tags: questions.tags,
        createdAt: questions.createdAt,
        updatedAt: questions.updatedAt,
        status: questions.status,
        typeName: questionTypes.typeName,
        internalName: internalTypes.internalName,
        passageTitle: passages.passageTitle,
        passageImage: passages.passageImage
      })
      .from(questions)
      .innerJoin(questionTypes, eq(questions.typeId, questionTypes.typeId))
      .innerJoin(internalTypes, eq(questions.internalTypeId, internalTypes.internalTypeId))
      .leftJoin(passages, eq(questions.passageId, passages.passageId))
      .where(eq(questions.qNo, qNo))
      .limit(1);

    if (result[0]) {
      return {
        ...result[0],
        passageTitle: result[0].passageTitle || undefined,
        passageImage: result[0].passageImage || undefined
      };
    }

    return undefined;
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const result = await db.insert(questions).values(question).returning();
    return result[0];
  }

  async updateQuestion(qNo: number, question: Partial<InsertQuestion>): Promise<Question> {
    const result = await db
      .update(questions)
      .set({ ...question, updatedAt: new Date() })
      .where(eq(questions.qNo, qNo))
      .returning();
    return result[0];
  }

  async deleteQuestion(qNo: number): Promise<void> {
    await db.delete(questions).where(eq(questions.qNo, qNo));
  }

  async getPassages(limit = 50, offset = 0): Promise<Passage[]> {
    return await db
      .select()
      .from(passages)
      .orderBy(desc(passages.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getPassage(passageId: number): Promise<Passage | undefined> {
    const result = await db
      .select()
      .from(passages)
      .where(eq(passages.passageId, passageId))
      .limit(1);
    return result[0] || undefined;
  }

  async createPassage(passage: InsertPassage): Promise<Passage> {
    const result = await db.insert(passages).values(passage).returning();
    return result[0];
  }

  async updatePassage(passageId: number, passage: Partial<InsertPassage>): Promise<Passage> {
    const result = await db
      .update(passages)
      .set({ ...passage, updatedAt: new Date() })
      .where(eq(passages.passageId, passageId))
      .returning();
    return result[0];
  }

  async deletePassage(passageId: number): Promise<void> {
    await db.delete(passages).where(eq(passages.passageId, passageId));
  }

  async getQuestionTypes(): Promise<typeof questionTypes.$inferSelect[]> {
    return await db.select().from(questionTypes).orderBy(questionTypes.typeName);
  }

  async getInternalTypes(typeId?: number): Promise<typeof internalTypes.$inferSelect[]> {
    let baseQuery = db.select().from(internalTypes);
    
    if (typeId) {
      const results = await baseQuery.where(eq(internalTypes.typeId, typeId)).orderBy(internalTypes.internalName);
      return results;
    }
    
    const results = await baseQuery.orderBy(internalTypes.internalName);
    return results;
  }

  async createQuestionAttempt(attempt: InsertQuestionAttempt): Promise<typeof questionAttempts.$inferSelect> {
    const result = await db.insert(questionAttempts).values(attempt).returning();
    return result[0];
  }

  async getDashboardStats(): Promise<DashboardStats> {
    // Get total questions count
    const totalQuestionsResult = await db
      .select({ count: count() })
      .from(questions);
    
    // Get active questions count
    const activeQuestionsResult = await db
      .select({ count: count() })
      .from(questions)
      .where(eq(questions.status, 'active'));
    
    // Get total passages count
    const totalPassagesResult = await db
      .select({ count: count() })
      .from(passages);
    
    // Get total attempts count
    const totalAttemptsResult = await db
      .select({ count: count() })
      .from(questionAttempts);
    
    // Get verbal questions count
    const verbalQuestionsResult = await db
      .select({ count: count() })
      .from(questions)
      .innerJoin(questionTypes, eq(questions.typeId, questionTypes.typeId))
      .where(eq(questionTypes.typeName, 'لفظي'));
    
    // Get quantitative questions count
    const quantQuestionsResult = await db
      .select({ count: count() })
      .from(questions)
      .innerJoin(questionTypes, eq(questions.typeId, questionTypes.typeId))
      .where(eq(questionTypes.typeName, 'كمي'));
    
    // Get reading comprehension count
    const readingComprehensionResult = await db
      .select({ count: count() })
      .from(questions)
      .innerJoin(internalTypes, eq(questions.internalTypeId, internalTypes.internalTypeId))
      .where(eq(internalTypes.internalName, 'استيعاب المقروء'));
    
    // Get verbal analogies count
    const verbalAnalogiesResult = await db
      .select({ count: count() })
      .from(questions)
      .innerJoin(internalTypes, eq(questions.internalTypeId, internalTypes.internalTypeId))
      .where(eq(internalTypes.internalName, 'التناظر اللفظي'));
    
    // Get sentence completion count
    const sentenceCompletionResult = await db
      .select({ count: count() })
      .from(questions)
      .innerJoin(internalTypes, eq(questions.internalTypeId, internalTypes.internalTypeId))
      .where(eq(internalTypes.internalName, 'إكمال الجمل'));
    
    // Get contextual error count
    const contextualErrorResult = await db
      .select({ count: count() })
      .from(questions)
      .innerJoin(internalTypes, eq(questions.internalTypeId, internalTypes.internalTypeId))
      .where(eq(internalTypes.internalName, 'الخطأ السياقي'));

    return {
      totalQuestions: totalQuestionsResult[0]?.count || 0,
      activeQuestions: activeQuestionsResult[0]?.count || 0,
      totalPassages: totalPassagesResult[0]?.count || 0,
      totalAttempts: totalAttemptsResult[0]?.count || 0,
      verbalQuestions: verbalQuestionsResult[0]?.count || 0,
      quantQuestions: quantQuestionsResult[0]?.count || 0,
      readingComprehension: readingComprehensionResult[0]?.count || 0,
      verbalAnalogies: verbalAnalogiesResult[0]?.count || 0,
      sentenceCompletion: sentenceCompletionResult[0]?.count || 0,
      contextualError: contextualErrorResult[0]?.count || 0
    };
  }
}

export const storage = new DatabaseStorage();
