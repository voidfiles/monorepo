// @refresh reset
import { useDispatch, useSelector } from "react-redux";
import { hidePlayerContextMenu } from "../lib/state/features/navigationSlice";
import {
  markPlayerWithBall,
  removePlayer,
} from "../lib/state/features/sceneSlice";
import { RootState } from "../lib/state/store";

const PlayerMenu: React.FC = () => {
  const contextMenuState = useSelector((state: RootState) => state.navigation);
  if (!contextMenuState.display) {
    return <></>;
  }
  const dispatch = useDispatch();

  const onDelete = (e: any) => {
    dispatch(removePlayer(contextMenuState.id));
    dispatch(hidePlayerContextMenu());
  };

  const onHasBall = (e: any) => {
    dispatch(markPlayerWithBall(contextMenuState.id));
    dispatch(hidePlayerContextMenu());
  };

  return (
    <div
      className="absolute right-0 z-10 mt-2 w-32 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
      style={{
        left: contextMenuState.x,
        top: contextMenuState.y,
      }}
    >
      <ul className="py-1">
        <li className="text-gray-700 group flex items-center px-4 py-2 text-sm">
          <a href="#" onClick={onHasBall}>
            Has Ball
          </a>
        </li>
        <li className="text-gray-700 group flex items-center px-4 py-2 text-sm">
          <a href="#">Start path</a>
        </li>
        <li className="text-gray-700 group flex items-center px-4 py-2 text-sm">
          <a href="#" onClick={onDelete}>
            Delete
          </a>
        </li>
      </ul>
    </div>
  );
};

export default PlayerMenu;
