import { configureStore } from '@reduxjs/toolkit'
import stageReducer from './features/stage/stageSlice'

export const store = configureStore({
  reducer: {
    stage: stageReducer,
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch