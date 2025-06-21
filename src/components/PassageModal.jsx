import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

const PassageModal = ({ passage, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    passage_title: '',
    passage_image: '',
    status: 'draft'
  });

  useEffect(() => {
    if (passage) {
      setFormData({
        passage_title: passage.passage_title || '',
        passage_image: passage.passage_image || '',
        status: passage.status || 'draft'
      });
    }
  }, [passage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {passage ? 'Edit Passage' : 'Add New Passage'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Passage Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Passage Title
            </label>
            <input
              type="text"
              value={formData.passage_title}
              onChange={(e) => handleChange('passage_title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., التكنولوجيا والتعليم"
            />
          </div>

          {/* Passage Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Passage Image URL *
            </label>
            <input
              type="url"
              value={formData.passage_image}
              onChange={(e) => handleChange('passage_image', e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/passage-image.jpg"
            />
            <div className="text-xs text-gray-500 mt-1">
              Upload your passage image to a hosting service and paste the URL here
            </div>
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
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Save size={16} />
              Save Passage
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PassageModal;