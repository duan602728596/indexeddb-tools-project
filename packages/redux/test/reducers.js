import { createSlice } from '@reduxjs/toolkit';

const { actions, reducer } = createSlice({
  name: 'test',
  initialState: {
    data: []
  },
  reducers: {
    setData(state, action) {
      state.data = action.payload.result;
    }
  }
});

export const { setData } = actions;

export default { test: reducer };