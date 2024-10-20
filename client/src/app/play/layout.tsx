"use client"
import { roomStateAtom } from "@/atom";
import { useAtomValue } from "jotai";
import { useRouter } from "next/navigation";
import { ComponentProps } from "react";

export default function Layout({ children }: ComponentProps<"div">) {
  const roomState = useAtomValue(roomStateAtom)  
  const router = useRouter()
  // if(!roomState?.roomId) router.push('/create')
  return <div>{children}</div>;
}
