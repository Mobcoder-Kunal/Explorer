This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started
First, run the development server: ` bash -> pnpm dev `

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## About the project
-> For the "Medium" discovery feed, we won't use useEffect to fetch data. We will use RTK Query.

Why RTK Query over fetch?
*Automatic Caching: If a user clicks a blog post, reads it, goes back to the feed, and clicks it again, RTK Query doesn't hit the server a second time. It serves it from memory.

*Loading/Error States: It provides isLoading and isError booleans automatically. No more manual const [loading, setLoading] = useState(true).

*Polling: You can tell RTK Query to "poll" the server every 60 seconds to check for new "Medium" claps or comments without a page refresh.


1. The makeStore Factory Pattern
How: Instead of const store = configureStore(...), we exported a function makeStore.

The "Why" (The Deep Reason):

Next.js SSR Compatibility: In a standard React app, there is only one user (the person at the computer). In Next.js, the server handles thousands of users. If you use a global const store, User A's login info could "leak" into User B's session.

Isolation: By using a factory function, we create a fresh, isolated store for every request on the server and once on the client. This is the only way to achieve Thread Safety in a JavaScript environment.

2. The TypeScript "Power Trio"
How: We defined AppStore, RootState, and AppDispatch.

The "Why" (The Deep Reason):

Inference over Manual Typing: ReturnType<typeof makeStore> means Redux looks at your actual code to determine the types. If you add a new feature to your store, TypeScript updates your entire app automatically.

The Dispatch Problem: Standard dispatch doesn't know about Asynchronous Thunks (like fetching a blog post). By defining AppDispatch, we tell TypeScript: "Hey, our dispatch can handle both objects and functions." This prevents the dreaded "Argument is not assignable" error later.

3. The StoreProvider with useRef
How: We wrapped the store creation in a useRef inside a Client Component.

The "Why" (The Deep Reason):

Referential Integrity: In React, when a parent component re-renders, children can re-initialize. If we didn't use useRef, your Redux store could "wipe itself clean" every time the layout changed.

Client/Server Boundary: Redux relies on React Context, which only works in Client Components. By creating a dedicated StoreProvider, we create a "Client Island" where Redux can safely live while keeping the rest of your app optimized for Server-Side Rendering (SSR).

4. The Slice Pattern (authSlice)
How: We used createSlice which combines actions and reducers.

The "Why" (The Deep Reason):

Immer.js Integration: In old Redux, you had to do this: return { ...state, user: action.payload }. It was easy to make mistakes. RTK uses a library called Immer that lets you write "mutative" code (state.user = action.payload). Immer tracks these changes and creates a perfectly immutable state update behind the scenes.

Encapsulation: In an industry setting, you want low coupling. The authSlice doesn't need to know how the postSlice works. They are independent "modules" of your business logic.

5. The Typed Hooks (useAppSelector, useAppDispatch)
How: We "pre-typed" the standard Redux hooks.

The "Why" (The Deep Reason):

Developer Velocity: When you type const user = useAppSelector(state => state.auth.u...), your IDE will instantly suggest .user. You don't have to check your files to remember if it was user or userInfo.

Refactor Safety: If you decide to rename user to profile in your slice, TypeScript will immediately turn your entire project "red" where you used the old name. In a production app with 50+ files, this saves days of debugging.

-> To build the Notion-style UI, we are going to create a "Renderer" system. This is a common architectural pattern in production apps where you decouple the Data (Redux) from the Visuals (React).