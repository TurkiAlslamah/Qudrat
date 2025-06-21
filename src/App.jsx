import React, { useState, useEffect } from 'react';
import { supabase } from './utils/supabase.jsx';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [questions, setQuestions] = useState([]);
  const [passages, setPassages] = useState([]);
  const [questionTypes, setQuestionTypes] = useState([]);
  const [internalTypes, setInternalTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showPassageModal, setShowPassageModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingPassage, setEditingPassage] = useState(null);
  
  // Pagination states
  const [questionsCurrentPage, setQuestionsCurrentPage] = useState(1);
  const [passagesCurrentPage, setPassagesCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Form states
  const [questionForm, setQuestionForm] = useState({
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
    question_order: 1,
    explanation_image: '',
    hint_image: '',
    tags: '',
    status: 'draft'
  });
  
  const [passageForm, setPassageForm] = useState({
    passage_title: '',
    passage_image: '',
    status: 'draft'
  });

  useEffect(() => {
    loadData();
  }, []);

  // Pagination helper functions
  const getPaginatedData = (data, currentPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (dataLength) => {
    return Math.ceil(dataLength / itemsPerPage);
  };

  const handlePageChange = (page, type) => {
    if (type === 'questions') {
      setQuestionsCurrentPage(page);
    } else if (type === 'passages') {
      setPassagesCurrentPage(page);
    }
  };

  // Get paginated data
  const paginatedQuestions = getPaginatedData(questions, questionsCurrentPage);
  const paginatedPassages = getPaginatedData(passages, passagesCurrentPage);
  const questionsTotalPages = getTotalPages(questions.length);
  const passagesTotalPages = getTotalPages(passages.length);

  const loadData = async () => {
    try {
      const [questionsRes, passagesRes, typesRes, internalRes] = await Promise.all([
        supabase.from('questions').select('*'),
        supabase.from('passages').select('*'),
        supabase.from('question_types').select('*'),
        supabase.from('internal_types').select('*')
      ]);
      
      setQuestions(questionsRes.data || []);
      setPassages(passagesRes.data || []);
      setQuestionTypes(typesRes.data || []);
      setInternalTypes(internalRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const handleSaveQuestion = async () => {
    try {
      if (editingQuestion) {
        // Update existing question
        const { error } = await supabase
          .from('questions')
          .update(questionForm)
          .eq('q_no', editingQuestion.q_no);
        
        if (error) throw error;
        alert('Question updated successfully!');
      } else {
        // Insert new question
        const { error } = await supabase
          .from('questions')
          .insert([questionForm]);
        
        if (error) throw error;
        alert('Question added successfully!');
      }
      
      setShowQuestionModal(false);
      setEditingQuestion(null);
      resetQuestionForm();
      loadData();
    } catch (error) {
      alert('Error saving question: ' + error.message);
    }
  };

  const handleSavePassage = async () => {
    try {
      if (editingPassage) {
        // Update existing passage
        const { error } = await supabase
          .from('passages')
          .update(passageForm)
          .eq('passage_id', editingPassage.passage_id);
        
        if (error) throw error;
        alert('Passage updated successfully!');
      } else {
        // Insert new passage
        const { error } = await supabase
          .from('passages')
          .insert([passageForm]);
        
        if (error) throw error;
        alert('Passage added successfully!');
      }
      
      setShowPassageModal(false);
      setEditingPassage(null);
      resetPassageForm();
      loadData();
    } catch (error) {
      alert('Error saving passage: ' + error.message);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('questions')
          .delete()
          .eq('q_no', questionId);
        
        if (error) throw error;
        alert('Question deleted successfully!');
        loadData();
      } catch (error) {
        alert('Error deleting question: ' + error.message);
      }
    }
  };

  const handleDeletePassage = async (passageId) => {
    if (confirm('Are you sure you want to delete this passage? This will also delete all associated questions.')) {
      try {
        const { error } = await supabase
          .from('passages')
          .delete()
          .eq('passage_id', passageId);
        
        if (error) throw error;
        alert('Passage deleted successfully!');
        loadData();
      } catch (error) {
        alert('Error deleting passage: ' + error.message);
      }
    }
  };

  const openAddQuestion = () => {
    setEditingQuestion(null);
    resetQuestionForm();
    setShowQuestionModal(true);
  };

  const openEditQuestion = (question) => {
    setEditingQuestion(question);
    setQuestionForm({
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
      question_order: question.question_order || 1,
      explanation_image: question.explanation_image || '',
      hint_image: question.hint_image || '',
      tags: question.tags || '',
      status: question.status || 'draft'
    });
    setShowQuestionModal(true);
  };

  const openAddPassage = () => {
    setEditingPassage(null);
    resetPassageForm();
    setShowPassageModal(true);
  };

  const openEditPassage = (passage) => {
    setEditingPassage(passage);
    setPassageForm({
      passage_title: passage.passage_title || '',
      passage_image: passage.passage_image || '',
      status: passage.status || 'draft'
    });
    setShowPassageModal(true);
  };

  const resetQuestionForm = () => {
    setQuestionForm({
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
      question_order: 1,
      explanation_image: '',
      hint_image: '',
      tags: '',
      status: 'draft'
    });
  };

  const resetPassageForm = () => {
    setPassageForm({
      passage_title: '',
      passage_image: '',
      status: 'draft'
    });
  };

  const getFilteredInternalTypes = () => {
    return internalTypes.filter(type => type.type_id === parseInt(questionForm.type_id));
  };

  // Pagination Component
  const PaginationControls = ({ currentPage, totalPages, onPageChange, type }) => {
    const paginationStyle = {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '8px',
      marginTop: '24px',
      padding: '20px'
    };

    const buttonStyle = {
      padding: '8px 16px',
      border: '1px solid #ddd',
      backgroundColor: '#fff',
      color: '#333',
      cursor: 'pointer',
      borderRadius: '4px',
      fontSize: '14px',
      transition: 'all 0.2s'
    };

    const activeButtonStyle = {
      ...buttonStyle,
      backgroundColor: '#3498db',
      color: '#fff',
      borderColor: '#3498db'
    };

    const disabledButtonStyle = {
      ...buttonStyle,
      backgroundColor: '#f5f5f5',
      color: '#999',
      cursor: 'not-allowed'
    };

    return (
      <div style={paginationStyle}>
        <button
          onClick={() => onPageChange(currentPage - 1, type)}
          disabled={currentPage === 1}
          style={currentPage === 1 ? disabledButtonStyle : buttonStyle}
        >
          ← Previous
        </button>
        
        <span style={{ margin: '0 16px', fontSize: '14px', color: '#666' }}>
          Page {currentPage} of {totalPages}
        </span>
        
        {/* Page numbers */}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
          if (totalPages <= 7) {
            return (
              <button
                key={page}
                onClick={() => onPageChange(page, type)}
                style={page === currentPage ? activeButtonStyle : buttonStyle}
              >
                {page}
              </button>
            );
          } else {
            // Show abbreviated pagination for more than 7 pages
            if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page, type)}
                  style={page === currentPage ? activeButtonStyle : buttonStyle}
                >
                  {page}
                </button>
              );
            } else if (page === currentPage - 2 || page === currentPage + 2) {
              return <span key={page} style={{ padding: '0 4px' }}>...</span>;
            }
            return null;
          }
        })}
        
        <button
          onClick={() => onPageChange(currentPage + 1, type)}
          disabled={currentPage === totalPages}
          style={currentPage === totalPages ? disabledButtonStyle : buttonStyle}
        >
          Next →
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e3e3e3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '20px', color: '#666' }}>Loading...</p>
        </div>
      </div>
    );
  }

  const tabStyle = (isActive) => ({
    padding: '12px 24px',
    backgroundColor: isActive ? '#3498db' : '#fff',
    color: isActive ? '#fff' : '#333',
    border: '1px solid #ddd',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: isActive ? 'bold' : 'normal'
  });

  const buttonStyle = {
    backgroundColor: '#3498db',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  };

  const cardStyle = {
    backgroundColor: 'white',
    padding: '24px',
    margin: '16px 0',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    border: '1px solid #e1e1e1'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '16px',
    marginBottom: '16px',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
    color: '#333'
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderBottom: '1px solid #ddd',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#333' }}>
          🎯 Qudrat Admin Dashboard
        </h1>
        <p style={{ margin: '5px 0 0 0', color: '#666' }}>Simple & Clean Question Management</p>
      </div>

      {/* Navigation */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #ddd' }}>
        <div style={{ display: 'flex', maxWidth: '1200px', margin: '0 auto' }}>
          <button
            onClick={() => setActiveTab('dashboard')}
            style={tabStyle(activeTab === 'dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            style={tabStyle(activeTab === 'questions')}
          >
            📝 Questions ({questions.length})
          </button>
          <button
            onClick={() => setActiveTab('passages')}
            style={tabStyle(activeTab === 'passages')}
          >
            📚 Passages ({passages.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' }}>
        
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 style={{ fontSize: '24px', marginBottom: '24px', color: '#333' }}>Dashboard Overview</h2>
            
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 8px 0', color: '#3498db', fontSize: '36px', fontWeight: 'bold' }}>
                  {questions.length}
                </h3>
                <p style={{ margin: 0, color: '#666' }}>Total Questions</p>
              </div>
              
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 8px 0', color: '#27ae60', fontSize: '36px', fontWeight: 'bold' }}>
                  {questions.filter(q => q.status === 'active').length}
                </h3>
                <p style={{ margin: 0, color: '#666' }}>Active Questions</p>
              </div>
              
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 8px 0', color: '#9b59b6', fontSize: '36px', fontWeight: 'bold' }}>
                  {passages.length}
                </h3>
                <p style={{ margin: 0, color: '#666' }}>Total Passages</p>
              </div>
              
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 8px 0', color: '#f39c12', fontSize: '36px', fontWeight: 'bold' }}>
                  {questions.filter(q => q.status === 'draft').length}
                </h3>
                <p style={{ margin: 0, color: '#666' }}>Draft Questions</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={cardStyle}>
              <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>Quick Actions</h3>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setShowQuestionModal(true)}
                  style={{...buttonStyle, backgroundColor: '#3498db'}}
                >
                  ➕ Add New Question
                </button>
                <button
                  onClick={() => setShowPassageModal(true)}
                  style={{...buttonStyle, backgroundColor: '#27ae60'}}
                >
                  ➕ Add New Passage
                </button>
                <button
                  onClick={() => setActiveTab('questions')}
                  style={{...buttonStyle, backgroundColor: '#9b59b6'}}
                >
                  📝 Manage Questions
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Questions Tab */}
        {activeTab === 'questions' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', margin: 0, color: '#333' }}>
                Questions Management ({questions.length} total)
              </h2>
              <button
                onClick={openAddQuestion}
                style={buttonStyle}
              >
                ➕ Add Question
              </button>
            </div>

            {questions.length === 0 ? (
              <div style={{...cardStyle, textAlign: 'center', padding: '60px 24px'}}>
                <h3 style={{ color: '#666', marginBottom: '16px' }}>No questions yet</h3>
                <p style={{ color: '#999', marginBottom: '24px' }}>Get started by creating your first question</p>
                <button
                  onClick={openAddQuestion}
                  style={buttonStyle}
                >
                  Create First Question
                </button>
              </div>
            ) : (
              <>
                <div style={cardStyle}>
                  <div style={{ marginBottom: '16px', color: '#666', fontSize: '14px' }}>
                    Showing {((questionsCurrentPage - 1) * itemsPerPage) + 1} - {Math.min(questionsCurrentPage * itemsPerPage, questions.length)} of {questions.length} questions
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #eee' }}>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#666' }}>ID</th>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#666' }}>Question</th>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#666' }}>Status</th>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#666' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedQuestions.map(question => (
                        <tr key={question.q_no} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '12px', fontWeight: 'bold' }}>#{question.q_no}</td>
                          <td style={{ padding: '12px' }}>
                            <div>
                              <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                                {question.question_text?.substring(0, 80)}...
                              </div>
                              <small style={{ color: '#666' }}>Correct: {question.mc_correct}</small>
                            </div>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span style={{
                              padding: '4px 12px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              backgroundColor: question.status === 'active' ? '#27ae60' : '#f39c12',
                              color: 'white'
                            }}>
                              {question.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <button 
                              onClick={() => openEditQuestion(question)}
                              style={{
                                ...buttonStyle,
                                backgroundColor: '#3498db',
                                padding: '6px 12px',
                                fontSize: '14px',
                                marginRight: '8px'
                              }}
                            >
                              ✏️ Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteQuestion(question.q_no)}
                              style={{
                                ...buttonStyle,
                                backgroundColor: '#e74c3c',
                                padding: '6px 12px',
                                fontSize: '14px'
                              }}
                            >
                              🗑️ Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Questions Pagination */}
                {questionsTotalPages > 1 && (
                  <PaginationControls
                    currentPage={questionsCurrentPage}
                    totalPages={questionsTotalPages}
                    onPageChange={handlePageChange}
                    type="questions"
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* Passages Tab */}
        {activeTab === 'passages' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', margin: 0, color: '#333' }}>
                Passages Management ({passages.length} total)
              </h2>
              <button
                onClick={openAddPassage}
                style={{...buttonStyle, backgroundColor: '#27ae60'}}
              >
                ➕ Add Passage
              </button>
            </div>

            {passages.length === 0 ? (
              <div style={{...cardStyle, textAlign: 'center', padding: '60px 24px'}}>
                <h3 style={{ color: '#666', marginBottom: '16px' }}>No passages yet</h3>
                <p style={{ color: '#999', marginBottom: '24px' }}>Create your first reading passage</p>
                <button
                  onClick={openAddPassage}
                  style={{...buttonStyle, backgroundColor: '#27ae60'}}
                >
                  Create First Passage
                </button>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '16px', color: '#666', fontSize: '14px' }}>
                  Showing {((passagesCurrentPage - 1) * itemsPerPage) + 1} - {Math.min(passagesCurrentPage * itemsPerPage, passages.length)} of {passages.length} passages
                </div>
                
                <div>
                  {paginatedPassages.map(passage => (
                    <div key={passage.passage_id} style={cardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#333' }}>
                            {passage.passage_title || `Passage ${passage.passage_id}`}
                          </h3>
                          <div style={{ marginBottom: '12px' }}>
                            <span style={{
                              padding: '4px 12px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              backgroundColor: '#3498db',
                              color: 'white',
                              marginRight: '8px'
                            }}>
                              {questions.filter(q => q.passage_id === passage.passage_id).length} Questions
                            </span>
                            <span style={{
                              padding: '4px 12px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              backgroundColor: passage.status === 'active' ? '#27ae60' : '#f39c12',
                              color: 'white'
                            }}>
                              {passage.status}
                            </span>
                          </div>
                          <small style={{ color: '#666' }}>
                            Created: {new Date(passage.created_at).toLocaleDateString()}
                          </small>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => openEditPassage(passage)}
                            style={{
                              ...buttonStyle,
                              backgroundColor: '#3498db',
                              padding: '8px 16px',
                              fontSize: '14px'
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            onClick={() => handleDeletePassage(passage.passage_id)}
                            style={{
                              ...buttonStyle,
                              backgroundColor: '#e74c3c',
                              padding: '8px 16px',
                              fontSize: '14px'
                            }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Passages Pagination */}
                {passagesTotalPages > 1 && (
                  <PaginationControls
                    currentPage={passagesCurrentPage}
                    totalPages={passagesTotalPages}
                    onPageChange={handlePageChange}
                    type="passages"
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Question Modal */}
      {showQuestionModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '32px',
            borderRadius: '8px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '24px', textAlign: 'center' }}>
              {editingQuestion ? '✏️ Edit Question' : '✨ Add New Question'}
            </h2>
            
            <div>
              <label style={labelStyle}>Question Title (Optional)</label>
              <input
                type="text"
                value={questionForm.question_title}
                onChange={(e) => setQuestionForm({...questionForm, question_title: e.target.value})}
                style={inputStyle}
                placeholder="e.g., اختر الإجابة الصحيحة"
              />

              <label style={labelStyle}>Question Text *</label>
              <textarea
                value={questionForm.question_text}
                onChange={(e) => setQuestionForm({...questionForm, question_text: e.target.value})}
                style={{...inputStyle, height: '80px', resize: 'vertical'}}
                placeholder="Enter the question text here..."
                required
              />

              <label style={labelStyle}>Question Image URL (Optional)</label>
              <input
                type="url"
                value={questionForm.question_image}
                onChange={(e) => setQuestionForm({...questionForm, question_image: e.target.value})}
                style={inputStyle}
                placeholder="https://example.com/image.jpg"
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Question Type *</label>
                  <select
                    value={questionForm.type_id}
                    onChange={(e) => setQuestionForm({...questionForm, type_id: parseInt(e.target.value)})}
                    style={inputStyle}
                    required
                  >
                    {questionTypes.map(type => (
                      <option key={type.type_id} value={type.type_id}>
                        {type.type_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Internal Type *</label>
                  <select
                    value={questionForm.internal_type_id}
                    onChange={(e) => setQuestionForm({...questionForm, internal_type_id: parseInt(e.target.value)})}
                    style={inputStyle}
                    required
                  >
                    {getFilteredInternalTypes().map(type => (
                      <option key={type.internal_type_id} value={type.internal_type_id}>
                        {type.internal_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Passage Selection */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Link to Passage (Optional)</label>
                  <select
                    value={questionForm.passage_id || ''}
                    onChange={(e) => setQuestionForm({...questionForm, passage_id: e.target.value ? parseInt(e.target.value) : null})}
                    style={inputStyle}
                  >
                    <option value="">No Passage (Standalone Question)</option>
                    {passages.map(passage => (
                      <option key={passage.passage_id} value={passage.passage_id}>
                        {passage.passage_title || `Passage ${passage.passage_id}`}
                      </option>
                    ))}
                  </select>
                </div>

                {questionForm.passage_id && (
                  <div>
                    <label style={labelStyle}>Question Order</label>
                    <select
                      value={questionForm.question_order}
                      onChange={(e) => setQuestionForm({...questionForm, question_order: parseInt(e.target.value)})}
                      style={inputStyle}
                    >
                      <option value={1}>Question 1</option>
                      <option value={2}>Question 2</option>
                      <option value={3}>Question 3</option>
                      <option value={4}>Question 4</option>
                      <option value={5}>Question 5</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Help Images */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Explanation Image URL (Optional)</label>
                  <input
                    type="url"
                    value={questionForm.explanation_image}
                    onChange={(e) => setQuestionForm({...questionForm, explanation_image: e.target.value})}
                    style={inputStyle}
                    placeholder="https://example.com/explanation.jpg"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Hint Image URL (Optional)</label>
                  <input
                    type="url"
                    value={questionForm.hint_image}
                    onChange={(e) => setQuestionForm({...questionForm, hint_image: e.target.value})}
                    style={inputStyle}
                    placeholder="https://example.com/hint.jpg"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label style={labelStyle}>Tags (Optional)</label>
                <input
                  type="text"
                  value={questionForm.tags}
                  onChange={(e) => setQuestionForm({...questionForm, tags: e.target.value})}
                  style={inputStyle}
                  placeholder="e.g., استيعاب المقروء, فكرة رئيسية, صعب"
                />
                <small style={{ color: '#666', fontSize: '14px', marginTop: '-12px', display: 'block', marginBottom: '16px' }}>
                  💡 Tags help categorize questions. Separate multiple tags with commas. Examples: "استيعاب المقروء, فكرة رئيسية" or "جبر, معادلات, متوسط"
                </small>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Option A *</label>
                  <input
                    type="text"
                    value={questionForm.mc_a}
                    onChange={(e) => setQuestionForm({...questionForm, mc_a: e.target.value})}
                    style={inputStyle}
                    placeholder="Option A"
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Option B *</label>
                  <input
                    type="text"
                    value={questionForm.mc_b}
                    onChange={(e) => setQuestionForm({...questionForm, mc_b: e.target.value})}
                    style={inputStyle}
                    placeholder="Option B"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Option C *</label>
                  <input
                    type="text"
                    value={questionForm.mc_c}
                    onChange={(e) => setQuestionForm({...questionForm, mc_c: e.target.value})}
                    style={inputStyle}
                    placeholder="Option C"
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Option D *</label>
                  <input
                    type="text"
                    value={questionForm.mc_d}
                    onChange={(e) => setQuestionForm({...questionForm, mc_d: e.target.value})}
                    style={inputStyle}
                    placeholder="Option D"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Correct Answer *</label>
                  <select
                    value={questionForm.mc_correct}
                    onChange={(e) => setQuestionForm({...questionForm, mc_correct: e.target.value})}
                    style={inputStyle}
                    required
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select
                    value={questionForm.status}
                    onChange={(e) => setQuestionForm({...questionForm, status: e.target.value})}
                    style={inputStyle}
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
                <button
                  onClick={() => {
                    setShowQuestionModal(false);
                    setEditingQuestion(null);
                    resetQuestionForm();
                  }}
                  style={{
                    ...buttonStyle,
                    backgroundColor: '#95a5a6',
                    padding: '12px 24px'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveQuestion}
                  style={{
                    ...buttonStyle,
                    backgroundColor: '#27ae60',
                    padding: '12px 24px'
                  }}
                >
                  💾 {editingQuestion ? 'Update Question' : 'Save Question'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Passage Modal */}
      {showPassageModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '32px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '24px', textAlign: 'center' }}>
              {editingPassage ? '✏️ Edit Passage' : '📚 Add New Passage'}
            </h2>
            
            <div>
              <label style={labelStyle}>Passage Title</label>
              <input
                type="text"
                value={passageForm.passage_title}
                onChange={(e) => setPassageForm({...passageForm, passage_title: e.target.value})}
                style={inputStyle}
                placeholder="e.g., التكنولوجيا والتعليم"
              />

              <label style={labelStyle}>Passage Image URL *</label>
              <input
                type="url"
                value={passageForm.passage_image}
                onChange={(e) => setPassageForm({...passageForm, passage_image: e.target.value})}
                style={inputStyle}
                placeholder="https://example.com/passage-image.jpg"
                required
              />
              <small style={{ color: '#666', fontSize: '14px', marginTop: '-12px', display: 'block', marginBottom: '16px' }}>
                Upload your passage image to a hosting service and paste the URL here
              </small>

              <label style={labelStyle}>Status</label>
              <select
                value={passageForm.status}
                onChange={(e) => setPassageForm({...passageForm, status: e.target.value})}
                style={inputStyle}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
                <button
                  onClick={() => {
                    setShowPassageModal(false);
                    setEditingPassage(null);
                    resetPassageForm();
                  }}
                  style={{
                    ...buttonStyle,
                    backgroundColor: '#95a5a6',
                    padding: '12px 24px'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePassage}
                  style={{
                    ...buttonStyle,
                    backgroundColor: '#3498db',
                    padding: '12px 24px'
                  }}
                >
                  💾 {editingPassage ? 'Update Passage' : 'Save Passage'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default App;