"use client";

import { logoutAdmin } from "@/actions/admin/auth";
import Icon from "@/components/Icon";
import LeftPanelCloseIcon from "@material-symbols/svg-400/rounded/left_panel_close.svg";
import LeftPanelOpenIcon from "@material-symbols/svg-400/rounded/left_panel_open.svg";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type RefObject, useEffect, useRef, useState } from "react";

const sections = [
  { label: "Products", href: "/admin/dashboard/products" },
  { label: "Categories", href: "/admin/dashboard/categories" },
  { label: "PDFs", href: "/admin/dashboard/pdf" },
  { label: "Orders", href: "/admin/dashboard/orders" },
];

function SidebarContent({
  onNavigate,
  onCollapse,
  collapseButtonRef,
}: {
  onNavigate?: () => void;
  onCollapse: () => void;
  collapseButtonRef?: RefObject<HTMLButtonElement | null>;
}) {
  const pathname = usePathname();

  return (
    <>
      <div className="flex items-center justify-between gap-2 border-b-4 border-slate-900 px-4 py-4">
        <span className="text-xl font-bold tracking-wide uppercase">Admin</span>
        <button
          ref={collapseButtonRef}
          type="button"
          aria-label="Collapse"
          title="Collapse"
          onClick={onCollapse}
          className="inline-flex h-11 w-11 items-center justify-center rounded-md border-2 border-slate-500 hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <Icon component={LeftPanelCloseIcon} />
        </button>
      </div>
      <nav aria-label="Admin navigation" className="flex-1 space-y-2 p-4">
        {sections.map(({ label, href }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`block border-l-4 px-4 py-3 font-bold tracking-wide uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                active
                  ? "border-white bg-slate-700 text-white"
                  : "border-transparent text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
      <form action={logoutAdmin} className="border-t-4 border-slate-900 p-4">
        <button
          type="submit"
          className="w-full bg-red-700 px-4 py-3 text-left font-bold tracking-wide text-white uppercase transition-colors hover:bg-red-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Logout
        </button>
      </form>
    </>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const expandRef = useRef<HTMLButtonElement>(null);
  const collapseRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (desktop.matches) dialogRef.current?.close();
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  return (
    <>
      <aside
        id="admin-sidebar"
        aria-label="Admin sidebar"
        className={`${isCollapsed ? "hidden" : "hidden lg:flex"} h-full w-60 shrink-0 flex-col overflow-y-auto border-r-4 border-slate-900 bg-slate-800 text-white`}
      >
        <SidebarContent
          collapseButtonRef={collapseRef}
          onCollapse={() => {
            setIsCollapsed(true);
            requestAnimationFrame(() => expandRef.current?.focus());
          }}
        />
      </aside>
      <button
        type="button"
        aria-label="Expand"
        title="Expand"
        aria-expanded={false}
        aria-controls="admin-sidebar"
        ref={expandRef}
        onClick={() => {
          setIsCollapsed(false);
          requestAnimationFrame(() => collapseRef.current?.focus());
        }}
        className={`${isCollapsed ? "hidden lg:block" : "hidden"} fixed top-4 left-4 z-40 h-11 w-11 rounded-md bg-slate-800 p-2.5 text-white shadow-lg hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-800`}
      >
        <Icon component={LeftPanelOpenIcon} />
      </button>
      <button
        type="button"
        aria-label="Expand"
        title="Expand"
        aria-expanded={isOpen}
        aria-controls="admin-sidebar-drawer"
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-40 h-11 w-11 rounded-md bg-slate-800 p-2.5 text-white shadow-lg hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-800 lg:hidden"
      >
        <Icon component={LeftPanelOpenIcon} />
      </button>
      <dialog
        ref={dialogRef}
        id="admin-sidebar-drawer"
        aria-label="Admin sidebar"
        onClose={() => setIsOpen(false)}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const controls = event.currentTarget.querySelectorAll<HTMLElement>(
            "a[href], button:not([disabled])"
          );
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) setIsOpen(false);
        }}
        className="fixed inset-0 m-0 h-dvh max-h-none w-72 max-w-[calc(100vw-3rem)] border-0 bg-slate-800 p-0 text-white backdrop:bg-black/60"
      >
        <div className="flex h-full flex-col overflow-y-auto border-r-4 border-slate-900">
          <SidebarContent
            onCollapse={() => setIsOpen(false)}
            onNavigate={() => setIsOpen(false)}
          />
        </div>
      </dialog>
    </>
  );
}
