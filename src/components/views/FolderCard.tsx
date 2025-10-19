import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { MoreVertical, FileText, Edit, Trash2, Eye } from 'lucide-react';
import type { FolderViewModel } from '../../types';

interface FolderCardProps {
  folder: FolderViewModel;
  onEdit: (folderId: string) => void;
  onDelete: (folderId: string) => void;
}

/**
 * FolderCard - Represents a single folder in the grid
 * Displays folder name, flashcard count, and action menu
 */
const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  onEdit,
  onDelete,
}) => {
  const handleEdit = () => {
    onEdit(folder.id);
  };

  const handleDelete = () => {
    onDelete(folder.id);
  };

  return (
    <Card className="hover:shadow-md transition-shadow group">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900 truncate">
          {folder.name}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FileText className="h-4 w-4" />
          <span>
            {folder.flashcard_count} {folder.flashcard_count === 1 ? 'fiszka' : 'fiszek'}
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 flex flex-col gap-2">
        <div className="flex justify-between items-center w-full gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-blue-600 hover:text-blue-700 flex-1 sm:flex-none"
            onClick={() => window.location.href = `/folders/${folder.id}`}
          >
            <Eye className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Podejrzyj folder</span>
            <span className="sm:hidden">Podejrzyj</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                aria-label={`Opcje dla folderu ${folder.name}`}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
                <Edit className="mr-2 h-4 w-4" />
                Edytuj nazwę
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete} 
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Usuń folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {folder.flashcard_count >= 10 && (
          <Button
            className="w-full bg-green-600 hover:bg-green-700"
            size="sm"
            onClick={() => window.location.href = `/study/${folder.id}`}
          >
            Rozpocznij naukę
          </Button>
        )}
        
        {folder.flashcard_count > 0 && folder.flashcard_count < 10 && (
          <div className="w-full text-left">
            <p className="text-xs text-yellow-600">
              Potrzebujesz {10 - folder.flashcard_count} więcej {10 - folder.flashcard_count === 1 ? 'fiszki' : 'fiszek'} do nauki
            </p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default FolderCard;