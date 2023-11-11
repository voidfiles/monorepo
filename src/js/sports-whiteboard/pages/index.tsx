// @refresh reset
import type { NextPage } from "next";
import Head from "next/head";
import useUserState from "../lib/useUserState";
import Loading from "../components/Loading";
import dynamic from "next/dynamic";

const PlayInterfaceNext = dynamic(
  () => import("../components/PlayInterfaceNext"),
  {
    ssr: false,
  }
);

const Home: NextPage = () => {
  const [user, loading, error] = useUserState();

  if (error) {
    return <Loading></Loading>;
  }
  if (!user) {
    return <Loading></Loading>;
  }

  return (
    <div className="h-screen w-screen">
      <Head>
        <title>6 on 5: A waterpolo whiteboard</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PlayInterfaceNext user={user}></PlayInterfaceNext>
    </div>
  );
};

export default Home;
