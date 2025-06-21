import React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

const PassagesView = ({ passages, questions, onAddPassage, onEditPassage, onDeletePassage }) => {
  const getQuestionCount = (passageId) => {
    return questions.filter(q => q.passage_id === passageId).length;
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Passages ({passages.length})
        </h1>
        <button
          onClick={onAddPassage}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Add Passage
        </button>
      </div>

      {passages.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
          <div className="text-gray-400 mb-4">No passages yet</div>
          <button
            onClick={onAddPassage}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            Create your first passage
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {passages.map(passage => (
            <div key={passage.passage_id} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {passage.passage_title || `Passage ${passage.passage_id}`}
                  </h3>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                      {getQuestionCount(passage.passage_id)} Questions
                    </span>
                    <span className={`inline-block px-2 py-1 rounded ${
                      passage.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {passage.status}
                    </span>
                  </div>

                  {passage.passage_image && (
                    <div className="text-sm text-gray-500 mb-2">
                      Image: {passage.passage_image.substring(0, 60)}...
                    </div>
                  )}

                  <div className="text-xs text-gray-400">
                    Created: {new Date(passage.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => onEditPassage(passage)}
                    className="text-blue-600 hover:text-blue-800 p-2"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => onDeletePassage(passage.passage_id)}
                    className="text-red-600 hover:text-red-800 p-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {getQuestionCount(passage.passage_id) > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium text-gray-700 mb-2">Related Questions:</h4>
                  <div className="grid gap-2">
                    {questions
                      .filter(q => q.passage_id === passage.passage_id)
                      .map(question => (
                        <div key={question.q_no} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          Q{question.q_no}: {question.question_text?.substring(0, 100)}...
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PassagesView;