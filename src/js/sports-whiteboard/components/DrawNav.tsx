import ModeButton from "./ModeButton";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import OffenseSvg from "../public/offenseIcon.svg";
import DefenseSvg from "../public/defenseIcon.svg";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import NavButton from "./NavButton";
import { isTouchDevice } from "../lib/detect";
import { useSelector, useDispatch } from "react-redux";
import { updatePlayName } from "../lib/state/features/sceneSlice";
import type { RootState } from "../lib/state/store";

const DrawNav: React.FC = () => {
  const scene = useSelector((state: RootState) => state.scene);
  const dispatch = useDispatch();

  return (
    <>
      <div className="hidden md:inline-flex relative z-0 rounded-md shadow-sm -space-x-px">
        <label
          htmlFor="name"
          className="absolute -top-2 left-2 -mt-px inline-block px-1 bg-white text-xs font-medium text-gray-900"
        >
          Name
        </label>
        <input
          type="text"
          name="name"
          id="name"
          value={scene.props.playName}
          onChange={(e) => {
            dispatch(updatePlayName(e.target.value));
          }}
          className="border-gray-300 border px-1 py-1 pt-4 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-sm"
        />
      </div>
      <nav
        className="relative z-0 inline-flex rounded-md md:ml-2 mt-2 shadow-sm -space-x-px"
        aria-label="Pagination"
      >
        <span className="absolute z-10 -top-2 left-2 -mt-px inline-block px-1 bg-white text-xs font-medium text-gray-900">
          Draw
        </span>
        <ModeButton
          id="to-offense-player-mode"
          toMode="offense-player"
          selected={scene.props.mode === "offense-player"}
          tooltipText={"Offense"}
          mode={scene.props.mode}
          keyboardShortcut={"q"}
        >
          <span className="sr-only">Draw Offensive Player</span>
          <OffenseSvg
            className="h-6 w-6 -ml-1 mr-1"
            aria-hidden="true"
          ></OffenseSvg>
        </ModeButton>
        <ModeButton
          id="to-defense-player-mode"
          toMode="defense-player"
          selected={scene.props.mode === "defense-player"}
          mode={scene.props.mode}
          tooltipText={"Defense"}
          keyboardShortcut={"w"}
        >
          <span className="sr-only">Draw Defense Player</span>
          <DefenseSvg
            className="h-6 w-6 -ml-1 mr-1"
            aria-hidden="true"
          ></DefenseSvg>
        </ModeButton>
        <ModeButton
          mode={scene.props.mode}
          tooltipText={"Drive"}
          id="to-line-mode"
          toMode="line"
          selected={scene.props.mode === "line"}
          keyboardShortcut={"e"}
        >
          <span className="sr-only">Draw Line</span>
          <ArrowRightIcon className="h-6 w-6 -ml-1 mr-1" aria-hidden="true" />
        </ModeButton>
        {/* <ModeButton
          mode={scene.props.mode}
          tooltipText={"Note"}
          id="to-note-mode"
          toMode="note"
          selected={scene.props.mode === "note"}
          keyboardShortcut={"n"}
        >
          <span className="sr-only">Note</span>
          <DocumentTextIcon
            className="h-6 w-6 -ml-1 mr-1"
            aria-hidden="true"
          ></DocumentTextIcon>
        </ModeButton> */}
        {isTouchDevice() && (
          <NavButton
            onClick={() => {
              fireEvent("keypress:esc");
            }}
            id={"finish"}
            selected={false}
            tooltipText={"Finish action"}
            keyboardShortcut={"f"}
            showKeyboardShortcut={true}
            narrow={false}
            onKey={() => {
              fireEvent("keypress:esc");
            }}
            disabled={scene.props.mode !== "line"}
          >
            <CheckCircleIcon
              className="h-6 w-6 -ml-1 mr-1"
              aria-hidden="true"
            ></CheckCircleIcon>
          </NavButton>
        )}
      </nav>
    </>
  );
};

export default DrawNav;
