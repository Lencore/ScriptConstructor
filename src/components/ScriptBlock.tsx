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

const typeButtonStyles = {
  A: 'bg-rose-100 text-rose-700 hover:bg-rose-200',
  B: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  C: 'bg-green-100 text-green-700 hover:bg-green-200',
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
    <div className="flex gap-4 items-start min-h-[4.5rem]">
      {/* Main content with controls */}
      <div className="flex-1 relative flex">
        {/* Left controls column */}
        <div className="w-10 flex flex-col items-center gap-1.5 absolute left-0 top-1/2 -translate-y-1/2">
          <div className="flex w-full">
            <button
              onClick={onMoveUp}
              disabled={!canMoveUp}
              className={`w-1/2 h-5 flex items-center justify-center rounded-l-md
                       ${canMoveUp 
                         ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800' 
                         : 'bg-gray-50 text-gray-300 cursor-not-allowed'} 
                       border-r border-gray-200 transition-colors`}
            >
              <ArrowUp size={12} />
            </button>
            <button
              onClick={onMoveDown}
              disabled={!canMoveDown}
              className={`w-1/2 h-5 flex items-center justify-center rounded-r-md
                       ${canMoveDown 
                         ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800' 
                         : 'bg-gray-50 text-gray-300 cursor-not-allowed'} 
                       transition-colors`}
            >
              <ArrowDown size={12} />
            </button>
          </div>
          <span className="text-sm font-medium text-gray-400">#{index + 1}</span>
          <button
            onClick={onTypeChange}
            className={`text-xs font-medium w-5 h-5 rounded
                     transition-colors cursor-pointer flex items-center justify-center
                     ${typeButtonStyles[block.type]}`}
          >
            {block.type}
          </button>
        </div>

        {/* Text content */}
        <div className="flex-1 ml-14">
          <div className="p-4 rounded-xl border-2 border-gray-200 
                       transition-all bg-white shadow-sm hover:shadow-md
                       min-h-[4.5rem]">
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
                         focus:ring-2 focus:ring-purple-200 min-h-[3rem]"
                autoFocus
              />
            ) : (
              <p className="text-gray-700 min-h-[1.5rem]">{block.content}</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="absolute -right-8 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-10">
            <button
              onClick={() => setShowCommentInput(true)}
              className="w-6 h-6 flex items-center justify-center rounded-full 
                       bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-600
                       transition-all"
              title="Добавить комментарий"
            >
              <PlusCircle size={14} />
            </button>
            <button
              onClick={() => setEditingContent(true)}
              className="w-6 h-6 flex items-center justify-center rounded-full 
                       bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600
                       transition-all"
              title="Редактировать блок"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={onDeleteBlock}
              className="w-6 h-6 flex items-center justify-center rounded-full 
                       bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600
                       transition-all"
              title="Удалить блок"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Comments column */}
      <div className="w-[200px] min-w-[200px] max-w-[300px] pl-8 flex-shrink-0">
        <div className="space-y-2">
          {block.comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-purple-50 p-3 rounded-xl border border-purple-100 
                       text-sm text-gray-700 shadow-sm group relative overflow-hidden"
            >
              {editingCommentId === comment.id ? (
                <div className="flex gap-2">
                  <textarea
                    value={editingCommentText}
                    onChange={(e) => setEditingCommentText(e.target.value)}
                    className="flex-1 p-1 rounded border border-purple-200 
                             focus:outline-none focus:ring-1 focus:ring-purple-300
                             min-h-[60px] resize-y w-full"
                    autoFocus
                  />
                  <div className="flex flex-col gap-1 flex-shrink-0">
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
                <div className="flex items-start gap-2">
                  <p className="whitespace-pre-wrap break-words flex-1 overflow-hidden text-ellipsis">{comment.text}</p>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleEditComment(comment)}
                      className="text-gray-400 opacity-50 group-hover:text-blue-600 
                               group-hover:opacity-100 transition-all"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onDeleteComment(comment.id)}
                      className="text-gray-400 opacity-50 group-hover:text-red-600 
                               group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {showCommentInput && (
            <div className="mt-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Добавить комментарий..."
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
                  Добавить
                </button>
                <button
                  onClick={() => setShowCommentInput(false)}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg 
                         hover:bg-gray-300 transition-colors text-sm"
                >
                  Отмена
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}