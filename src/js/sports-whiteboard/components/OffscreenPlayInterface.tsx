// @refresh reset
import PlayStage from "./PlayStage";
import Konva from "konva";

type OffscreenPlayInterfaceProps = {
  onStage?: (node: Konva.Stage) => void;
};

const OffscreenPlayInterface: React.FC<OffscreenPlayInterfaceProps> = ({
  onStage,
}) => {
  return (
    <div
      id="canvas-container"
      style={{ width: "1000px", height: "600px", backgroundColor: "#fff" }}
    >
      <PlayStage width={1000} height={600} onStage={onStage}></PlayStage>
    </div>
  );
};

export default OffscreenPlayInterface;
