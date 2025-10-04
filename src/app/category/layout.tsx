import React from "react";

export default function CategoryLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      <div className="w-full">{children}</div>
      <div>{modal}</div>
    </>
  );
}
