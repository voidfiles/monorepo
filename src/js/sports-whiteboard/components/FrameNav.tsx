import {
  ClipboardCopyIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/outline";
import React, { useState } from "react";
import HelpModal from "./HelpModal";
import NavButton from "./NavButton";
import StepButton from "./StepButton";
import { useSelector, useDispatch } from "react-redux";
import { addFrame, setFrame } from "../lib/state/features/sceneSlice";
import type { RootState } from "../lib/state/store";
import Stage from "./Stage";

const getBaseURL = (id: string | undefined) => {
  const proto = process.env.NODE_ENV !== "development" ? "https://" : "http://";
  const domain = process.env.NEXT_PUBLIC_VERCEL_URL || "localhost:3000";
  const path = "/plays/";
  return `${proto}${domain}${path}${id || ""}`;
};

const FrameNav: React.FC = () => {
  const scene = useSelector((state: RootState) => state.scene);
  const dispatch = useDispatch();
  const [saveModalOpen, setSaveModalOpen] = useState(false);

  return (
    <>
      <nav
        className="space-y-1 flex flex-col items-center"
        aria-label="Pagination"
      >
        <StepButton
          id="add-frame"
          key="add"
          selected={false}
          keyboardShortcut={"n"}
          tooltipDir={"right"}
          tooltipText={"New Frame"}
          onClick={() => {
            dispatch(addFrame());
          }}
        >
          <PlusIcon className="h-5 w-5"></PlusIcon>
        </StepButton>
        <NavButton
          onClick={() => {
            setSaveModalOpen(true);
          }}
          id="help"
          keyboardShortcut="shift+?"
          onKey={() => {
            setSaveModalOpen(true);
          }}
          showKeyboardShortcut={false}
          narrow={true}
          tooltipText={"Help"}
          tooltipDir={"right"}
        >
          <QuestionMarkCircleIcon className="h-5 w-5"></QuestionMarkCircleIcon>
        </NavButton>
        <NavButton
          onClick={() => {
            throw "Not working!";
          }}
          onKey={() => {
            throw "Not working!";
          }}
          id="copy"
          showKeyboardShortcut={false}
          narrow={true}
          keyboardShortcut={"cmd+shift+s"}
          tooltipText={"Copy URL"}
          tooltipDir={"right"}
        >
          <ClipboardCopyIcon className="h-5 w-5 text-gray-400"></ClipboardCopyIcon>
        </NavButton>
        {scene.frameOrder.map((frameID: string, i: number) => {
          const frame = scene.frames[frameID];

          return (
            <StepButton
              id={"frame-" + i}
              onClick={() => {
                dispatch(setFrame(frame.id));
              }}
              keyboardShortcut={"" + (i + 1)}
              selected={frame.id == scene.props.currentFrame}
              key={frame.id}
            >
              <Stage width={200} height={100} stageFrame={frameID}></Stage>
            </StepButton>
          );
        })}
      </nav>
      <HelpModal
        open={saveModalOpen}
        close={() => {
          setSaveModalOpen(false);
        }}
      ></HelpModal>
    </>
  );
};

export default FrameNav;
