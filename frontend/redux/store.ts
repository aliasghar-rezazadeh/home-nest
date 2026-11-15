
import { configureStore } from "@reduxjs/toolkit";
import compareReducer from "./slices/compareSlice";

type StateShape = {
    compare: ReturnType<typeof compareReducer>;
};

const rootReducer = (
    state: StateShape | undefined,
    action: Parameters<typeof compareReducer>[1]
): StateShape => {
    return {
        compare: compareReducer(state?.compare, action),
    };
};

export const makeStore = () => {
    return configureStore({
        reducer: rootReducer,
    });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
