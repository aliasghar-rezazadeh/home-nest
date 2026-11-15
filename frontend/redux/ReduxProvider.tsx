
"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "./store";

export default function ReduxProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [store, setStore] = useState<AppStore | null>(null);

    useEffect(() => {
        setStore(makeStore());
    }, []);

    if (!store) {
        return null;
    }

    return (
        <Provider store={store}>
            {children}
        </Provider>
    );
}
