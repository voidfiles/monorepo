import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from 'redux-persist';
import stageReducer from './features/stage/stageSlice';
import uiReducer from './features/ui/uiSlice';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

const persistedReducer = persistReducer(
  {
    key: 'stage',
    storage
  },
  stageReducer
);

export const store = configureStore({
  reducer: {
    stage: persistReducer(
      {
        key: 'stage',
        storage
      },
      stageReducer
    ),
    ui: persistReducer(
      {
        key: 'ui',
        storage
      },
      uiReducer
    )
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    })
});

export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
