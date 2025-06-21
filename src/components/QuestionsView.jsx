import React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

const QuestionsView = ({ questions, onAddQuestion, onEditQuestion, onDeleteQuestion }) => {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Questions ({questions.length})
        </h1>
        <button
          onClick={onAddQuestion}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Add Question
        </button>
      </div>

      {questions.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
          <div className="text-gray-400 mb-4">No questions yet</div>
          <button
            onClick={onAddQuestion}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Create your first question
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Question</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {questions.map(question => (
                <tr key={question.q_no} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {question.q_no}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {question.question_text?.substring(0, 80)}...
                    </div>
                    <div className="text-xs text-gray-500">
                      Correct: {question.mc_correct}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div>{question.question_types?.type_name}</div>
                    <div className="text-xs">{question.internal_types?.internal_name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      question.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : question.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {question.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEditQuestion(question)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onDeleteQuestion(question.q_no)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default QuestionsView;