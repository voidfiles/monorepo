import reducer, {
  addPlayer,
  markPlayerWithBall,
  SceneState,
  freshScene,
  PlayerSide,
  PlacedObject,
  Frame,
} from "./sceneSlice";

test("should return the initial state", () => {
  expect(reducer(undefined, { type: undefined })).toBeDefined;
});

const buildPlayer = (b: Partial<PlacedObject>): PlacedObject => {
  return {
    ...{
      type: "PLAYER_OBJECT",
      id: "",
      side: "OFFENSE" as PlayerSide,
      x: 10,
      y: 10,
      movement: null,
      hasBall: false,
      metadata: { kind: "PLAYER" },
    },
    ...b,
  };
};

const findCurrentFrame = (state: SceneState): Frame => {
  return state.frames[state.props.currentFrame];
};

test("can mark a player as having a ball", () => {
  let state: SceneState = freshScene();

  state = reducer(state, addPlayer({ side: PlayerSide.Offense, x: 10, y: 10 }));
  const keys = Object.keys(findCurrentFrame(state).objects);
  expect(keys.length).toEqual(1);
  const playerId = keys[0];

  const expectedPlayer = buildPlayer({ id: playerId });
  expect(findCurrentFrame(state).objects[playerId]).toEqual(expectedPlayer);

  state = reducer(state, markPlayerWithBall(playerId));

  expect(findCurrentFrame(state).objects[playerId]).toEqual({
    ...expectedPlayer,
    hasBall: true,
  });
});

test("marking player as having a ball will move the ball from one to another", () => {
  const previousState: SceneState = freshScene();

  // Create Player 1
  let state = reducer(
    previousState,
    addPlayer({ side: PlayerSide.Offense, x: 10, y: 10 })
  );

  // Create Player 2
  state = reducer(state, addPlayer({ side: PlayerSide.Offense, x: 20, y: 20 }));

  const keys = Object.keys(findCurrentFrame(state).objects);
  expect(keys.length).toEqual(2);
  const [playerID1, playerID2] = keys;

  state = reducer(state, markPlayerWithBall(playerID1));
  expect(findCurrentFrame(state).objects[playerID1]).toEqual(
    buildPlayer({ id: playerID1, hasBall: true, receiveBallFrom: undefined })
  );

  state = reducer(state, markPlayerWithBall(playerID2));
  expect(findCurrentFrame(state).objects[playerID1]).toEqual(
    buildPlayer({ id: playerID1, hasBall: false, receiveBallFrom: undefined })
  );

  expect(findCurrentFrame(state).objects[playerID2]).toEqual(
    buildPlayer({
      id: playerID2,
      hasBall: true,
      receiveBallFrom: playerID1,
      x: 20,
      y: 20,
    })
  );
});
// test("should handle a todo being added to an existing list", () => {
//   const previousState: Todo[] = [
//     { text: "Run the tests", completed: true, id: 0 },
//   ];

//   expect(reducer(previousState, todoAdded("Use Redux"))).toEqual([
//     { text: "Run the tests", completed: true, id: 0 },
//     { text: "Use Redux", completed: false, id: 1 },
//   ]);
// });
