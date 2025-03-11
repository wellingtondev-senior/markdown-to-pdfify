
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
      // Criar um novo documento PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4',
        hotfixes: ['px_scaling'],
      });
      
      const scale = 2; // Melhor qualidade
      const padding = 40; // Padding nas bordas
      
      // Capturar o conteúdo do preview como uma imagem
      const dataUrl = await htmlToImage.toPng(previewRef.current, {
        width: previewRef.current.scrollWidth * scale,
        height: previewRef.current.scrollHeight * scale,
        style: {
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: `${previewRef.current.scrollWidth}px`,
          height: `${previewRef.current.scrollHeight}px`,
        },
        pixelRatio: 2
      });
      
      // Calcular a largura e altura disponíveis na página
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const availableWidth = pageWidth - (padding * 2);
      
      // Carregar a imagem
      const img = new Image();
      img.src = dataUrl;
      
      await new Promise<void>((resolve) => {
        img.onload = () => {
          // Calcular o fator de escala para ajustar a largura
          const imgWidth = img.width / scale;
          const imgHeight = img.height / scale;
          const ratio = imgWidth / imgHeight;
          
          // Ajustar à largura disponível
          const finalWidth = availableWidth;
          const finalHeight = finalWidth / ratio;
          
          // Adicionar a imagem à primeira página
          let heightLeft = finalHeight;
          let position = 0;
          
          // Adicionar a primeira parte da imagem
          pdf.addImage(dataUrl, 'PNG', padding, padding, finalWidth, finalHeight);
          heightLeft -= (pageHeight - (padding * 2));
          position = 1;
          
          // Se a altura da imagem for maior que a altura da página, criar novas páginas
          while (heightLeft > 0) {
            // Adicionar nova página
            pdf.addPage();
            
            // Adicionar a parte seguinte da imagem
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
          
          // Salvar o PDF
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
    <div className="flex flex-col h-screen">
      <Header onDownload={handleDownload} isDownloading={isDownloading} />
      
      <main className="flex-1 overflow-hidden">
        <div className="container h-full px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Editor */}
          <div className="flex flex-col h-full">
            <div className="mb-2 text-sm font-medium text-muted-foreground">Editor Markdown</div>
            <div className="relative flex-1 overflow-hidden rounded-lg border bg-background shadow-sm transition-all">
              <textarea
                value={markdown}
                onChange={handleTextChange}
                className="absolute inset-0 resize-none p-4 font-mono text-sm bg-transparent outline-none"
                placeholder="Digite seu markdown aqui..."
                disabled={isDownloading}
              />
            </div>
          </div>
          
          {/* Preview */}
          <div className="flex flex-col h-full">
            <div className="mb-2 text-sm font-medium text-muted-foreground">Pré-visualização</div>
            <div 
              className="flex-1 overflow-auto rounded-lg border bg-white p-6 shadow-sm transition-all"
            >
              <div 
                ref={previewRef}
                className="markdown-preview"
              >
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Apply the prose classes to the root div instead of directly on ReactMarkdown
                    root: ({ children }) => (
                      <div className="prose prose-sm md:prose-base lg:prose-lg max-w-none">
                        {children}
                      </div>
                    )
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
