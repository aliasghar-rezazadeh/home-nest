
"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";

import { makeStore, type AppStore } from "./store";
import { setCompareItems } from "./slices/compareSlice";

import {
    COMPARE_EXPIRATION_MS,
    COMPARE_STORAGE_KEY,
} from "./compareConfig";

interface CompareStorageData {
    items: Parameters<typeof setCompareItems>[0];
    expiresAt: number;
}

export default function ReduxProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [store] = useState<AppStore>(() => makeStore());

    useEffect(() => {
        // مرحله اول: بازیابی اطلاعات از localStorage
        try {
            const savedData = localStorage.getItem(COMPARE_STORAGE_KEY);

            if (savedData) {
                const parsedData: CompareStorageData = JSON.parse(savedData);

                if (
                    Array.isArray(parsedData.items) &&
                    typeof parsedData.expiresAt === "number" &&
                    Date.now() < parsedData.expiresAt
                ) {
                    // اطلاعات هنوز معتبر هستند
                    store.dispatch(setCompareItems(parsedData.items));
                } else {
                    // اطلاعات منقضی شده یا نامعتبر هستند
                    localStorage.removeItem(COMPARE_STORAGE_KEY);
                }
            }
        } catch {
            // در صورت خراب بودن اطلاعات ذخیره‌شده
            localStorage.removeItem(COMPARE_STORAGE_KEY);
        }

        // مرحله دوم: گوش دادن به تغییرات Redux
        const unsubscribe = store.subscribe(() => {
            const items = store.getState().compare.items;

            if (items.length === 0) {
                localStorage.removeItem(COMPARE_STORAGE_KEY);
                return;
            }

            const storageData: CompareStorageData = {
                items,
                expiresAt: Date.now() + COMPARE_EXPIRATION_MS,
            };

            localStorage.setItem(
                COMPARE_STORAGE_KEY,
                JSON.stringify(storageData)
            );
        });

        return unsubscribe;
    }, [store]);

    return <Provider store={store}>{children}</Provider>;
}
