
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { jsPDF } from 'jspdf';
import * as htmlToImage from 'html-to-image';
import { useToast } from '@/hooks/use-toast';
import Header from './Header';

const DEFAULT_MARKDOWN = `# Bem-vindo ao mdpdf

## Um conversor de Markdown para PDF simples e elegante

### Introdução

Este é um conversor que transforma seu markdown em PDF com facilidade.

#### Recursos:

- Visualização em tempo real
- Conversão para PDF com um clique
- Suporte para tabelas, listas e mais

#### Exemplo de tabela:

| Recurso | Suporte |
|---------|---------|
| Títulos | ✓ |
| Listas | ✓ |
| Tabelas | ✓ |
| Imagens | ✓ |

#### Exemplo de código:

\`\`\`javascript
function helloWorld() {
  console.log("Hello, world!");
}
\`\`\`

#### Como usar:

1. Escreva ou cole seu markdown no editor à esquerda
2. Veja a visualização em tempo real à direita
3. Clique em "Baixar PDF" quando estiver pronto
`;

const MarkdownConverter: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>(DEFAULT_MARKDOWN);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
  };

  const handleDownload = async () => {
    if (!previewRef.current) return;
    
    setIsDownloading(true);
    
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4',
        hotfixes: ['px_scaling'],
      });
      
      const scale = 2;
      const padding = 60;
      
      const dataUrl = await htmlToImage.toPng(previewRef.current, {
        width: previewRef.current.scrollWidth * scale,
        height: previewRef.current.scrollHeight * scale,
        style: {
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: `${previewRef.current.scrollWidth}px`,
          height: `${previewRef.current.scrollHeight}px`,
          padding: `${padding}px`,
        },
        pixelRatio: 2
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const availableWidth = pageWidth - (padding * 2);
      
      const img = new Image();
      img.src = dataUrl;
      
      await new Promise<void>((resolve) => {
        img.onload = () => {
          const imgWidth = img.width / scale;
          const imgHeight = img.height / scale;
          const ratio = imgWidth / imgHeight;
          
          const finalWidth = availableWidth;
          const finalHeight = finalWidth / ratio;
          
          let heightLeft = finalHeight;
          let position = 0;
          
          pdf.addImage(dataUrl, 'PNG', padding, padding, finalWidth, finalHeight);
          heightLeft -= (pageHeight - (padding * 2));
          position = 1;
          
          while (heightLeft > 0) {
            pdf.addPage();
            pdf.addImage(
              dataUrl, 
              'PNG', 
              padding, 
              padding - (position * (pageHeight - (padding * 2))), 
              finalWidth, 
              finalHeight
            );
            heightLeft -= (pageHeight - (padding * 2));
            position++;
          }
          
          pdf.save('mdpdf-download.pdf');
          
          toast({
            title: "PDF gerado com sucesso",
            description: "O download do seu PDF foi iniciado",
          });
          
          resolve();
        };
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <Header onDownload={handleDownload} isDownloading={isDownloading} />
      
      <main className="flex-1 overflow-hidden">
        <div className="container h-full px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col h-full">
            <div className="mb-2 text-sm font-medium text-indigo-600">Editor Markdown</div>
            <div className="relative flex-1 overflow-hidden rounded-lg border border-indigo-100 bg-white shadow-lg transition-all">
              <textarea
                value={markdown}
                onChange={handleTextChange}
                className="absolute inset-0 resize-none p-6 font-mono text-sm bg-transparent outline-none scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-transparent hover:scrollbar-thumb-indigo-400"
                placeholder="Digite seu markdown aqui..."
                disabled={isDownloading}
              />
            </div>
          </div>
          
          <div className="flex flex-col h-full">
            <div className="mb-2 text-sm font-medium text-indigo-600">Pré-visualização</div>
            <div 
              className="flex-1 overflow-auto rounded-lg border border-indigo-100 bg-white p-8 shadow-lg transition-all scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-transparent hover:scrollbar-thumb-indigo-400"
            >
              <div 
                ref={previewRef}
                className="markdown-preview"
              >
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
        </div>
      </main>
    </div>
  );
};

export default MarkdownConverter;
