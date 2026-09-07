"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

type Props = {
  message: string;
  className?: string;
  children: ReactNode;
  /** სხვა server action ამავე ფორმისთვის (მაგ. „ნაგულისხმევის აღდგენა“) */
  formAction?: (formData: FormData) => void | Promise<void>;
};

/** submit ღილაკი დადასტურების დიალოგით (წაშლა, აღდგენა და ა.შ.). */
export function ConfirmSubmit({ message, className, children, formAction }: Props) {
  return (
    <button
      type="submit"
      formAction={formAction}
      className={clsx("btn btn-sm text-danger hover:bg-danger/10", className)}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
