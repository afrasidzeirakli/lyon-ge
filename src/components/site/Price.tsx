import clsx from "clsx";
import { formatPrice } from "@/lib/money";

type Props = {
  price: number;
  finalPrice: number;
  className?: string;
  size?: "sm" | "md" | "lg";
};

export function Price({ price, finalPrice, className, size = "md" }: Props) {
  const discounted = finalPrice < price;
  const main = { sm: "text-[14px]", md: "text-[15px]", lg: "text-2xl" }[size];
  const strike = { sm: "text-[12px]", md: "text-[13px]", lg: "text-base" }[size];
  return (
    <span className={clsx("inline-flex flex-wrap items-baseline gap-x-2", className)}>
      <span className={clsx("font-semibold tabular-nums", main, discounted && "text-accent")}>{formatPrice(finalPrice)}</span>
      {discounted ? <span className={clsx("text-muted-2 line-through tabular-nums", strike)}>{formatPrice(price)}</span> : null}
    </span>
  );
}
