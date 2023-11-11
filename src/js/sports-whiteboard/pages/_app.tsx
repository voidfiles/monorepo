import "../styles/globals.css";
import type { AppProps } from "next/app";
import { getLCP, getFID, getCLS } from "web-vitals";
import { store } from "../lib/state/store";
import { Provider } from "react-redux";

function MyApp({ Component, pageProps }: AppProps) {
  if (typeof document !== "undefined") {
    // getCLS(console.log);
    // getFID(console.log);
    // getLCP(console.log);
  }
  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
}

export default MyApp;
