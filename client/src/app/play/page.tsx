"use client";
import { playerAtom, roomStateAtom } from "@/atom";
import OnoCard from "@/components/ono-card";
import { Separator } from "@/components/ui/separator";
import { useAtom } from "jotai";
import Image from "next/image";

export default function Play() {
  // declaring the hooks
  const [roomState, setRoomState] = useAtom(roomStateAtom);
  const [playerState, setPlayerState] = useAtom(playerAtom);

  console.log(roomState);
  // now we need to extract the player details from the gameState
  const currentPlayer = roomState?.players.find(
    (val) => val.username == playerState?.username
  );
  setPlayerState(currentPlayer);
  return (
    <div className="relative flex flex-col w-full h-screen">
      <div className="absolute flex flex-col justify-center items-start p-2 gap-2">
        <div className="">
        <h1 className="">Players in the room</h1>
        <Separator />
        </div>
        {roomState?.players.map((val,index)=>{
          return <div className="text-sm" key={index}>
            {val.username}
          </div>
        })}
      </div>
      <div className="relative flex flex-col justify-center items-center">
        <OnoCard className="absolute bg-background" value={roomState?.gameState.discardDeck.at(-1)?.value} type={roomState?.gameState.discardDeck.at(-1)?.type}  />
        <Image src={"/chatai.png"} alt="chatai" width={700} height={500} />
      </div>
      <div className="flex justify-center items-center gap-2 ">
        {playerState?.hand.map((card, index) => {
          return <OnoCard className="hover:mb-5 transition-all cursor-pointer" key={index} value={card.value} type={card.type} />;
        })}
      </div>
    </div>
  );
}
