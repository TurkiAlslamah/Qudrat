import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

const QuestionModal = ({ question, questionTypes, internalTypes, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    question_title: '',
    question_text: '',
    question_image: '',
    mc_a: '',
    mc_b: '',
    mc_c: '',
    mc_d: '',
    mc_correct: 'A',
    type_id: 1,
    internal_type_id: 1,
    passage_id: null,
    explanation_image: '',
    hint_image: '',
    tags: '',
    status: 'draft'
  });

  useEffect(() => {
    if (question) {
      setFormData({
        question_title: question.question_title || '',
        question_text: question.question_text || '',
        question_image: question.question_image || '',
        mc_a: question.mc_a || '',
        mc_b: question.mc_b || '',
        mc_c: question.mc_c || '',
        mc_d: question.mc_d || '',
        mc_correct: question.mc_correct || 'A',
        type_id: question.type_id || 1,
        internal_type_id: question.internal_type_id || 1,
        passage_id: question.passage_id || null,
        explanation_image: question.explanation_image || '',
        hint_image: question.hint_image || '',
        tags: question.tags || '',
        status: question.status || 'draft'
      });
    }
  }, [question]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getFilteredInternalTypes = () => {
    return internalTypes.filter(type => type.type_id === parseInt(formData.type_id));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {question ? 'Edit Question' : 'Add New Question'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Question Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Title (Optional)
            </label>
            <input
              type="text"
              value={formData.question_title}
              onChange={(e) => handleChange('question_title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., اختر الإجابة الصحيحة"
            />
          </div>

          {/* Question Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Text *
            </label>
            <textarea
              value={formData.question_text}
              onChange={(e) => handleChange('question_text', e.target.value)}
              rows={3}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter the question text here..."
            />
          </div>

          {/* Question Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Image URL (Optional)
            </label>
            <input
              type="url"
              value={formData.question_image}
              onChange={(e) => handleChange('question_image', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Type Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question Type *
              </label>
              <select
                value={formData.type_id}
                onChange={(e) => handleChange('type_id', parseInt(e.target.value))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {questionTypes.map(type => (
                  <option key={type.type_id} value={type.type_id}>
                    {type.type_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Internal Type *
              </label>
              <select
                value={formData.internal_type_id}
                onChange={(e) => handleChange('internal_type_id', parseInt(e.target.value))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {getFilteredInternalTypes().map(type => (
                  <option key={type.internal_type_id} value={type.internal_type_id}>
                    {type.internal_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Multiple Choice Options */}
          <div className="grid grid-cols-2 gap-4">
            {['mc_a', 'mc_b', 'mc_c', 'mc_d'].map((option, index) => (
              <div key={option}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Option {String.fromCharCode(65 + index)} *
                </label>
                <input
                  type="text"
                  value={formData[option]}
                  onChange={(e) => handleChange(option, e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                />
              </div>
            ))}
          </div>

          {/* Correct Answer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correct Answer *
            </label>
            <select
              value={formData.mc_correct}
              onChange={(e) => handleChange('mc_correct', e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Optional Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Explanation Image URL
              </label>
              <input
                type="url"
                value={formData.explanation_image}
                onChange={(e) => handleChange('explanation_image', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/explanation.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hint Image URL
              </label>
              <input
                type="url"
                value={formData.hint_image}
                onChange={(e) => handleChange('hint_image', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/hint.jpg"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => handleChange('tags', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., استيعاب المقروء, فكرة رئيسية"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save size={16} />
              Save Question
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionModal;