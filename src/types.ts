export interface ScriptBlock {
  type: 'A' | 'B' | 'C';
  content: string;
  comments: Comment[];
}

export interface Comment {
  id: string;
  text: string;
}

export interface ScriptData {
  blocks: ScriptBlock[];
}

export interface SavedScript {
  id: string;
  data: ScriptData;
  created_at: string;
}