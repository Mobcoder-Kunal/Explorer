import { configureStore, Middleware } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import editorReducer from './features/editor/editorSlice'

// 1. THE LOGGER MIDDLEWARE (Typed for clarity)
const loggerMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
    if (typeof window !== 'undefined') {
        console.group(`%c Action: ${(action as any).type} `, 'background: #222; color: #bada55; padding: 2px; border-radius: 4px;');
        console.log('Previous State:', store.getState());
        console.log('Payload:', (action as any).payload);
        const result = next(action);
        console.log('Next State:', store.getState());
        console.groupEnd();
        return result;
    }
    return next(action);
};

// 2. THE STORE -> makeStore: Instead of a static variable, we use a function. In Next.js, this ensures the server doesn't share state between different users (Critical for security).
// we don't just create a variable; we create a Factory called makeStore.
// Why a factory? In Next.js, the server handles many users at once. If we used a single global variable, "User A" might accidentally see "User B's" blog post. By using a function, every time a new user visits, Next.js calls makeStore() and gives them their own private "Kitchen."
export const makeStore = () => {
    return configureStore({
        reducer: {
            auth: authReducer,
            editor: editorReducer
            // Future slices like 'editor' or 'posts' go here
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: false, // Essential for handling complex Notion-like JSON blocks
            }).concat(loggerMiddleware),
    });
};

// 3. THE "HOLY TRINITY"
export type AppStore = ReturnType<typeof makeStore>;      // Captures the shape of the store -> This is TypeScript "Inference." Instead of manually writing a complex Interface for the store, we tell TS: "Look at the function makeStore and figure out what it returns." If you add a new slice to the reducer, AppStore updates automatically.
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];