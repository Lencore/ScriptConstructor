import React, { useState, useCallback, useEffect } from 'react';
import { Upload, Save, Plus, ArrowUp, ArrowDown } from 'lucide-react';
import { ScriptBlock } from './components/ScriptBlock';
import { supabase } from './lib/supabase';
import type { ScriptBlock as ScriptBlockType, ScriptData } from './types';

function App() {
  const [scriptData, setScriptData] = useState<ScriptData>({ blocks: [] });
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const blocks: ScriptBlockType[] = [];
      
      const regex = /<([ABC])>(.*?)<\/\1>/gs;
      let match;
      
      while ((match = regex.exec(text)) !== null) {
        const [, type, content] = match;
        if (type !== 'IGNORE') {
          blocks.push({
            type: type as 'A' | 'B' | 'C',
            content: content.trim(),
            comments: [],
          });
        }
      }

      setScriptData({ blocks });
      setScriptLoaded(true);
    };
    reader.readAsText(file);
  };

  const handleAddComment = useCallback((blockIndex: number, text: string) => {
    setScriptData(prev => ({
      blocks: prev.blocks.map((block, idx) =>
        idx === blockIndex
          ? {
              ...block,
              comments: [...block.comments, { id: crypto.randomUUID(), text }],
            }
          : block
      ),
    }));
  }, []);

  const handleUpdateComment = useCallback((blockIndex: number, commentId: string, text: string) => {
    setScriptData(prev => ({
      blocks: prev.blocks.map((block, idx) =>
        idx === blockIndex
          ? {
              ...block,
              comments: block.comments.map(comment =>
                comment.id === commentId ? { ...comment, text } : comment
              ),
            }
          : block
      ),
    }));
  }, []);

  const handleDeleteComment = useCallback((blockIndex: number, commentId: string) => {
    setScriptData(prev => ({
      blocks: prev.blocks.map((block, idx) =>
        idx === blockIndex
          ? {
              ...block,
              comments: block.comments.filter(comment => comment.id !== commentId),
            }
          : block
      ),
    }));
  }, []);

  const handleUpdateBlock = useCallback((blockIndex: number, content: string) => {
    setScriptData(prev => ({
      blocks: prev.blocks.map((block, idx) =>
        idx === blockIndex ? { ...block, content } : block
      ),
    }));
  }, []);

  const handleDeleteBlock = useCallback((blockIndex: number) => {
    setScriptData(prev => ({
      blocks: prev.blocks.filter((_, idx) => idx !== blockIndex),
    }));
  }, []);

  const handleTypeChange = useCallback((blockIndex: number) => {
    setScriptData(prev => ({
      blocks: prev.blocks.map((block, idx) =>
        idx === blockIndex
          ? {
              ...block,
              type: block.type === 'A' ? 'B' : block.type === 'B' ? 'C' : 'A',
            }
          : block
      ),
    }));
  }, []);

  const handleMoveBlock = useCallback((blockIndex: number, direction: 'up' | 'down') => {
    setScriptData(prev => {
      const newBlocks = [...prev.blocks];
      if (direction === 'up' && blockIndex > 0) {
        [newBlocks[blockIndex], newBlocks[blockIndex - 1]] = 
        [newBlocks[blockIndex - 1], newBlocks[blockIndex]];
      } else if (direction === 'down' && blockIndex < newBlocks.length - 1) {
        [newBlocks[blockIndex], newBlocks[blockIndex + 1]] = 
        [newBlocks[blockIndex + 1], newBlocks[blockIndex]];
      }
      return { blocks: newBlocks };
    });
  }, []);

  const handleAddNewBlock = useCallback(() => {
    setScriptData(prev => ({
      blocks: [
        ...prev.blocks,
        {
          type: 'A',
          content: 'New block content',
          comments: [],
        },
      ],
    }));
    setScriptLoaded(true);
  }, []);

  const handleSaveScript = async () => {
    try {
      const { data, error } = await supabase
        .from('scripts')
        .insert([{ data: scriptData }])
        .select()
        .single();

      if (error) throw error;

      const scriptUrl = `${window.location.origin}?script=${data.id}`;
      await navigator.clipboard.writeText(scriptUrl);
      alert('Script URL copied to clipboard!');
    } catch (error) {
      console.error('Error saving script:', error);
      alert('Failed to save script. Please try again.');
    }
  };

  const loadScriptFromUrl = async () => {
    const params = new URLSearchParams(window.location.search);
    const scriptId = params.get('script');
    
    if (scriptId) {
      try {
        const { data, error } = await supabase
          .from('scripts')
          .select('data')
          .eq('id', scriptId)
          .single();

        if (error) throw error;
        if (data) {
          setScriptData(data.data);
          setScriptLoaded(true);
        }
      } catch (error) {
        console.error('Error loading script:', error);
      }
    }
  };

  useEffect(() => {
    loadScriptFromUrl();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Video Script Constructor</h1>
          <div className="flex justify-center gap-4">
            <label className="inline-flex items-center px-6 py-3 bg-purple-600 
                            text-white rounded-full cursor-pointer hover:bg-purple-700 
                            transition-colors shadow-md hover:shadow-lg active:shadow-sm">
              <Upload className="mr-2" size={20} />
              {scriptLoaded ? 'Load Another Script' : 'Upload Script'}
              <input
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            {scriptLoaded && (
              <button
                onClick={handleSaveScript}
                className="inline-flex items-center px-6 py-3 bg-green-600 
                         text-white rounded-full hover:bg-green-700 
                         transition-colors shadow-md hover:shadow-lg active:shadow-sm"
              >
                <Save className="mr-2" size={20} />
                Save and copy link
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {scriptData.blocks.map((block, index) => (
            <ScriptBlock
              key={index}
              block={block}
              index={index}
              onAddComment={(comment) => handleAddComment(index, comment)}
              onUpdateComment={(commentId, text) => handleUpdateComment(index, commentId, text)}
              onDeleteComment={(commentId) => handleDeleteComment(index, commentId)}
              onUpdateBlock={(content) => handleUpdateBlock(index, content)}
              onDeleteBlock={() => handleDeleteBlock(index)}
              onTypeChange={() => handleTypeChange(index)}
              onMoveUp={() => handleMoveBlock(index, 'up')}
              onMoveDown={() => handleMoveBlock(index, 'down')}
              canMoveUp={index > 0}
              canMoveDown={index < scriptData.blocks.length - 1}
            />
          ))}
        </div>

        {scriptData.blocks.length === 0 ? (
          <div className="text-center text-gray-400 mt-16">
            <p className="text-lg">Upload a script file to start constructing your video script</p>
            <p className="text-sm mt-2">Supports blocks of type A, B, and C</p>
          </div>
        ) : (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleAddNewBlock}
              className="inline-flex items-center px-6 py-3 bg-purple-600 
                       text-white rounded-full hover:bg-purple-700 
                       transition-colors shadow-md hover:shadow-lg active:shadow-sm"
            >
              <Plus className="mr-2" size={20} />
              Add New Block
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;