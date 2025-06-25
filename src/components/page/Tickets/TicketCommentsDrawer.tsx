import React, { useState } from 'react';
import Label from '@/components/form/Label';
import Input from '@/components/ui/input/Input';
import Select from '@/components/form/Select';
import Button from '@/components/ui/button/Button';

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  avatar?: string;
}

interface Ticket {
  id: string;
  ticketNo: string;
  customerName: string;
  contactNumber: string;
  email: string;
  ticketType: string;
  priority: 'highest' | 'high' | 'medium' | 'low' | 'lowest';
  createdDate: string;
  lastUpdated: string;
  assignedTo: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  accountNumber?: string;
  timezone: string;
  description: string;
  reporter?: string;
  labels?: string[];
}

interface TicketCommentsDrawerProps {
  isOpen: boolean;
  isVisible: boolean;
  ticket: Ticket | null;
  onClose: () => void;
  onStatusChange: (ticketId: string, newStatus: string) => void;
  onAssigneeChange: (ticketId: string, newAssignee: string) => void;
  onPriorityChange: (ticketId: string, newPriority: string) => void;
  onAddComment: (ticketId: string, comment: string) => void;
  statusOptions: Array<{ value: string; label: string }>;
  priorityOptions: Array<{ value: string; label: string }>;
  assigneeOptions: Array<{ value: string; label: string }>;
  comments: Comment[];
}

