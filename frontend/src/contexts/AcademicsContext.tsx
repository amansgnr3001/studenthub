import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AcademicsContextType {
  academicsSubmitted: number;
  setAcademicsSubmitted: (value: number) => void;
}

const AcademicsContext = createContext<AcademicsContextType | undefined>(undefined);

interface AcademicsProviderProps {
  children: ReactNode;
}

export const AcademicsProvider: React.FC<AcademicsProviderProps> = ({ children }) => {
  // Initialize from localStorage or default to 0
  const [academicsSubmitted, setAcademicsSubmittedState] = useState<number>(() => {
    const stored = localStorage.getItem('academicsSubmitted');
    return stored ? parseInt(stored, 10) : 0;
  });

  // Custom setter that also updates localStorage
  const setAcademicsSubmitted = (value: number) => {
    setAcademicsSubmittedState(value);
    localStorage.setItem('academicsSubmitted', value.toString());
  };

  return (
    <AcademicsContext.Provider value={{ academicsSubmitted, setAcademicsSubmitted }}>
      {children}
    </AcademicsContext.Provider>
  );
};

export const useAcademics = (): AcademicsContextType => {
  const context = useContext(AcademicsContext);
  if (context === undefined) {
    throw new Error('useAcademics must be used within an AcademicsProvider');
  }
  return context;
};

export default AcademicsContext;
