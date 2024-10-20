import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

interface OnoCardProps extends ComponentProps<'div'> {
  value: string | undefined,
  type: string | undefined,
}

// just so that tailwind picks this up
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const styles = ['text-red-400','text-yellow-400','text-green-400', 'text-blue-400','border-red-400','border-yellow-400','border-green-400', 'border-blue-400']

export default function OnoCard({value, type, className, ...props}:OnoCardProps){
  
  return <div className={cn(`text-${type}-400 border-${type}-400 border-2 text-2xl px-2 py-6 text-center font-semibold w-24 aspect-[9/16] flex flex-col items-center justify-center`, className)} {...props}>
    {value}
  </div>
}