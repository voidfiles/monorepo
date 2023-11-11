import NavButton from "./NavButton";
import { changeMode } from "../lib/state/features/sceneSlice";
import { useDispatch } from "react-redux";
type ModeButtonProps = {
  toMode: string;
  children: React.ReactNode;
  selected: boolean;
  tooltipText: string;
  id: string;
  keyboardShortcut: string;
  mode: string;
  showKeyboardShortcut?: boolean;
};

const ModeButton: React.FC<ModeButtonProps> = ({
  toMode,
  children,
  selected,
  id,
  tooltipText,
  keyboardShortcut,
  mode,
  showKeyboardShortcut = true,
}) => {
  const dispatch = useDispatch();
  const moveTo = () => {
    dispatch(changeMode(toMode));
  };

  return (
    <NavButton
      onClick={moveTo}
      id={id}
      selected={selected}
      tooltipText={tooltipText}
      keyboardShortcut={keyboardShortcut}
      showKeyboardShortcut={showKeyboardShortcut}
      onKey={moveTo}
    >
      {children}
    </NavButton>
  );
};

export default ModeButton;
