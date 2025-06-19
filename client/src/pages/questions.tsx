import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Filter, Download, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import RecentQuestionsTable from "@/components/recent-questions-table";
import QuestionModal from "@/components/question-modal";
import type { QuestionDetails } from "@shared/schema";

const Questions = () => {
  const { toast } = useToast();
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionDetails | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Load questions
  const { data: questions = [], isLoading } = useQuery<QuestionDetails[]>({
    queryKey: ['/api/questions', { search: searchTerm, type: typeFilter }],
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (qNo: number) => {
      return apiRequest('DELETE', `/api/questions/${qNo}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/questions'] });
      toast({
        title: "Success",
        description: "Question deleted successfully",
      });
      setDeleteDialogOpen(false);
      setQuestionToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddQuestion = () => {
    setSelectedQuestion(null);
    setModalMode('create');
    setIsQuestionModalOpen(true);
  };

  const handleEditQuestion = (question: QuestionDetails) => {
    setSelectedQuestion(question);
    setModalMode('edit');
    setIsQuestionModalOpen(true);
  };

  const handleDeleteQuestion = (qNo: number) => {
    setQuestionToDelete(qNo);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (questionToDelete) {
      deleteMutation.mutate(questionToDelete);
    }
  };

  const handleExportQuestions = () => {
    // TODO: Implement export functionality
    toast({
      title: "Export Started",
      description: "Your questions export is being prepared...",
    });
  };

  const handleBulkDelete = () => {
    // TODO: Implement bulk delete functionality
    toast({
      title: "Bulk Actions",
      description: "Bulk delete functionality will be implemented here",
    });
  };

  const closeModal = () => {
    setIsQuestionModalOpen(false);
    setSelectedQuestion(null);
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-secondary-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-secondary-900">Questions Management</h1>
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <span className="text-secondary-500 text-sm">Home</span>
                </li>
                <li>
                  <span className="text-secondary-400 text-xs mx-2">/</span>
                  <span className="text-secondary-900 text-sm font-medium">Questions</span>
                </li>
              </ol>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleExportQuestions}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            
            <Button onClick={handleAddQuestion} className="bg-primary-600 hover:bg-primary-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-secondary-50">
        <div className="p-6 space-y-6">
          
          {/* Filters and Search */}
          <Card className="bg-white border border-secondary-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-secondary-900">
                Filter Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search questions by title or content..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="لفظي">لفظي (Verbal)</SelectItem>
                    <SelectItem value="كمي">كمي (Quantitative)</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white border border-secondary-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-secondary-900">{questions.length}</p>
                  <p className="text-sm text-secondary-600">Total Questions</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border border-secondary-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {questions.filter(q => q.status === 'active').length}
                  </p>
                  <p className="text-sm text-secondary-600">Active</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border border-secondary-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {questions.filter(q => q.status === 'draft').length}
                  </p>
                  <p className="text-sm text-secondary-600">Drafts</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border border-secondary-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {questions.filter(q => q.typeName === 'لفظي').length}
                  </p>
                  <p className="text-sm text-secondary-600">Verbal</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Questions Table */}
          <RecentQuestionsTable
            onAddQuestion={handleAddQuestion}
            onEditQuestion={handleEditQuestion}
            onDeleteQuestion={handleDeleteQuestion}
          />
        </div>
      </main>

      {/* Question Modal */}
      <QuestionModal
        open={isQuestionModalOpen}
        onClose={closeModal}
        question={selectedQuestion}
        mode={modalMode}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the question
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Questions;
