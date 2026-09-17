"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME } from "@/lib/auth";

export async function sairAction(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
  redirect("/login");
}
