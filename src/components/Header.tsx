
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HeaderProps {
  onDownload: () => void;
  isDownloading: boolean;
}

const Header: React.FC<HeaderProps> = ({ onDownload, isDownloading }) => {
  const { toast } = useToast();
  
  const handleDownload = () => {
    try {
      onDownload();
    } catch (error) {
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="border-b backdrop-blur-sm bg-background/90 sticky top-0 z-50 w-full">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-xl tracking-tight">mdpdf</span>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            onClick={handleDownload} 
            disabled={isDownloading}
            variant="default" 
            size="sm" 
            className="transition-all duration-300 ease-in-out"
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? "Gerando PDF..." : "Baixar PDF"}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
