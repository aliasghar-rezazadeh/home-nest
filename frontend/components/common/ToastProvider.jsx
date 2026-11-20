"use client";

import { ToastContainer } from "react-toastify";

export default function ToastProvider() {
    return (
        <ToastContainer
            position="top-left"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
        />
    );
}
