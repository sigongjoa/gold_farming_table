"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface CharacterSelectionContextType {
  selectedServer: string | null;
  selectedCharacter: { id: number; name: string; level: number; profession_name: string; } | null;
  handleServerCharacterSelect: (server: string, character: { id: number; name: string; level: number; profession_name: string; }) => void;
}

const CharacterSelectionContext = createContext<CharacterSelectionContextType | undefined>(undefined);

export function CharacterSelectionProvider({ children }: { children: ReactNode }) {
  console.debug('CharacterSelectionProvider: Component rendering');
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<{ id: number; name: string; level: number; profession_name: string; } | null>(null);

  const handleServerCharacterSelect = useCallback((server: string, character: { id: number; name: string; level: number; profession_name: string; }) => {
    setSelectedServer(server);
    setSelectedCharacter(character);
  }, []);

  return (
    <CharacterSelectionContext.Provider value={{ selectedServer, selectedCharacter, handleServerCharacterSelect }}>
      {children}
    </CharacterSelectionContext.Provider>
  );
}

export function useCharacterSelection() {
  const context = useContext(CharacterSelectionContext);
  if (context === undefined) {
    throw new Error('useCharacterSelection must be used within a CharacterSelectionProvider');
  }
  return context;
} 