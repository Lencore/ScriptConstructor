import React, { useState } from 'react';
import { PlusCircle, Pencil, Trash2, Edit, X, ArrowUp, ArrowDown } from 'lucide-react';
import type { ScriptBlock, Comment } from '../types';

interface Props {
  block: ScriptBlock;
  index: number;
  onAddComment: (comment: string) => void;
  onUpdateComment: (commentId: string, text: string) => void;
  onDeleteComment: (commentId: string) => void;
  onUpdateBlock: (content: string) => void;
  onDeleteBlock: () => void;
  onTypeChange: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

const blockStyles = {
  A: 'border-rose-200/50 hover:border-rose-300/80',
  B: 'border-blue-200/50 hover:border-blue-300/80',
  C: 'border-green-200/50 hover:border-green-300/80',
};

const blockWidths = {
  A: 'w-[70%]',
  B: 'w-[56%]',
  C: 'w-[42%]',
};

export function ScriptBlock({
  block,
  index,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onUpdateBlock,
  onDeleteBlock,
  onTypeChange,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: Props) {
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingContent, setEditingContent] = useState(false);
  const [content, setContent] = useState(block.content);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
      setShowCommentInput(false);
    }
  };

  const handleUpdateBlock = () => {
    onUpdateBlock(content);
    setEditingContent(false);
  };

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.text);
  };

  const handleUpdateComment = () => {
    if (editingCommentId && editingCommentText.trim()) {
      onUpdateComment(editingCommentId, editingCommentText);
      setEditingCommentId(null);
    }
  };

  return (
    <div className="flex items-start gap-4 mb-6">
      {/* Block number, type, and move buttons */}
      <div className="flex flex-col items-center justify-center w-12 mt-2 gap-2">
        <div className="flex flex-col items-center">
          <button
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className={`w-6 h-6 flex items-center justify-center rounded-full 
                     ${canMoveUp 
                       ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800' 
                       : 'bg-gray-50 text-gray-300 cursor-not-allowed'} 
                     transition-colors`}
          >
            <ArrowUp size={14} />
          </button>
          <span className="text-lg font-medium text-gray-400 my-1">#{index + 1}</span>
          <button
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className={`w-6 h-6 flex items-center justify-center rounded-full 
                     ${canMoveDown 
                       ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800' 
                       : 'bg-gray-50 text-gray-300 cursor-not-allowed'} 
                     transition-colors`}
          >
            <ArrowDown size={14} />
          </button>
        </div>
        <button
          onClick={onTypeChange}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 
                   transition-colors cursor-pointer"
        >
          {block.type}
        </button>
      </div>

      {/* Main content block */}
      <div className={`${blockWidths[block.type]} relative`}>
        <div className={`p-4 rounded-xl border-2 ${blockStyles[block.type]} 
                        transition-all bg-white shadow-sm hover:shadow-md`}>
          {editingContent ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleUpdateBlock();
                }
              }}
              className="w-full p-2 rounded border border-gray-200 focus:outline-none 
                       focus:ring-2 focus:ring-purple-200"
              autoFocus
            />
          ) : (
            <p className="text-gray-800">{block.content}</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="absolute -right-10 top-1/2 transform -translate-y-1/2 
                      flex flex-col gap-1.5">
          <button
            onClick={() => setShowCommentInput(true)}
            className="w-6 h-6 flex items-center justify-center rounded-full 
                     bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-600
                     transition-all"
            title="Add comment"
          >
            <PlusCircle size={14} />
          </button>
          <button
            onClick={() => setEditingContent(true)}
            className="w-6 h-6 flex items-center justify-center rounded-full 
                     bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600
                     transition-all"
            title="Edit block"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={onDeleteBlock}
            className="w-6 h-6 flex items-center justify-center rounded-full 
                     bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600
                     transition-all"
            title="Delete block"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Comments section */}
      <div className="flex-1 min-w-[250px] max-w-[400px] ml-8">
        <div className="space-y-2">
          {block.comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-purple-50 p-3 rounded-xl border border-purple-100 
                       text-sm text-gray-700 shadow-sm group relative"
            >
              {editingCommentId === comment.id ? (
                <div className="flex gap-2">
                  <textarea
                    value={editingCommentText}
                    onChange={(e) => setEditingCommentText(e.target.value)}
                    className="flex-1 p-1 rounded border border-purple-200 
                             focus:outline-none focus:ring-1 focus:ring-purple-300
                             min-h-[60px] resize-y"
                    autoFocus
                  />
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={handleUpdateComment}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => setEditingCommentId(null)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="whitespace-pre-wrap">{comment.text}</p>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 
                                flex gap-2 opacity-0 group-hover:opacity-100 
                                transition-opacity">
                    <button
                      onClick={() => handleEditComment(comment)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onDeleteComment(comment.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {showCommentInput && (
          <div className="mt-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full p-2 rounded-xl border border-purple-200 
                       focus:outline-none focus:ring-2 focus:ring-purple-200 
                       focus:border-purple-300 placeholder-gray-400 text-sm
                       min-h-[60px] resize-y"
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={handleAddComment}
                className="px-3 py-1 bg-purple-600 text-white rounded-lg 
                         hover:bg-purple-700 transition-colors text-sm"
              >
                Add
              </button>
              <button
                onClick={() => setShowCommentInput(false)}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg 
                         hover:bg-gray-300 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}