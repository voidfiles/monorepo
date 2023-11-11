import { configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web

import scaleReducer, { SceneScale } from "./features/scene/scaleSlice";
import sceneReducer, { SceneState } from "./features/sceneSlice";
import navigationSlice from "./features/navigationSlice";
export const buildStore = (preloadedState?: any) => {
  const store = configureStore({
    reducer: {
      scale: persistReducer<SceneScale>(
        { key: "scale", storage },
        scaleReducer
      ),
      scene: persistReducer<SceneState>(
        { key: "scene", storage },
        sceneReducer
      ),
      navigation: navigationSlice,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
    preloadedState: preloadedState,
    devTools: process.env.NODE_ENV !== "production",
  });

  const persister = persistStore(store);

  return { store, persister };
};

export const { store, persister } = buildStore();

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
