"use client"
import { roomStateAtom } from "@/atom";
import { useAtomValue } from "jotai";
import { useRouter } from "next/navigation";

export default function Layout({ children }: Readonly<{
  children: React.ReactNode;
}>) {
  const roomState = useAtomValue(roomStateAtom)  
  const router = useRouter()
  if(!roomState?.roomId) router.push('/create')
  return <div>{children}</div>;
}
