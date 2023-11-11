/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PlusCircleIcon, SaveIcon, XIcon } from "@heroicons/react/outline";
import DangerModal from "../components/DangerModal";
import { MenuIcon } from "@heroicons/react/outline";
import SaveModal from "./SaveModal";
import ExportModal from "./ExportModal";
import { DocumentDownloadIcon } from "@heroicons/react/solid";
import SlideNavButton from "./SlideNavButton";
import { User } from "firebase/auth";
import { useRouter } from "next/router";
import NavButton from "./NavButton";
import { useSelector, useDispatch } from "react-redux";
import {
  resetScene,
  updatePlayName,
  updateSceneId,
} from "../lib/state/features/sceneSlice";
import type { RootState } from "../lib/state/store";
import FieldSelector from "./FieldSelector";

interface StateDropdownNav {
  user: User;
}

const StateDropdown: React.FC<StateDropdownNav> = ({ user }) => {
  const scene = useSelector((state: RootState) => state.scene);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [dialog, setDialog] = useState("");
  const [loadPlayName, setLoadPlayName] = useState("");
  const router = useRouter();
  const handleNewPlay = (perform: boolean) => {
    setDialog("");
    if (perform) {
      dispatch(resetScene());
      setOpen(false);
      router.push("/");
    }
  };

  let onDone = (perform: boolean, playName: string = "") => {
    if (!perform) {
      setLoadPlayName("");
      setDialog("");
      return;
    }
    const pn = playName !== "" ? playName : loadPlayName;
    router.push(pn);
    setLoadPlayName("");
    setDialog("");
  };

  const loadPlay = (playName: string) => {
    setLoadPlayName(playName);
    if (scene.props.dirty == "true") {
      setDialog("load");
    } else {
      onDone(true, playName);
    }
  };

  const save = () => {
    const serializedPlay = JSON.stringify(scene);
    user
      .getIdToken()
      .then((token) => {
        return fetch("/api/save", {
          method: "POST",
          headers: {
            Authorization: "Bearer " + token,
          },
          body: serializedPlay,
        });
      })
      .then((resp) => {
        resp.json().then((updatedPlay) => {
          dispatch(
            updateSceneId({
              id: updatedPlay.id!,
              parent: updatedPlay.parent,
            })
          );

          router.push(`/plays/${updatedPlay.id!}`, undefined, {
            shallow: true,
          });
        });
      });
  };

  return (
    <>
      {!open && (
        <nav
          className="mt-2 space-y-1 flex flex-col items-center"
          aria-label="Pagination"
        >
          <NavButton
            id="open-state-nav"
            showKeyboardShortcut={false}
            keyboardShortcut="m"
            narrow={true}
            onKey={() => {
              setOpen(true);
            }}
            onClick={() => {
              setOpen(true);
            }}
          >
            <MenuIcon className="h-6 w-6" aria-hidden="true" />
          </NavButton>
          <NavButton
            id="save-button"
            showKeyboardShortcut={false}
            keyboardShortcut="ctrl+s,cmd+s"
            narrow={true}
            tooltipDir="left"
            tooltipText="Save"
            onClick={() => {
              save();
            }}
            onKey={() => {
              save();
            }}
          >
            <SaveIcon className="h-6 w-6"></SaveIcon>
          </NavButton>
          <NavButton
            id="export-button"
            showKeyboardShortcut={false}
            keyboardShortcut="cmd+e,ctrl+e"
            narrow={true}
            tooltipDir="left"
            tooltipText="Export"
            onClick={() => {
              setOpen(false);
              setDialog("export");
            }}
            onKey={() => {
              setOpen(false);
              setDialog("export");
            }}
          >
            <DocumentDownloadIcon className="h-6 w-6"></DocumentDownloadIcon>
          </NavButton>
        </nav>
      )}
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="z-20 fixed inset-0 overflow-hidden"
          onClose={setOpen}
        >
          <div className="z-20 absolute inset-0 overflow-hidden">
            <Dialog.Overlay className="absolute inset-0" />

            <div className="z-20 pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <div className="z-20 pointer-events-auto w-screen max-w-sm">
                  <div className="z-20 flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                    <div className="z-20 px-4 sm:px-6">
                      <div className="z-20 flex items-start justify-between">
                        <Dialog.Title className="text-lg font-medium text-gray-900">
                          <span>Play Whiteboard</span>
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            onClick={() => setOpen(false)}
                          >
                            <span className="sr-only">Close panel</span>
                            <XIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="relative mt-6 flex-1 divide-y">
                      <div className="block px-4 py-2 text-lg pt-4 md:hidden relative">
                        <div className="relative z-0 rounded-md shadow-sm -space-x-px">
                          <label
                            htmlFor="name"
                            className="absolute -top-2 left-2 -mt-px inline-block px-1 bg-white text-xs font-medium text-gray-900"
                          >
                            Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            value={scene.props.playName}
                            onChange={(e) => {
                              dispatch(updatePlayName(e.target.value));
                            }}
                            className="border-gray-300 border px-1 py-1 pt-4 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-sm"
                          />
                        </div>
                      </div>
                      {/* Replace with your content */}
                      <SlideNavButton selected={false}>
                        <span>Play Actions</span>
                      </SlideNavButton>
                      <SlideNavButton selected={false}>
                        <FieldSelector></FieldSelector>
                      </SlideNavButton>
                      <SlideNavButton
                        onClick={() => {
                          setDialog("new");
                        }}
                        selected={false}
                      >
                        <PlusCircleIcon className="h-5 w-5 inline pr-1"></PlusCircleIcon>
                        <span>New</span>
                      </SlideNavButton>
                      <SlideNavButton
                        onClick={() => {
                          save();
                        }}
                        selected={false}
                      >
                        <SaveIcon className="h-5 w-5 inline pr-1"></SaveIcon>
                        <span>Save</span>
                      </SlideNavButton>
                      <SlideNavButton
                        onClick={() => {
                          setOpen(false);
                          setDialog("export");
                        }}
                        selected={false}
                      >
                        <DocumentDownloadIcon className="h-5 w-5 inline pr-1"></DocumentDownloadIcon>
                        <span>Export</span>
                      </SlideNavButton>
                      <SlideNavButton selected={false}>
                        <span>Load Stock Setups</span>
                      </SlideNavButton>
                      <SlideNavButton
                        onClick={() => {
                          loadPlay("/plays/01GYGR0DYZ67G7PJYPFQ2WP3R8");
                        }}
                        selected={false}
                      >
                        <span>6 on 6</span>
                      </SlideNavButton>
                      <SlideNavButton
                        onClick={() => {
                          loadPlay("/plays/01G3Z17JVXXF6095NMTPR7PK5A");
                        }}
                        selected={false}
                      >
                        <span>12 Pick</span>
                      </SlideNavButton>
                      <SlideNavButton
                        onClick={() => {
                          loadPlay("/plays/01GYGQWPEK62GB1J1TGJ6D22KA");
                        }}
                        selected={false}
                      >
                        <span>6 on 5</span>
                      </SlideNavButton>
                      {/* /End replace */}
                    </div>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
      <DangerModal
        resolve={handleNewPlay}
        open={dialog === "new"}
        areYouSureText={
          "You have unsaved changes. Are you sure you want to create a new play?"
        }
        cancelText={"Cancel"}
        approveText={"Create"}
        titleText={"Create New Play"}
      ></DangerModal>
      <DangerModal
        resolve={onDone}
        open={dialog === "load"}
        areYouSureText={
          "You have unsaved changes. Are you sure you want to load a play?"
        }
        cancelText={"Cancel"}
        approveText={"Load"}
        titleText={"Load Play"}
      ></DangerModal>
      <SaveModal
        done={() => {
          setDialog("");
        }}
        open={dialog === "save"}
        scene={scene}
      ></SaveModal>
      {dialog === "export" ? (
        <ExportModal
          done={() => {
            setDialog("");
          }}
          open={dialog === "export"}
        ></ExportModal>
      ) : (
        <></>
      )}
    </>
  );
};

export default StateDropdown;
