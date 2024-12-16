"use client";

import { useRouter } from "next/navigation";

export default function ProductModal({ children }: { children: React.ReactNode}) {
    const router = useRouter();
    
    return (
        <>
            <button onClick={() => {
                router.back()
            }}>
                Close Modal
            </button>
            <div>
                <p>Product Modal</p>
                {children}
            </div>
        </>
    );
}