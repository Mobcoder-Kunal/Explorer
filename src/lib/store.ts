import { configureStore, Middleware } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import editorReducer from './features/editor/editorSlice'

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

export const makeStore = () => {
    return configureStore({
        reducer: {
            auth: authReducer,
            editor: editorReducer
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: false,
            }).concat(loggerMiddleware),
    });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];