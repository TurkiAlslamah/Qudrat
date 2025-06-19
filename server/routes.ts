import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertQuestionSchema, insertPassageSchema, insertQuestionAttemptSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Questions routes
  app.get("/api/questions", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const searchTerm = req.query.search as string;
      const typeFilter = req.query.type as string;

      const questions = await storage.getQuestions(limit, offset, searchTerm, typeFilter);
      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch questions", error: error.message });
    }
  });

  app.get("/api/questions/:qNo", async (req, res) => {
    try {
      const qNo = parseInt(req.params.qNo);
      const question = await storage.getQuestion(qNo);
      
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      res.json(question);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch question", error: error.message });
    }
  });

  app.post("/api/questions", async (req, res) => {
    try {
      const questionData = insertQuestionSchema.parse(req.body);
      const question = await storage.createQuestion(questionData);
      res.status(201).json(question);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid question data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create question", error: error.message });
    }
  });

  app.put("/api/questions/:qNo", async (req, res) => {
    try {
      const qNo = parseInt(req.params.qNo);
      const questionData = insertQuestionSchema.partial().parse(req.body);
      const question = await storage.updateQuestion(qNo, questionData);
      res.json(question);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid question data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update question", error: error.message });
    }
  });

  app.delete("/api/questions/:qNo", async (req, res) => {
    try {
      const qNo = parseInt(req.params.qNo);
      await storage.deleteQuestion(qNo);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete question", error: error.message });
    }
  });

  // Passages routes
  app.get("/api/passages", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const passages = await storage.getPassages(limit, offset);
      res.json(passages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch passages", error: error.message });
    }
  });

  app.get("/api/passages/:passageId", async (req, res) => {
    try {
      const passageId = parseInt(req.params.passageId);
      const passage = await storage.getPassage(passageId);
      
      if (!passage) {
        return res.status(404).json({ message: "Passage not found" });
      }
      
      res.json(passage);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch passage", error: error.message });
    }
  });

  app.post("/api/passages", async (req, res) => {
    try {
      const passageData = insertPassageSchema.parse(req.body);
      const passage = await storage.createPassage(passageData);
      res.status(201).json(passage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid passage data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create passage", error: error.message });
    }
  });

  app.put("/api/passages/:passageId", async (req, res) => {
    try {
      const passageId = parseInt(req.params.passageId);
      const passageData = insertPassageSchema.partial().parse(req.body);
      const passage = await storage.updatePassage(passageId, passageData);
      res.json(passage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid passage data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update passage", error: error.message });
    }
  });

  app.delete("/api/passages/:passageId", async (req, res) => {
    try {
      const passageId = parseInt(req.params.passageId);
      await storage.deletePassage(passageId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete passage", error: error.message });
    }
  });

  // Question types and internal types routes
  app.get("/api/question-types", async (req, res) => {
    try {
      const questionTypes = await storage.getQuestionTypes();
      res.json(questionTypes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch question types", error: error.message });
    }
  });

  app.get("/api/internal-types", async (req, res) => {
    try {
      const typeId = req.query.typeId ? parseInt(req.query.typeId as string) : undefined;
      const internalTypes = await storage.getInternalTypes(typeId);
      res.json(internalTypes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch internal types", error: error.message });
    }
  });

  // Question attempts route
  app.post("/api/question-attempts", async (req, res) => {
    try {
      const attemptData = insertQuestionAttemptSchema.parse(req.body);
      const attempt = await storage.createQuestionAttempt(attemptData);
      res.status(201).json(attempt);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid attempt data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create attempt", error: error.message });
    }
  });

  // Dashboard stats route
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats", error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
