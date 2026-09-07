"use client";

import { useActionState } from "react";
import { LoaderCircle, LogIn } from "lucide-react";
import { login, type LoginState } from "@/app/(admin)/admin/login/actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium">მომხმარებელი</span>
        <input name="username" autoComplete="username" required className="field" autoFocus />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium">პაროლი</span>
        <input name="password" type="password" autoComplete="current-password" required className="field" />
      </label>
      {state.error ? <p className="rounded-xl bg-danger/10 px-4 py-2.5 text-[13px] text-danger">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />} შესვლა
      </button>
    </form>
  );
}
