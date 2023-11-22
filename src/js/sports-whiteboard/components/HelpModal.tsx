import { Fragment, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  ArrowRightIcon,
  ChevronDoubleRightIcon,
  PlayIcon,
  PlusSmallIcon,
  QuestionMarkCircleIcon,
  ChevronLeftIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import OffenseSvg from "../public/offense.svg";
import DefenseSvg from "../public/defense.svg";

interface HelpModalInterface {
  open: boolean;
  close: Function;
}

const HelpModal: React.FC<HelpModalInterface> = ({ open, close }) => {
  const cancelButtonRef = useRef(null);
  if (!open) {
    return <></>;
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed z-10 inset-0 overflow-y-auto"
        initialFocus={cancelButtonRef}
        onClose={() => {
          close();
        }}
      >
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
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
            <div className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                  <QuestionMarkCircleIcon
                    className="h-6 w-6 text-indigo-600"
                    aria-hidden="true"
                  ></QuestionMarkCircleIcon>
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <Dialog.Title
                    as="h3"
                    className="text-lg leading-6 font-medium text-gray-900"
                  >
                    Help
                  </Dialog.Title>
                  <div className="mt-2">
                    <div className="">
                      <p className="font-medium">Frame Control</p>
                      <p>
                        <PlusSmallIcon className="h-5 w-5 pr-1 inline"></PlusSmallIcon>
                        <span>(n) Add Frame to play</span>
                      </p>
                      <div>
                        <OffenseSvg
                          className="h-4 w-4 ml-1 -mt-1 pt-2 pr-1 inline-block"
                          aria-hidden="true"
                        ></OffenseSvg>
                        <span>(q) Draw an offensive player</span>
                      </div>
                      <div>
                        <DefenseSvg
                          className="h-4 w-4 ml-1 -mt-1 pt-2 pr-1 inline-block"
                          aria-hidden="true"
                        ></DefenseSvg>
                        <span>(w) Draw a defensive player</span>
                      </div>
                      <div>
                        <ArrowRightIcon className="h-5 w-5 pr-1 inline"></ArrowRightIcon>
                        <span>(e) Draw path for player</span>
                      </div>
                      <p className="font-medium">Playback</p>
                      <div>
                        <PlayIcon className="h-5 w-5 pr-1 inline"></PlayIcon>
                        <span>(space) Play Frames from start</span>
                      </div>
                      <div>
                        <ChevronLeftIcon className="h-5 w-5 pr-1 inline"></ChevronLeftIcon>
                        <span>(←) Move one frame back</span>
                      </div>
                      <div>
                        <ChevronDoubleRightIcon className="h-5 w-5 pr-1 inline"></ChevronDoubleRightIcon>
                        <span>(←) Move one frame forward</span>
                      </div>
                      <div>
                        <TrashIcon className="h-5 w-5 pr-1 inline"></TrashIcon>
                        <span>Delete the current frame</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => {
                    close();
                  }}
                  ref={cancelButtonRef}
                >
                  Finish
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default HelpModal;
