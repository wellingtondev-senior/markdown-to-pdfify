
import React from 'react';

interface MarkdownEditorProps {
  markdown: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isDisabled: boolean;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ 
  markdown, 
  onChange, 
  isDisabled 
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-2 text-sm font-medium text-indigo-600">Editor Markdown</div>
      <div className="relative flex-1 overflow-hidden rounded-lg border border-indigo-100 bg-white shadow-lg transition-all">
        <textarea
          value={markdown}
          onChange={onChange}
          className="absolute inset-0 resize-none p-6 font-mono text-sm bg-transparent outline-none overflow-y-auto"
          placeholder="Digite seu markdown aqui..."
          disabled={isDisabled}
        />
      </div>
    </div>
  );
};

export default MarkdownEditor;
