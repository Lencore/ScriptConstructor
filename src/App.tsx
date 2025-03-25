import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Upload, Save, Plus, ArrowUp, ArrowDown, Filter, Target, X } from 'lucide-react';
import { ScriptBlock } from './components/ScriptBlock';
import { FilterMenu } from './components/FilterMenu';
import { supabase } from './lib/supabase';
import type { ScriptBlock as ScriptBlockType, ScriptData } from './types';

function App() {
  const [scriptData, setScriptData] = useState<ScriptData>({ blocks: [] });
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [filterTypes, setFilterTypes] = useState<string[]>([]);
  const [focusTypes, setFocusTypes] = useState<string[]>([]);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isFocusMenuOpen, setIsFocusMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Очищаем предыдущие данные
    setScriptData({ blocks: [] });
    setScriptLoaded(false);
    setFilterTypes([]);
    setFocusTypes([]);
    setIsFilterMenuOpen(false);
    setIsFocusMenuOpen(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const blocks: ScriptBlockType[] = [];
      
      const regex = /<(A|B|C)>(.*?)<\/\1>/gs;
      let match;
      
      while ((match = regex.exec(text)) !== null) {
        const [, type, content] = match;
        blocks.push({
          type: type as 'A' | 'B' | 'C',
          content: content.trim(),
          comments: [],
        });
      }

      setScriptData({ blocks });
      setScriptLoaded(true);
      
      // Сбрасываем значение input'а
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
          content: 'Новый блок',
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
      alert('Ссылка на скрипт скопирована в буфер обмена!');
    } catch (error) {
      console.error('Error saving script:', error);
      alert('Не удалось сохранить скрипт. Пожалуйста, попробуйте снова.');
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

  const handleFilterToggle = (type: string) => {
    setFilterTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleFocusToggle = (type: string) => {
    setFocusTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const resetFilter = () => setFilterTypes([]);
  const resetFocus = () => setFocusTypes([]);

  const isBlockVisible = (type: string) => {
    return filterTypes.length === 0 || filterTypes.includes(type);
  };

  const getBlockOpacity = (type: string) => {
    if (focusTypes.length === 0) return 'opacity-100';
    return focusTypes.includes(type) ? 'opacity-100' : 'opacity-10 hover:opacity-100';
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Video Script Constructor by 3310</h1>
          <div className="flex flex-col items-center gap-4">
            <div className="flex justify-center gap-4">
              <label className="inline-flex items-center px-6 py-3 bg-purple-600 
                              text-white rounded-full cursor-pointer hover:bg-purple-700 
                              transition-colors shadow-md hover:shadow-lg active:shadow-sm">
                <Upload className="mr-2" size={20} />
                {scriptLoaded ? 'Загрузить другой скрипт' : 'Загрузить скрипт'}
                <input
                  ref={fileInputRef}
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
                  Сохранить и скопировать ссылку
                </button>
              )}
            </div>

            {scriptLoaded && (
              <div className="flex justify-center gap-4">
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsFilterMenuOpen(!isFilterMenuOpen);
                      setIsFocusMenuOpen(false);
                    }}
                    className="inline-flex items-center px-4 py-2 bg-gray-100 
                             text-gray-700 rounded-lg hover:bg-gray-200 
                             transition-colors"
                  >
                    <Filter className="mr-2" size={16} />
                    Фильтр
                    {filterTypes.length > 0 && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          resetFilter();
                        }}
                        className="ml-2 p-1 hover:bg-gray-300 rounded-full cursor-pointer"
                      >
                        <X size={14} />
                      </span>
                    )}
                  </button>
                  <FilterMenu
                    title="Фильтр"
                    selectedTypes={filterTypes}
                    onTypeToggle={handleFilterToggle}
                    onReset={resetFilter}
                    isOpen={isFilterMenuOpen}
                    onClose={() => setIsFilterMenuOpen(false)}
                  />
                </div>

                <div className="relative">
                  <button
                    onClick={() => {
                      setIsFocusMenuOpen(!isFocusMenuOpen);
                      setIsFilterMenuOpen(false);
                    }}
                    className="inline-flex items-center px-4 py-2 bg-gray-100 
                             text-gray-700 rounded-lg hover:bg-gray-200 
                             transition-colors"
                  >
                    <Target className="mr-2" size={16} />
                    Фокусировка
                    {focusTypes.length > 0 && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          resetFocus();
                        }}
                        className="ml-2 p-1 hover:bg-gray-300 rounded-full cursor-pointer"
                      >
                        <X size={14} />
                      </span>
                    )}
                  </button>
                  <FilterMenu
                    title="Фокусировка"
                    selectedTypes={focusTypes}
                    onTypeToggle={handleFocusToggle}
                    onReset={resetFocus}
                    isOpen={isFocusMenuOpen}
                    onClose={() => setIsFocusMenuOpen(false)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {scriptData.blocks.map((block, index) => (
            isBlockVisible(block.type) && (
              <div
                key={index}
                className={`transition-opacity duration-300 ${getBlockOpacity(block.type)}`}
              >
                <ScriptBlock
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
              </div>
            )
          ))}
        </div>

        {scriptData.blocks.length === 0 ? (
          <div className="text-center text-gray-400 mt-16">
            <p className="text-lg">Загрузите файл скрипта, чтобы начать создание видеоскрипта</p>
            <p className="text-sm mt-2">Поддерживаются блоки типа A, B и C</p>
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
              Добавить новый блок
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;