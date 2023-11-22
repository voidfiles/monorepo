import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createRoot } from "react-dom/client";
import { Dialog, Transition } from "@headlessui/react";
import { ClipboardIcon } from "@heroicons/react/24/outline";
import { DocumentArrowDownIcon } from "@heroicons/react/24/solid";
import MySwitch from "./Switch";
import produce from "immer";
import { buildStore } from "../lib/state/store";
import { Provider } from "react-redux";
import { useSelector } from "react-redux";
import type { RootState } from "../lib/state/store";
import Snapshotter from "./Snapshotter";

interface ExportModalInterface {
  done: Function;
  open: boolean;
}

const ExportModal: React.FC<ExportModalInterface> = ({ open, done }) => {
  const sceneState = produce(
    useSelector((state: RootState) => state.scene),
    (draft) => {
      draft.props.currentFrame = draft.frameOrder[0];
    }
  );

  const { store } = buildStore({ scene: sceneState });
  const [dataUrls, setDataUrls] = useState([] as Array<string>);
  const [blobs, setBlobs] = useState([] as Array<Blob>);
  const [useCanvasViewport, setUseCanvasViewport] = useState(false);

  const cancelButtonRef = useRef(null);
  const dt = "" + new Date().getTime();
  const newDiv = document.createElement("div");
  newDiv.style.width = "1280px";
  newDiv.style.height = "900px";
  newDiv.style.backgroundColor = "#FFF";
  const root = createRoot(newDiv);

  const playName = sceneState.props.playName.toLowerCase().replace(" ", "_");
  const onData = useCallback((dataUrls: Array<string>, blobs: Array<Blob>) => {
    setDataUrls(dataUrls);
    setBlobs(blobs);
  }, []);

  useEffect(() => {
    root.render(
      <Provider store={store}>
        <Snapshotter onData={onData}></Snapshotter>
      </Provider>
    );
  }, [sceneState.props.currentFrame]);

  const copyBlob = (index: number) => {
    const blob = blobs[index];
    navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ]);
  };
  const downloadJSON = () => {
    var jsonse = JSON.stringify(sceneState);
    var blob = new Blob([jsonse], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.download = `${playName}_${dt}.json`;
    a.href = url;
    a.click();
  };
  const downloadAll = () => {
    dataUrls.forEach((url, i) => {
      const a = window.document.createElement("a");
      a.download = `${playName}_${dt}_${i}`;
      a.href = url;
      a.click();
    });
  };

  const onClose = () => {
    setBlobs([]);
    setDataUrls([]);
    done();
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed z-10 inset-0"
        initialFocus={cancelButtonRef}
        onClose={onClose}
      >
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all my-8 sm:align-middle sm:max-w-7xl  sm:w-full p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                  <DocumentArrowDownIcon
                    className="h-6 w-6 text-indigo-600"
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left overflow-x-scroll">
                  <Dialog.Title
                    as="h3"
                    className="text-lg leading-6 font-medium text-gray-900"
                  >
                    Save Play
                  </Dialog.Title>
                  <div className="mt-2 sm:max-w-7xl  sm:w-full">
                    <div className="flex flex-row">
                      {dataUrls.map((imgURL, i) => {
                        return (
                          <div
                            className="inline-block pr-2 max-w-xs min-w-[320px]"
                            key={i}
                          >
                            <img className="inline border" src={imgURL}></img>
                            <a
                              className="mt-2 inline-flex justify-center  border border-transparent shadow-sm px-2 py-1 bg-indigo-600 text-xs text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-xs"
                              download={`${playName}_${dt}_${i}`}
                              href={imgURL}
                            >
                              <DocumentArrowDownIcon className="w-4 h-4 pr-1"></DocumentArrowDownIcon>
                              <span>Save</span>
                            </a>
                            <button
                              className="ml-2 mt-2 inline-flex justify-center  border border-transparent shadow-sm px-2 py-1 bg-indigo-600 text-xs text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-xs"
                              onClick={() => {
                                copyBlob(i);
                              }}
                            >
                              <ClipboardIcon className="w-4 h-4 pr-1"></ClipboardIcon>
                              <span>Copy</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex">
                <div className="flex-1">
                  <div className="mt-5 sm:mt-4 py-2">
                    <MySwitch
                      enabled={useCanvasViewport}
                      setEnabled={(enabled: boolean) => {
                        setUseCanvasViewport(enabled);
                      }}
                      label={"Use Canvas Viewport"}
                    ></MySwitch>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={downloadAll}
                    >
                      <DocumentArrowDownIcon className="w-5 h-5"></DocumentArrowDownIcon> Download
                      All
                    </button>
                    <button
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={downloadJSON}
                    >
                      <DocumentArrowDownIcon className="w-5 h-5"></DocumentArrowDownIcon> Download
                      JSON
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                      onClick={() => {
                        onClose();
                      }}
                      ref={cancelButtonRef}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default ExportModal;
