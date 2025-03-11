
import React, { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import Header from './Header';
import MarkdownEditor from './markdown/MarkdownEditor';
import MarkdownPreview from './markdown/MarkdownPreview';
import { generatePDF } from '@/utils/pdfGenerator';
import { DEFAULT_MARKDOWN } from '@/constants/markdownDefaults';

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
      await generatePDF(previewRef.current);
      
      toast({
        title: "PDF gerado com sucesso",
        description: "O download do seu PDF foi iniciado",
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
          <MarkdownEditor 
            markdown={markdown} 
            onChange={handleTextChange} 
            isDisabled={isDownloading} 
          />
          
          <MarkdownPreview 
            markdown={markdown} 
            previewRef={previewRef} 
          />
        </div>
      </main>
    </div>
  );
};

export default MarkdownConverter;
