import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatsCards from "@/components/stats-cards";
import RecentQuestionsTable from "@/components/recent-questions-table";
import QuestionModal from "@/components/question-modal";
import type { DashboardStats, QuestionDetails } from "@shared/schema";

const Dashboard = () => {
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionDetails | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  // Load dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
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
    // TODO: Implement delete confirmation and API call
    console.log('Delete question:', qNo);
  };

  const closeModal = () => {
    setIsQuestionModalOpen(false);
    setSelectedQuestion(null);
  };

  const mockStats: DashboardStats = {
    totalQuestions: 0,
    activeQuestions: 0,
    totalPassages: 0,
    totalAttempts: 0,
    verbalQuestions: 0,
    quantQuestions: 0,
    readingComprehension: 0,
    verbalAnalogies: 0,
    sentenceCompletion: 0,
    contextualError: 0,
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-secondary-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-secondary-900">Dashboard Overview</h1>
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <span className="text-secondary-500 text-sm">Home</span>
                </li>
                <li>
                  <span className="text-secondary-400 text-xs mx-2">/</span>
                  <span className="text-secondary-900 text-sm font-medium">Dashboard</span>
                </li>
              </ol>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Real-time Status Indicator */}
            <div className="flex items-center space-x-2 text-sm text-secondary-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
            
            {/* Quick Actions */}
            <Button onClick={handleAddQuestion} className="bg-primary-600 hover:bg-primary-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
            
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Activity className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs h-5 w-5 flex items-center justify-center p-0">
                3
              </Badge>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-secondary-50">
        <div className="p-6 space-y-6">
          
          {/* Stats Cards */}
          <StatsCards stats={stats || mockStats} isLoading={statsLoading} />
          
          {/* Question Types Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Question Types Distribution */}
            <Card className="bg-white border border-secondary-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-secondary-900">
                  Question Types Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Verbal Questions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                      <span className="text-sm font-medium text-secondary-900">لفظي (Verbal)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-secondary-200 rounded-full h-2">
                        <div 
                          className="bg-primary-500 h-2 rounded-full" 
                          style={{ 
                            width: `${stats ? (stats.verbalQuestions / (stats.verbalQuestions + stats.quantQuestions)) * 100 : 68}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-secondary-900">
                        {stats?.verbalQuestions || 0}
                      </span>
                    </div>
                  </div>
                  
                  {/* Quantitative Questions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-secondary-900">كمي (Quantitative)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-secondary-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ 
                            width: `${stats ? (stats.quantQuestions / (stats.verbalQuestions + stats.quantQuestions)) * 100 : 32}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-secondary-900">
                        {stats?.quantQuestions || 0}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Internal Types Breakdown */}
                <div className="mt-6 pt-4 border-t border-secondary-200">
                  <h4 className="text-sm font-medium text-secondary-700 mb-3">Verbal Subcategories</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-secondary-600">استيعاب المقروء</span>
                      <span className="font-medium">{stats?.readingComprehension || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">التناظر اللفظي</span>
                      <span className="font-medium">{stats?.verbalAnalogies || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">إكمال الجمل</span>
                      <span className="font-medium">{stats?.sentenceCompletion || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">الخطأ السياقي</span>
                      <span className="font-medium">{stats?.contextualError || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Recent Activity */}
            <Card className="bg-white border border-secondary-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold text-secondary-900">
                  Recent Activity
                </CardTitle>
                <Button variant="link" className="text-primary-600 hover:text-primary-700 text-sm">
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Mock activity items - replace with real data */}
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Plus className="text-green-600 h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-secondary-900">
                        <span className="font-medium">Ahmed Al-Rashid</span> added a new question
                      </p>
                      <p className="text-xs text-secondary-500 mt-1">2 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Activity className="text-blue-600 h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-secondary-900">
                        <span className="font-medium">Sara Mohamed</span> updated passage #156
                      </p>
                      <p className="text-xs text-secondary-500 mt-1">15 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Activity className="text-yellow-600 h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-secondary-900">
                        System generated difficulty report
                      </p>
                      <p className="text-xs text-secondary-500 mt-1">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Questions Table */}
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
    </>
  );
};

export default Dashboard;
