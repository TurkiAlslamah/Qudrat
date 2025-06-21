import React from 'react';
import { Plus } from 'lucide-react';

const Dashboard = ({ questions, passages, onAddQuestion, onAddPassage }) => {
  const activeQuestions = questions.filter(q => q.status === 'active').length;
  const draftQuestions = questions.filter(q => q.status === 'draft').length;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
          <div className="text-gray-600 text-sm">Total Questions</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">{activeQuestions}</div>
          <div className="text-gray-600 text-sm">Active Questions</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-yellow-600">{draftQuestions}</div>
          <div className="text-gray-600 text-sm">Draft Questions</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-purple-600">{passages.length}</div>
          <div className="text-gray-600 text-sm">Total Passages</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <button
            onClick={onAddQuestion}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            Add New Question
          </button>
          
          <button
            onClick={onAddPassage}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            Add New Passage
          </button>
        </div>
      </div>

      {/* Recent Questions */}
      {questions.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border mt-6">
          <h2 className="text-lg font-semibold mb-4">Recent Questions</h2>
          <div className="space-y-3">
            {questions.slice(0, 5).map(question => (
              <div key={question.q_no} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium text-gray-800">
                    Q{question.q_no}: {question.question_text?.substring(0, 60)}...
                  </div>
                  <div className="text-sm text-gray-500">
                    {question.question_types?.type_name} - {question.internal_types?.internal_name}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  question.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {question.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;