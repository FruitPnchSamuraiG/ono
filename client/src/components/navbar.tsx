"use client";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export default function Navbar() {
  const router = useRouter();
  return (
    <div className="sticky top-0 flex justify-between p-2">
      <div>
        <h1 className="bg-primary text-secondary p-1 font-semibold text-2xl">
          ONO
        </h1>
      </div>
      <div className="flex gap-2">
        <Button onClick={()=>router.push('/create')} variant="default">Create</Button>
        <Button onClick={()=>router.push('/join')} variant="secondary">Join</Button>
      </div>
    </div>
  );
}
