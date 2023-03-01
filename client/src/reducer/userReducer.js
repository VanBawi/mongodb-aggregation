import { createSlice } from '@reduxjs/toolkit';
import i18n from '../config/i18n';

const initialState = {
  language: 'en',
  channel: localStorage.getItem('channel'),
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      localStorage.setItem('language', action.payload);
      i18n.changeLanguage(action.payload);
      return {
        ...state,
        language: action.payload,
      };
    },
    setChannel: (state, action) => {
      localStorage.setItem('channel', action.payload);
      return { ...state, channel: action.payload };
    },
  },
});

export const { setLanguage, setChannel } = userSlice.actions;

export default userSlice.reducer;
