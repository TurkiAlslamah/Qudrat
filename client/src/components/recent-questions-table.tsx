import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Edit, Copy, Trash2, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import type { QuestionDetails } from "@shared/schema";

interface RecentQuestionsTableProps {
  onAddQuestion: () => void;
  onEditQuestion: (question: QuestionDetails) => void;
  onDeleteQuestion: (qNo: number) => void;
}

const RecentQuestionsTable = ({ 
  onAddQuestion, 
  onEditQuestion, 
  onDeleteQuestion 
}: RecentQuestionsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);

  const { data: questions = [], isLoading } = useQuery<QuestionDetails[]>({
    queryKey: ['/api/questions', { search: searchTerm, type: typeFilter, limit: 10 }],
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedQuestions(questions.map(q => q.qNo));
    } else {
      setSelectedQuestions([]);
    }
  };

  const handleSelectQuestion = (qNo: number, checked: boolean) => {
    if (checked) {
      setSelectedQuestions([...selectedQuestions, qNo]);
    } else {
      setSelectedQuestions(selectedQuestions.filter(id => id !== qNo));
    }
  };

  const getDifficultyColor = (difficulty: string | null) => {
    const diff = parseFloat(difficulty || "0");
    if (diff >= 70) return "difficulty-easy";
    if (diff >= 40) return "difficulty-medium";
    return "difficulty-hard";
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-800",
      draft: "bg-yellow-100 text-yellow-800",
      inactive: "bg-red-100 text-red-800",
      under_review: "bg-blue-100 text-blue-800"
    };
    
    return variants[status as keyof typeof variants] || variants.draft;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  if (isLoading) {
    return (
      <Card className="bg-white border border-secondary-200">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-8 w-48 bg-secondary-200 rounded animate-pulse" />
            <div className="h-64 w-full bg-secondary-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-secondary-200">
      <div className="px-6 py-4 border-b border-secondary-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-secondary-900">Recent Questions</h3>
          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            {/* Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="لفظي">لفظي</SelectItem>
                <SelectItem value="كمي">كمي</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Add Question Button */}
            <Button onClick={onAddQuestion} className="bg-primary-600 hover:bg-primary-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-secondary-50">
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedQuestions.length === questions.length && questions.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Question</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Attempts</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((question) => (
              <TableRow key={question.qNo} className="hover:bg-secondary-50">
                <TableCell>
                  <Checkbox
                    checked={selectedQuestions.includes(question.qNo)}
                    onCheckedChange={(checked) => handleSelectQuestion(question.qNo, !!checked)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <HelpCircle className="text-secondary-600 h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-secondary-900 truncate">
                        {question.questionTitle || 'Untitled Question'}
                      </p>
                      <p className="text-sm text-secondary-500 truncate">
                        {question.questionText.substring(0, 100)}...
                      </p>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className="text-xs text-secondary-500">Q#{question.qNo}</span>
                        <span className="text-xs text-secondary-300">•</span>
                        <span className="text-xs text-secondary-500">
                          {formatTimeAgo(question.createdAt.toString())}
                        </span>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-secondary-900">
                      {question.typeName}
                    </span>
                    <span className="text-xs text-secondary-500">
                      {question.internalName}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <div className="difficulty-bar w-16">
                      <div 
                        className={`difficulty-fill ${getDifficultyColor(question.avgDifficulty)}`}
                        style={{ width: `${question.avgDifficulty || 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-secondary-900">
                      {question.avgDifficulty || 0}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-secondary-900">
                    <span className="font-medium">{question.totalAttempts || 0}</span>
                    <span className="text-secondary-500 ml-1">attempts</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusBadge(question.status || 'draft')}>
                    {question.status || 'draft'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditQuestion(question)}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-secondary-600 hover:text-secondary-700"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteQuestion(question.qNo)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      <div className="px-6 py-4 border-t border-secondary-200 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-secondary-600">
          <span>Showing</span>
          <span className="font-medium">1</span>
          <span>to</span>
          <span className="font-medium">10</span>
          <span>of</span>
          <span className="font-medium">{questions.length}</span>
          <span>questions</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button variant="outline" size="sm">
            Previous
          </Button>
          <Button variant="outline" size="sm" className="bg-primary-600 text-white">
            1
          </Button>
          <Button variant="outline" size="sm">
            2
          </Button>
          <Button variant="outline" size="sm">
            3
          </Button>
          <span className="px-2 py-1 text-sm text-secondary-500">...</span>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default RecentQuestionsTable;
