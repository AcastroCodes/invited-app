import React, { createContext, useContext, useState, useEffect } from 'react';

interface PartnerContextType {
  selectedPartner: string | number; // 'all' or partner id
  setSelectedPartner: (id: string | number) => void;
}

const PartnerContext = createContext<PartnerContextType>({
  selectedPartner: 'all',
  setSelectedPartner: () => {},
});

export function PartnerProvider({ children }: { children: React.ReactNode }) {
  const [selectedPartner, setSelectedPartner] = useState<string | number>('all');

  return (
    <PartnerContext.Provider value={{ selectedPartner, setSelectedPartner }}>
      {children}
    </PartnerContext.Provider>
  );
}

export function usePartner() {
  return useContext(PartnerContext);
}
