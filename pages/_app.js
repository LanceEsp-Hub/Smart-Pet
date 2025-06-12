// pages/_app.js
import { Toaster } from "react-hot-toast";
import "../styles/globals.css"; // Adjust the path to your global styles


function MyApp({ Component, pageProps }) {
    return (
        <>
            <Toaster
                position="top-center" // Position of the toasts
                reverseOrder={false} // New toasts appear at the bottom
                toastOptions={{
                    duration: 3000, // Duration of the toast (3 seconds)
                    style: {
                        background: "#363636",
                        color: "#fff",
                    },
                }}
            />
            <Component {...pageProps} />
        </>
    );
}

export default MyApp;