import { Arrow, Circle, Group, Line, Rect, Text } from "react-konva";
import { useSelector, useDispatch } from "react-redux";
import {
  movePlayer,
  PlayerSide,
  PlayerObject,
} from "../lib/state/features/sceneSlice";
import type { RootState } from "../lib/state/store";
import { showPlayerContextMenu } from "../lib/state/features/navigationSlice";
import { useState } from "react";

const DIMENSION = 45;

export type PlayerInput = {
  id: string;
  x: number;
  y: number;
  metadata: Object;
  obj: PlayerObject;
};

const InternalPlayer = (props: any) => {
  const [highlighted, setHighlighted] = useState(false);
  const stroke = highlighted ? "red" : "#000";
  const width = highlighted ? 8 : 6;

  const onMouseEnter = () => {
    setHighlighted(true);
  };

  const onMouseLeave = () => {
    setHighlighted(false);
  };
  switch (props.obj.side) {
    case PlayerSide.Deffense:
      return (
        <Group {...props} width={DIMENSION} height={DIMENSION}>
          <Line
            points={[5, 5, DIMENSION - 5, DIMENSION - 5]}
            stroke={stroke}
            strokeWidth={width}
            id={props.id}
            lineCap="round"
          ></Line>
          <Line
            points={[5, DIMENSION - 5, DIMENSION - 5, 5]}
            stroke={stroke}
            strokeWidth={width}
            lineCap="round"
            id={props.id}
          ></Line>
          <Rect
            width={DIMENSION}
            height={DIMENSION}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            id={props.id}
          ></Rect>
        </Group>
      );
    default:
      return (
        <Group
          {...props}
          width={DIMENSION}
          height={DIMENSION}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <Circle
            x={0}
            y={0}
            id={props.id}
            width={DIMENSION}
            height={DIMENSION}
            fill={props.obj.hasBall ? "#FFC300" : "#fff"}
            stroke={stroke}
            strokeWidth={width}
          ></Circle>
          {/* <Text
            x={-8}
            y={-10}
            text="1"
            width={DIMENSION}
            height={DIMENSION}
            padding={0}
            fontSize={30}
            align="left"
            verticalAlign="top"
            lineHeight={1}
            fill="#111"

            // strokeWidth={1}
          ></Text> */}
        </Group>
      );
  }
};

const Player: React.FC<PlayerInput> = (props) => {
  const { obj } = props;
  const sceneState = useSelector((state: RootState) => state.scene);
  const dispatch = useDispatch();
  const dragState = {
    x: 0,
    y: 0,
  };
  const onPlayerClick = (e: any) => {
    // prevent default behavior
    e.evt.preventDefault();

    if (sceneState.props.mode == "line") {
      return;
    }

    const pos = e.target.absolutePosition();
    const containerRect = e.target
      .getStage()
      .container()
      .getBoundingClientRect();
    dispatch(
      showPlayerContextMenu({
        id: e.target.id(),
        x: containerRect.top + pos.x + 4 + "px",
        y: containerRect.left + pos.y + 4 + "px",
      })
    );
  };

  const onPlayerDragstart = (e: any) => {
    e.evt.preventDefault();
    dragState.x = e.target.x();
    dragState.y = e.target.y();
  };

  const onPlayerDragend = (e: any) => {
    // prevent default behavior
    e.evt.preventDefault();
    if (e.target === e.target.getStage()) {
      // if we are on empty place of the stage we will do nothing
      return;
    }

    const metadata = e.target.getAttr("metadata") || {};
    const kind = metadata.kind;
    if (kind == "PLAYER_GROUP") {
      const player =
        sceneState.frames[sceneState.props.currentFrame].objects[e.target.id()];
      if (!player) {
        return;
      }
      const deltaX = e.target.x();
      const deltaY = e.target.y();
      const points = player.movement!.points.map((x: number) => {
        return x;
      });

      for (var i = 0; i < points.length; i += 2) {
        points[i] = points[i] + deltaX;
        points[i + 1] = points[i + 1] + deltaY;
      }
      dispatch(
        movePlayer({
          id: e.target.id(),
          x: player.x + deltaX,
          y: player.y + deltaY,
          points: points,
        })
      );
    } else {
      dispatch(
        movePlayer({
          id: e.target.id(),
          x: e.target.x(),
          y: e.target.y(),
          points: [],
        })
      );
    }
  };

  switch (obj.movement) {
    case null:
      return (
        <InternalPlayer
          onDragEnd={onPlayerDragend}
          onDragStart={onPlayerDragstart}
          onClick={onPlayerClick}
          draggable={true}
          {...props}
        ></InternalPlayer>
      );
    default:
      return (
        <Group
          draggable
          {...props}
          key={props.id}
          id={props.id}
          x={0}
          y={0}
          onDragEnd={onPlayerDragend}
          onDragStart={onPlayerDragstart}
          onClick={onPlayerClick}
          metadata={{
            ...props.metadata,
            kind: "PLAYER_GROUP",
          }}
          _useStrictMode
        >
          <Arrow
            key={obj.movement.id}
            points={obj.movement.points}
            stroke="red"
            strokeWidth={5}
          ></Arrow>
          <InternalPlayer
            x={props.x}
            y={props.y}
            obj={props.obj}
            draggable={false}
          ></InternalPlayer>
        </Group>
      );
  }
};

export default Player;