const TicketCommentsDrawer: React.FC<TicketCommentsDrawerProps> = ({
  isOpen,
  isVisible,
  ticket,
  onClose,
  onStatusChange,
  onAssigneeChange,
  onPriorityChange,
  onAddComment,
  statusOptions,
  priorityOptions,
  assigneeOptions,
  comments
}) => {  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState('comment');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');

  if (!isOpen || !ticket) return null;
  const getUserAvatar = (name: string) => {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const colorIndex = name.length % colors.length;
    return { initials, color: colors[colorIndex] };
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
    setReplyText('');
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyText('');
  };

  const handleSubmitReply = () => {
    if (replyText.trim()) {
      // Here you would typically call an API to submit the reply
      console.log('Submitting reply:', replyText, 'to comment:', replyingTo);
      
      // Reset the reply state
      setReplyingTo(null);
      setReplyText('');
    }
  };
  const handleStartCommentEdit = (comment: any) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.content);
  };

  const handleCancelCommentEdit = () => {
    setEditingCommentId(null);
    setEditCommentText('');
  };

  const handleUpdateComment = () => {
    if (editCommentText.trim()) {
      // Here you would typically call an API to update the comment
      console.log('Updating comment:', editingCommentId, 'with text:', editCommentText);
      
      // Reset the edit state
      setEditingCommentId(null);
      setEditCommentText('');
    }
  };

  const handleDeleteComment = (commentId: string) => {
    // Implement delete logic here
    console.log('Delete comment:', commentId);
  };

  const handleLikeComment = (commentId: string) => {
    // Implement like logic here
    console.log('Like comment:', commentId);
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'highest': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      case 'lowest': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'open': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(ticket.id, newComment.trim());
      setNewComment('');
    }
  };

  const assigneeAvatar = getUserAvatar(ticket.assignedTo);
  const reporterAvatar = getUserAvatar(ticket.reporter || ticket.customerName);
  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      <div 
        className={`absolute right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-gray-900 shadow-2xl transform transition-all duration-300 ease-out ${
          isVisible 
            ? 'translate-x-0 opacity-100 scale-100' 
            : 'translate-x-full opacity-0 scale-95'
        }`}
      >
        <div className="flex flex-col h-full shadow-[-20px_0_25px_-5px_rgba(0,0,0,0.1)] dark:shadow-[-20px_0_25px_-5px_rgba(0,0,0,0.3)]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m0 0v10a2 2 0 002 2h8a2 2 0 002-2V8M9 16h6" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {ticket.ticketNo}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Ticket Details & Activity
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>          {/* Content */}
          <div className="flex-1 mt-5 px-6 py-6 overflow-y-auto bg-gray-50/50 dark:bg-gray-900/50">
            <div className="space-y-6">
              {/* Ticket Summary */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {ticket.description}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Customer: {ticket.customerName}
                </p>
              </div>

              {/* Status */}
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </Label>
                <Select
                  options={statusOptions}
                  value={ticket.status}
                  onChange={(value) => onStatusChange(ticket.id, value)}
                  className="w-full"
                />
              </div>

              {/* Details Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Details</h4>
                
                {/* Assignee */}
                <div>
                  <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Assignee
                  </Label>
                  <div className="flex items-center space-x-2 mb-2">
                    <div
                      className={`w-6 h-6 rounded-full ${assigneeAvatar.color} flex items-center justify-center text-white text-xs font-medium`}
                    >
                      {assigneeAvatar.initials}
                    </div>
                    <span className="text-sm text-gray-900 dark:text-white">{ticket.assignedTo}</span>
                  </div>
                  <Select
                    options={assigneeOptions}
                    value={ticket.assignedTo}
                    onChange={(value) => onAssigneeChange(ticket.id, value)}
                    className="w-full"
                  />
                </div>

                {/* Reporter */}
                <div>
                  <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Reporter
                  </Label>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-6 h-6 rounded-full ${reporterAvatar.color} flex items-center justify-center text-white text-xs font-medium`}
                    >
                      {reporterAvatar.initials}
                    </div>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {ticket.reporter || ticket.customerName}
                    </span>
                  </div>
                </div>

                {/* Labels */}
                <div>
                  <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Labels
                  </Label>
                  <div className="flex flex-wrap gap-1">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {ticket.ticketType}
                    </span>
                    {ticket.labels?.map((label, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Priority
                  </Label>
                  <div className="mb-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getPriorityBadgeColor(ticket.priority)}`}>
                      {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                    </span>
                  </div>
                  <Select
                    options={priorityOptions}
                    value={ticket.priority}
                    onChange={(value) => onPriorityChange(ticket.id, value)}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Activity</h4>
              
              {/* Comment Type Selector */}
              <div className="flex items-center space-x-4 mb-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">Show:</span>
                <select
                  value={commentType}
                  onChange={(e) => setCommentType(e.target.value)}
                  className="text-sm border-none bg-transparent text-gray-900 dark:text-white focus:outline-none"
                >
                  <option value="comment">Comments</option>
                  <option value="all">All</option>
                </select>                <div className="ml-auto flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Newest first</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
                {comments.map((comment) => {
                  const commentAvatar = getUserAvatar(comment.author);
                  return (
                    <div key={comment.id} className="flex space-x-3">
                      <div
                        className={`w-8 h-8 rounded-full ${commentAvatar.color} flex items-center justify-center text-white text-xs font-medium flex-shrink-0`}
                      >
                        {commentAvatar.initials}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {comment.author}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(comment.timestamp)}
                          </span>
                        </div>                        {editingCommentId === comment.id ? (
                          <div className="mt-1">
                            <textarea
                              value={editCommentText}
                              onChange={(e) => setEditCommentText(e.target.value)}
                              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none"
                              rows={3}
                              autoFocus
                            />
                            <div className="flex items-center space-x-2 mt-2">
                              <button
                                onClick={handleUpdateComment}
                                disabled={!editCommentText.trim()}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelCommentEdit}
                                className="px-3 py-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {comment.content}
                          </p>
                        )}                        <div className="flex items-center space-x-3 mt-2">
                          <button 
                            onClick={() => handleLikeComment(comment.id)}
                            className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                            </svg>
                            <span>Like</span>
                          </button>
                          <button 
                            onClick={() => handleReply(comment.id)}
                            className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                            <span>Reply</span>
                          </button>
                          <button 
                            onClick={() => handleStartCommentEdit(comment)}
                            className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span>Edit</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteComment(comment.id)}
                            className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Delete</span>
                          </button>
                        </div>
                        
                        {/* Reply Field */}
                        {replyingTo === comment.id && (
                          <div className="mt-3 ml-8">
                            <div className="flex items-start space-x-2">
                              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                                U
                              </div>
                              <div className="flex-1">
                                <textarea
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="Write a reply..."
                                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none"
                                  rows={2}
                                  autoFocus
                                />
                                <div className="flex items-center space-x-2 mt-2">
                                  <button
                                    onClick={handleSubmitReply}
                                    disabled={!replyText.trim()}
                                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Reply
                                  </button>
                                  <button
                                    onClick={handleCancelReply}
                                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Comment */}              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-medium">
                    R
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none"
                      rows={3}
                    />
                  </div>
                </div>
                  {/* Comment Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {/* Comment action buttons removed */}
                  </div>
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    size="sm"
                    className="ml-2"
                  >
                    Comment
                  </Button>
                </div>
                
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Pro tip: press <kbd className="px-1 py-0.5 text-xs font-mono bg-gray-200 dark:bg-gray-700 rounded">M</kbd> to comment
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketCommentsDrawer;
