import React from "react";

export default function CategoryLayout({ children, modal }: {
    children: React.ReactNode;
    modal: React.ReactNode;
}) {
    return (
        <>
            {children}
            {modal}
        </>
    )
}