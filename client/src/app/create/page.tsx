"use client";
import { playerAtom, roomStateAtom, socket } from "@/atom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSetAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const CreateSchema = z.object({
  username: z.string().refine(s => !s.includes(' '), 'No Spaces!'),
  roomId: z.string().refine(s => !s.includes(' '), 'No Spaces!')
});

type CreateSchemaType = z.infer<typeof CreateSchema>;


export default function Create() {
  // defining all the hooks
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateSchemaType>({ resolver: zodResolver(CreateSchema) });
  const setRoomState = useSetAtom(roomStateAtom)
  const setPlayerState = useSetAtom(playerAtom)
  const router = useRouter()
  const onSubmit: SubmitHandler<CreateSchemaType> = (data) => {
    socket.emit("create", data)
    socket.on("roomState", message => {
      setPlayerState({username: data.username, hand: []})
      setRoomState(message)
    })
    toast.success(`Room ${data.roomId} has been created!`)
    router.push('play')
  };
  return (
    <div className="flex flex-col justify-center items-center w-full h-screen">
      <Card className="w-fit">
        <CardHeader>
          <CardTitle>Create a room</CardTitle>
          <CardDescription>Room banade, nhi toh abhi se 8 card</CardDescription>
        </CardHeader>
        <CardContent >
          <form className="space-y-2"  onSubmit={handleSubmit(onSubmit)}>
            <Input placeholder="username" {...register("username")} />
            {errors.username && <p className="text-xs text-red-600">{errors.username.message}</p>}
            <Input placeholder="roomId" {...register("roomId")} />
            {errors.roomId && <p className="text-xs text-red-600">{errors.roomId.message}</p>}
            <Button type="submit" className="w-full">
              Submit
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
