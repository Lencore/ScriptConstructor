import React, { useState } from 'react';
import { PlusCircle, Pencil, Trash2, Edit, X, ArrowUp, ArrowDown } from 'lucide-react';
import type { ScriptBlock, Comment } from '../types';

interface Props {
  block: ScriptBlock;
  index: number;
  onAddComment: (comment: string) => void;
  onUpdateComment: (commentId: string, text: string) => void;
  onDeleteComment: (commentId: string) => void;
  onUpdate: (content: string) => void;
  onDelete: () => void;
  onTypeChange: () => void;
  onMove: (direction: 'up' | 'down') => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

const typeButtonStyles = {
  A: 'bg-google-red text-white hover:bg-opacity-90',
  B: 'bg-google-blue text-white hover:bg-opacity-90',
  C: 'bg-google-green text-white hover:bg-opacity-90',
};

export function ScriptBlock({
  block,
  index,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onUpdate,
  onDelete,
  onTypeChange,
  onMove,
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
    onUpdate(content);
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
    <div className="flex gap-6 items-start min-h-[4.5rem] relative">
      {/* Main content with controls */}
      <div className="flex-[2] relative flex">
        {/* Left controls column */}
        <div className="w-10 flex flex-col items-center gap-1.5 absolute left-0 top-1/2 -translate-y-1/2 z-10">
          <div className="flex w-full">
            <button
              onClick={() => onMove('up')}
              disabled={!canMoveUp}
              className={`w-1/2 h-5 flex items-center justify-center rounded-l-md
                       ${canMoveUp 
                         ? 'bg-white text-google-gray-dark hover:bg-google-gray-light shadow-sm' 
                         : 'bg-white text-gray-300 cursor-not-allowed'} 
                       border-r border-google-gray-lighter transition-colors`}
            >
              <ArrowUp size={12} />
            </button>
            <button
              onClick={() => onMove('down')}
              disabled={!canMoveDown}
              className={`w-1/2 h-5 flex items-center justify-center rounded-r-md
                       ${canMoveDown 
                         ? 'bg-white text-google-gray-dark hover:bg-google-gray-light shadow-sm' 
                         : 'bg-white text-gray-300 cursor-not-allowed'} 
                       transition-colors`}
            >
              <ArrowDown size={12} />
            </button>
          </div>
          <span className="text-sm font-medium text-google-gray-dark opacity-75">#{index + 1}</span>
          <button
            onClick={onTypeChange}
            className={`text-xs font-medium w-5 h-5 rounded shadow-sm
                     transition-colors cursor-pointer flex items-center justify-center
                     ${typeButtonStyles[block.type]}`}
          >
            {block.type}
          </button>
        </div>

        {/* Text content */}
        <div className="flex-1 ml-14">
          <div className="p-4 rounded-xl bg-white shadow-soft hover:shadow-lg min-h-[4.5rem]">
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
                className="input-field min-h-[3rem]"
                autoFocus
              />
            ) : (
              <p className="text-google-gray-dark min-h-[1.5rem]">{block.content}</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="absolute -right-8 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-10">
            <button
              onClick={() => setShowCommentInput(true)}
              className="w-6 h-6 flex items-center justify-center rounded-full 
                       bg-google-gray-light text-google-gray-dark hover:bg-google-blue hover:text-white
                       transition-all"
              title="Добавить комментарий"
            >
              <PlusCircle size={14} />
            </button>
            <button
              onClick={() => setEditingContent(true)}
              className="w-6 h-6 flex items-center justify-center rounded-full 
                       bg-google-gray-light text-google-gray-dark hover:bg-google-blue hover:text-white
                       transition-all"
              title="Редактировать блок"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={onDelete}
              className="w-6 h-6 flex items-center justify-center rounded-full 
                       bg-google-gray-light text-google-gray-dark hover:bg-google-red hover:text-white
                       transition-all"
              title="Удалить блок"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Comments column */}
      <div className="flex-1 pl-12">
        <div className="space-y-2">
          {block.comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white p-3 rounded-xl shadow-soft group relative overflow-hidden"
            >
              {editingCommentId === comment.id ? (
                <div className="flex gap-2">
                  <textarea
                    value={editingCommentText}
                    onChange={(e) => setEditingCommentText(e.target.value)}
                    className="input-field min-h-[60px] resize-y w-full"
                    autoFocus
                  />
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button
                      onClick={handleUpdateComment}
                      className="text-google-green hover:text-opacity-80"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => setEditingCommentId(null)}
                      className="text-google-red hover:text-opacity-80"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <p className="whitespace-pre-wrap break-words flex-1 overflow-hidden text-ellipsis text-google-gray-dark">
                    {comment.text}
                  </p>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleEditComment(comment)}
                      className="text-google-gray-dark opacity-50 group-hover:text-google-blue 
                               group-hover:opacity-100 transition-all"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onDeleteComment(comment.id)}
                      className="text-google-gray-dark opacity-50 group-hover:text-google-red 
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
                className="input-field min-h-[60px] resize-y text-sm"
                autoFocus
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={handleAddComment}
                  className="text-sm px-3 py-1.5 bg-google-blue text-white rounded-lg hover:bg-opacity-90 transition-all"
                  disabled={!newComment.trim()}
                >
                  Добавить
                </button>
                <button
                  onClick={() => {
                    setShowCommentInput(false);
                    setNewComment('');
                  }}
                  className="text-sm px-3 py-1.5 bg-google-gray-light text-google-gray-dark hover:bg-opacity-90 transition-all rounded-lg"
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