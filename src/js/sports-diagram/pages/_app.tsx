import type { AppProps } from 'next/app'
import "../styles/global.css";
import Head from 'next/head';
import { store } from '../lib/store/store'
import { Provider } from 'react-redux'

export default function MyApp({ Component, pageProps }: AppProps) {
    return (<>
    <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    </Head>
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  </>);
}