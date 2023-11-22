import {
  ChevronDoubleRightIcon,
  ChevronDoubleLeftIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import React from "react";
import NavButton from "./NavButton";
import { useDispatch } from "react-redux";
import { deleteFrame, moveFrame } from "../lib/state/features/sceneSlice";

interface LiveNavProps {
  position: string;
}

const LiveNav: React.FC<LiveNavProps> = ({ position }) => {
  const dispatch = useDispatch();

  return (
    <nav className="relative z-0 inline-flex rounded-md md:ml-2 mt-2 shadow-sm -space-x-px">
      <span className="absolute z-10 -top-2 left-2 -mt-px inline-block px-1 bg-white text-xs font-medium text-gray-900">
        Frames
      </span>
      <NavButton
        id={"prev-button"}
        onClick={() => {
          dispatch(moveFrame(-1));
        }}
        onKey={() => {
          dispatch(moveFrame(-1));
        }}
        selected={false}
        tooltipText={"Previous"}
        keyboardShortcut={"left"}
        showKeyboardShortcut={false}
        tooltipDir={position == "top" ? "bottom" : "top"}
      >
        <ChevronDoubleLeftIcon className="h-6 w-6"></ChevronDoubleLeftIcon>
      </NavButton>
      <NavButton
        id={"next-button"}
        onClick={() => {
          dispatch(moveFrame(1));
        }}
        onKey={() => {
          dispatch(moveFrame(1));
        }}
        selected={false}
        tooltipText={"Next"}
        keyboardShortcut={"right"}
        showKeyboardShortcut={false}
        tooltipDir={position == "top" ? "bottom" : "top"}
      >
        <ChevronDoubleRightIcon className="h-6 w-6"></ChevronDoubleRightIcon>
      </NavButton>
      <NavButton
        id={"delete-button"}
        onClick={() => {
          dispatch(deleteFrame());
        }}
        onKey={() => {
          dispatch(deleteFrame());
        }}
        selected={false}
        tooltipText={"Delete"}
        keyboardShortcut={"delete"}
        showKeyboardShortcut={false}
        tooltipDir={position == "top" ? "bottom" : "top"}
      >
        <TrashIcon className="h-6 w-6"></TrashIcon>
      </NavButton>
    </nav>
  );
};

export default LiveNav;
