// @refresh reset
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import useSWR from "swr";
import Loading from "../../components/Loading";
import { useEffect, useState } from "react";
import useUserState from "../../lib/useUserState";
import dynamic from "next/dynamic";
import { useDispatch } from "react-redux";
import { loadScene, SceneState } from "../../lib/state/features/sceneSlice";

const PlayInterfaceNext = dynamic(
  () => import("../../components/PlayInterfaceNext"),
  {
    ssr: false,
  }
);

const fetcherWithToken = (path: string, token: string) => {
  if (!token) {
    return new Promise((resolve) => {
      resolve(null);
    });
  }
  return fetch(path, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json());
};

function useScene(token: string, id: string | string[] | undefined) {
  const { data, error } = useSWR(
    [`/api/play?id=${id}`, token],
    fetcherWithToken
  );

  return {
    scene: data as any,
    isLoading: !error && !data,
    isError: error,
  };
}

const Play: NextPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { id } = router.query;
  const [user, loading, error] = useUserState();

  const [token, setToken] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    user.getIdToken().then((token) => {
      setToken(token);
    });
  }, [user, loading, error]);

  const { scene, isLoading, isError } = useScene(token, id);

  useEffect(() => {
    if (!scene) {
      return;
    }
    dispatch(loadScene(scene as SceneState));
  }, [scene]);

  if (isError) {
    return <Loading></Loading>;
  }
  if (!scene || !user) {
    return <Loading></Loading>;
  }

  return (
    <div className="h-screen w-screen">
      <Head>
        <title>{scene.name} - 6on5 water polo whiteboard</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PlayInterfaceNext user={user}></PlayInterfaceNext>
    </div>
  );
};

export default Play;
