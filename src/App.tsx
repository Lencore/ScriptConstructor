import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Upload, Save, Plus, ArrowUp, ArrowDown, Filter, Target, X, Download } from 'lucide-react';
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

  const isOldFormat = (text: string): boolean => {
    return /<[ABC]>(.*?)<\/[ABC]>/gs.test(text);
  };

  const convertOldFormatToNew = (text: string): string => {
    const blocks: string[] = [];
    const regex = /<([ABC])>(.*?)<\/\1>/gs;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      const [, type, content] = match;
      blocks.push(`${content.trim()}\n[["${type}"], [""]]`);
    }
    
    return blocks.join('\n\n');
  };

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
      let text = e.target?.result as string;
      
      // Проверяем формат и конвертируем при необходимости
      if (isOldFormat(text)) {
        text = convertOldFormatToNew(text);
      }
      
      const blocks: ScriptBlockType[] = [];
      
      // Разделяем текст на блоки по двойным отступам
      const blockTexts = text.split('\n\n');
      
      for (const blockText of blockTexts) {
        // Ищем комментарий в конце блока
        const commentMatch = blockText.match(/\[\["([ABC])"\],\s*\["([^"]*)"\]\]\s*$/);
        
        if (commentMatch) {
          const [, type, comment] = commentMatch;
          const content = blockText.replace(/\[\["([ABC])"\],\s*\["([^"]*)"\]\]\s*$/, '').trim();
          
          blocks.push({
            type: type as 'A' | 'B' | 'C',
            content: content,
            comments: comment ? [{ id: crypto.randomUUID(), text: comment }] : [],
          });
        } else {
          // Если комментария нет, создаем блок типа A
          blocks.push({
            type: 'A',
            content: blockText.trim(),
            comments: [],
          });
        }
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

  const handleDownloadScript = () => {
    const scriptText = scriptData.blocks.map(block => {
      const content = block.content;
      const comment = block.comments[0]?.text || '';
      return `${content}\n[["${block.type}"], ["${comment}"]]`;
    }).join('\n\n');

    const blob = new Blob([scriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'script.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          // Проверяем формат данных и конвертируем при необходимости
          let scriptData = data.data;
          if (scriptData.blocks && scriptData.blocks.length > 0) {
            const firstBlock = scriptData.blocks[0];
            if (!firstBlock.comments) {
              // Это старый формат, конвертируем в новый
              scriptData = {
                blocks: scriptData.blocks.map((block: ScriptBlockType) => ({
                  ...block,
                  comments: []
                }))
              };
            }
          }
          setScriptData(scriptData);
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
    <div className="min-h-screen bg-gradient-to-br from-google-gray-light to-google-gray-lighter">
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-12 text-center">
          <h1 className="section-title text-4xl">Video Script Constructor by 3310</h1>
          <div className="flex flex-col items-center gap-4">
            <div className="flex justify-center gap-4">
              <label className="btn-primary inline-flex items-center cursor-pointer">
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
                <>
                  <button
                    onClick={handleSaveScript}
                    className="btn-primary inline-flex items-center bg-google-green hover:bg-opacity-90"
                  >
                    <Save className="mr-2" size={20} />
                    Сохранить скрипт
                  </button>
                  <button
                    onClick={handleDownloadScript}
                    className="btn-primary inline-flex items-center bg-google-blue hover:bg-opacity-90"
                  >
                    <Download className="mr-2" size={20} />
                    Скачать скрипт
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => {
                        setIsFilterMenuOpen(!isFilterMenuOpen);
                        setIsFocusMenuOpen(false);
                      }}
                      className="btn-primary bg-google-yellow hover:bg-opacity-90 inline-flex items-center"
                    >
                      <Filter className="mr-2" size={20} />
                      Фильтры
                    </button>
                    {isFilterMenuOpen && (
                      <FilterMenu
                        title="Фильтры"
                        filterTypes={filterTypes}
                        onToggle={handleFilterToggle}
                        onReset={resetFilter}
                        onClose={() => setIsFilterMenuOpen(false)}
                      />
                    )}
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => {
                        setIsFocusMenuOpen(!isFocusMenuOpen);
                        setIsFilterMenuOpen(false);
                      }}
                      className="btn-primary bg-google-red hover:bg-opacity-90 inline-flex items-center"
                    >
                      <Target className="mr-2" size={20} />
                      Фокус
                    </button>
                    {isFocusMenuOpen && (
                      <FilterMenu
                        title="Фокус"
                        filterTypes={focusTypes}
                        onToggle={handleFocusToggle}
                        onReset={resetFocus}
                        onClose={() => setIsFocusMenuOpen(false)}
                      />
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {scriptLoaded && (
          <div className="space-y-6">
            <div className="space-y-8 mt-8">
              {scriptData.blocks.map((block, index) => (
                isBlockVisible(block.type) && (
                  <div key={index} className={getBlockOpacity(block.type)}>
                    <ScriptBlock
                      block={block}
                      index={index}
                      onUpdate={(content) => handleUpdateBlock(index, content)}
                      onDelete={() => handleDeleteBlock(index)}
                      onTypeChange={() => handleTypeChange(index)}
                      onMove={(direction) => handleMoveBlock(index, direction)}
                      onAddComment={(comment) => handleAddComment(index, comment)}
                      onUpdateComment={(commentId, text) => handleUpdateComment(index, commentId, text)}
                      onDeleteComment={(commentId) => handleDeleteComment(index, commentId)}
                      canMoveUp={index > 0}
                      canMoveDown={index < scriptData.blocks.length - 1}
                    />
                  </div>
                )
              ))}
            </div>

            <div className="flex justify-center mt-8">
              <button
                onClick={handleAddNewBlock}
                className="btn-primary bg-google-blue hover:bg-opacity-90 inline-flex items-center"
              >
                <Plus className="mr-2" size={20} />
                Добавить блок
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;