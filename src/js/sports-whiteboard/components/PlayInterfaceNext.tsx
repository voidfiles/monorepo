// @refresh reset
import Head from "next/head";
import DrawNav from "../components/DrawNav";
import StateDropdown from "../components/StateDropdown";
import FrameNav from "../components/FrameNav";
import { User } from "firebase/auth";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import PlayStage from "./PlayStage";
import PlayerMenu from "./PlayerMenu";

type PlayInterfaceInput = {
  user: User;
};

const PlayInterfaceNext: React.FC<PlayInterfaceInput> = ({ user }) => {
  return (
    <>
      <Head>
        <link
          rel="preconnect"
          href="https://sports-whiteboard-b93df.firebaseapp.com"
        />
        <link rel="preconnect" href="https://identitytoolkit.googleapis.com" />
        <link rel="preconnect" href="https://apis.google.com" />
        <link
          rel="dns-prefetch"
          href="https://sports-whiteboard-b93df.firebaseapp.com"
        />
        <link
          rel="dns-prefetch"
          href="https://identitytoolkit.googleapis.com"
        />
        <link rel="dns-prefetch" href="https://apis.google.com" />
      </Head>
      <div className="h-screen w-screen static">
        <div className="absolute top-1 left-14 z-10">
          <DrawNav></DrawNav>
        </div>
        <div className="absolute top-1 right-1 z-10">
          <StateDropdown user={user}></StateDropdown>
        </div>
        <div className="absolute left-1 top-3 md:top-14 z-10">
          <FrameNav></FrameNav>
        </div>
        <div className="absolute right-1 bottom-1  z-10">
          <button
            id="zoom-out"
            onClick={() => {
              // zoomInBy(stageRef.current!, -0.2, null, null);
            }}
            className="border-gray-300 border font-medium hover:bg-gray-100 inline-flex items-center p-2 relative text-gray-500"
          >
            <MinusIcon className="h-6 w-6"></MinusIcon>
          </button>
          <button
            id="zoom-in"
            onClick={() => {
              //zoomInBy(stageRef.current!, 0.2, null, null);
            }}
            className="border-gray-300 border font-medium hover:bg-gray-100 inline-flex items-center p-2 relative text-gray-500"
          >
            <PlusIcon className="h-6 w-6"></PlusIcon>
          </button>
        </div>
        <div
          id="canvas-container"
          className="grow h-full border-t border-l border-gray-900"
        >
          <PlayStage></PlayStage>
          <PlayerMenu></PlayerMenu>
        </div>
      </div>
    </>
  );
};

export default PlayInterfaceNext;
