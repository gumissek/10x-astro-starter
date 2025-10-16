import { useState, useEffect, useCallback } from 'react';
import type { FolderViewModel } from '../../types';


interface UseDashboardStateReturn {
  // State
  folders: FolderViewModel[];
  isLoading: boolean;
  error: string | null;
  editingFolder: FolderViewModel | null;
  deletingFolder: FolderViewModel | null;
  
  // Actions
  handleRefresh: () => void;
  handleEditFolder: (folderId: string) => void;
  handleDeleteFolder: (folderId: string) => void;
  handleCloseEditDialog: () => void;
  handleCloseDeleteDialog: () => void;
  handleSaveFolder: (folderId: string, newName: string) => Promise<void>;
  handleConfirmDelete: (folderId: string) => Promise<void>;
}

/**
 * Custom hook for managing Dashboard state
 * Encapsulates logic for managing folders, loading, errors, and interactions with API
 * @param userId - The ID of the currently authenticated user
 */
export function useDashboardState(userId: string): UseDashboardStateReturn {
  const [folders, setFolders] = useState<FolderViewModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editingFolder, setEditingFolder] = useState<FolderViewModel | null>(null);
  const [deletingFolder, setDeletingFolder] = useState<FolderViewModel | null>(null);

  /**
   * Fetches folders from API with flashcard counts (N+1 queries approach)
   * Step 1: Get list of folders
   * Step 2: For each folder, get details with flashcard count
   * Result: Array of FolderViewModel[]
   */
  const fetchFolders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Fetch list of folders
      const foldersResponse = await fetch(`/api/folders?user_id=${userId}&limit=50`);
      
      if (!foldersResponse.ok) {
        const errorData = await foldersResponse.json();
        throw new Error(errorData.message || 'Failed to fetch folders');
      }

      const foldersResult = await foldersResponse.json();
      
      if (!foldersResult.success) {
        throw new Error(foldersResult.message || 'Failed to fetch folders');
      }

      const foldersList = foldersResult.data.folders;

      // If no folders, return empty array
      if (!foldersList || foldersList.length === 0) {
        setFolders([]);
        return;
      }

      // Step 2: Fetch details for each folder (including flashcard count)
      const folderDetailsPromises = foldersList.map(async (folder: any) => {
        const detailsResponse = await fetch(`/api/folders/${folder.id}?user_id=${userId}`);
        
        if (!detailsResponse.ok) {
          // If details fetch fails, fallback to basic folder data with 0 count
          console.warn(`Failed to fetch details for folder ${folder.id}`);
          return {
            id: folder.id,
            name: folder.name,
            created_at: folder.created_at,
            updated_at: folder.updated_at,
            flashcard_count: 0,
          } as FolderViewModel;
        }

        const detailsResult = await detailsResponse.json();
        
        if (!detailsResult.success) {
          // If details fetch fails, fallback to basic folder data with 0 count
          console.warn(`Failed to fetch details for folder ${folder.id}: ${detailsResult.message}`);
          return {
            id: folder.id,
            name: folder.name,
            created_at: folder.created_at,
            updated_at: folder.updated_at,
            flashcard_count: 0,
          } as FolderViewModel;
        }

        return {
          id: detailsResult.data.id,
          name: detailsResult.data.name,
          created_at: detailsResult.data.created_at,
          updated_at: detailsResult.data.updated_at,
          flashcard_count: detailsResult.data.flashcard_count || 0,
        } as FolderViewModel;
      });

      const foldersWithDetails = await Promise.all(folderDetailsPromises);
      setFolders(foldersWithDetails);

    } catch (err) {
      console.error('Error fetching folders:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  /**
   * Initialize data loading on component mount
   */
  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  /**
   * Handle refresh action - refetch all folders
   */
  const handleRefresh = useCallback(() => {
    fetchFolders();
  }, [fetchFolders]);

  /**
   * Handle edit folder action - open edit dialog
   */
  const handleEditFolder = useCallback((folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
      setEditingFolder(folder);
    }
  }, [folders]);

  /**
   * Handle delete folder action - open delete confirmation dialog
   */
  const handleDeleteFolder = useCallback((folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
      setDeletingFolder(folder);
    }
  }, [folders]);

  /**
   * Close edit dialog
   */
  const handleCloseEditDialog = useCallback(() => {
    setEditingFolder(null);
  }, []);

  /**
   * Close delete confirmation dialog
   */
  const handleCloseDeleteDialog = useCallback(() => {
    setDeletingFolder(null);
  }, []);

  /**
   * Save folder name changes
   */
  const handleSaveFolder = useCallback(async (folderId: string, newName: string) => {
    try {
      const response = await fetch(`/api/folders/${folderId}?user_id=${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update folder');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update folder');
      }

      // Update local state with new folder data
      setFolders(prevFolders => 
        prevFolders.map(folder => 
          folder.id === folderId 
            ? { ...folder, name: newName, updated_at: result.data.updated_at }
            : folder
        )
      );

      // Close edit dialog
      setEditingFolder(null);

    } catch (err) {
      console.error('Error updating folder:', err);
      throw err; // Re-throw to let the component handle the error display
    }
  }, [userId]);

  /**
   * Confirm folder deletion
   */
  const handleConfirmDelete = useCallback(async (folderId: string) => {
    try {
      const response = await fetch(`/api/folders/${folderId}?user_id=${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete folder');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to delete folder');
      }

      // Remove folder from local state
      setFolders(prevFolders => prevFolders.filter(folder => folder.id !== folderId));

      // Close delete dialog
      setDeletingFolder(null);

    } catch (err) {
      console.error('Error deleting folder:', err);
      throw err; // Re-throw to let the component handle the error display
    }
  }, [userId]);

  return {
    folders,
    isLoading,
    error,
    editingFolder,
    deletingFolder,
    handleRefresh,
    handleEditFolder,
    handleDeleteFolder,
    handleCloseEditDialog,
    handleCloseDeleteDialog,
    handleSaveFolder,
    handleConfirmDelete,
  };
}