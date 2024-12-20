"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ScrollContextType {
    scrollPosition: number;
    setScrollPosition: (position: number) => void;
}

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

export const ScrollProvider = ({ children }: { children: ReactNode }) => {
    const [scrollPosition, setScrollPosition] = useState(0);

    return (
        <ScrollContext.Provider value={{ scrollPosition, setScrollPosition }}>
            {children}
        </ScrollContext.Provider>
    );
};

export const useScroll = () => {
    const context = useContext(ScrollContext);
    if (!context) {
        throw new Error("useScroll must be used within a ScrollProvider");
    }
    return context;
};