import { CubeIcon } from "@heroicons/react/outline";

type LoadingInput = {};

const Loading: React.FC<LoadingInput> = () => {
  return (
    <div className="align-middle content-center text-center justify-center place-content-center h-screen w-screen">
      <span className="align-middle inline-block -mb-[50%]">
        <CubeIcon className="animate-spin h-10 w-10"></CubeIcon>
      </span>
    </div>
  );
};

export default Loading;
