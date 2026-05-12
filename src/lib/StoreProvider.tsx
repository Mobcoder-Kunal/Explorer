'use client';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from './store';

let store: AppStore | undefined;

function getStore() {
    if (!store) {
        store = makeStore();
    }
    return store;
}

function StoreProvider({ children }: { children: React.ReactNode }) {
    const store = getStore();

    return <Provider store={store}>{ children }</Provider>
}

export default StoreProvider;