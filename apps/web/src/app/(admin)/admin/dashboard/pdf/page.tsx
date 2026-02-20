import { redirect } from "next/navigation";

export default function AdminPdfRedirectPage() {
  redirect("/admin/dashboard/pdf/editor");
}
