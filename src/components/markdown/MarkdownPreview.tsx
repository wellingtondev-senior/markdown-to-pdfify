
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownPreviewProps {
  markdown: string;
  previewRef: React.RefObject<HTMLDivElement>;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ markdown, previewRef }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-2 text-sm font-medium text-indigo-600">Pré-visualização</div>
      <div className="flex-1 overflow-y-auto rounded-lg border border-indigo-100 bg-white p-8 shadow-lg transition-all">
        <div ref={previewRef} className="markdown-preview">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({node, ...props}) => <p className="mb-4" {...props} />,
              h1: ({node, ...props}) => <h1 className="mb-6 text-indigo-900" {...props} />,
              h2: ({node, ...props}) => <h2 className="mb-5 text-indigo-800" {...props} />,
              h3: ({node, ...props}) => <h3 className="mb-4 text-indigo-700" {...props} />,
              h4: ({node, ...props}) => <h4 className="mb-3 text-indigo-600" {...props} />,
              ul: ({node, ...props}) => <ul className="mb-4 space-y-2" {...props} />,
              ol: ({node, ...props}) => <ol className="mb-4 space-y-2" {...props} />,
              li: ({node, ...props}) => <li className="ml-4" {...props} />,
              table: ({node, ...props}) => <table className="mb-4 w-full border-collapse" {...props} />,
              td: ({node, ...props}) => <td className="border border-indigo-200 p-2" {...props} />,
              th: ({node, ...props}) => <th className="border border-indigo-300 bg-indigo-50 p-2" {...props} />,
            }}
          >
            {markdown}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default MarkdownPreview;
