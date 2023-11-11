import { ChangeEventHandler } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fieldEnumerator, ValidFields } from "../lib/Fields";
import { Field, setField } from "../lib/state/features/sceneSlice";
import { RootState } from "../lib/state/store";

const FieldSelector: React.FC = () => {
  const currentField = useSelector((state: RootState) => {
    return state.scene.field;
  });

  const dispatch = useDispatch();

  const onSelect: ChangeEventHandler<HTMLSelectElement> = (e) => {
    dispatch(setField(e.target.value as ValidFields));
  };

  return (
    <>
      <label
        htmlFor="location"
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        Select Field
      </label>
      <select
        id="location"
        name="location"
        className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
        onChange={onSelect}
        value={currentField}
      >
        {fieldEnumerator().map(([key, fieldConfig]) => {
          return (
            <option value={key} key={key}>
              {fieldConfig.description}
            </option>
          );
        })}
      </select>
    </>
  );
};

export default FieldSelector;
