
import { configureStore } from "@reduxjs/toolkit";
import compareReducer from "./slices/compareSlice";

export const makeStore = () => {
    return configureStore({
        reducer: {
            compare: compareReducer,
        },
    });
};

export type AppStore = ReturnType<typeof makeStore>;

export type RootState = ReturnType<AppStore["getState"]>;

export type AppDispatch = AppStore["dispatch"];
