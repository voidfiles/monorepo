import FinaHalfCourtPre2022URL from "!!url-loader!!../public/fina_half_court_pre_2022.svg";
import FinaHalfCourtURL from "!!url-loader!!../public/fina_half_court_pre_2022.svg";
import FinaFullCourtPre2022URL from "!!url-loader!!../public/fina_full_court_2022.svg";
import FinaFullCourtURL from "!!url-loader!!../public/fina_full_court_2022.svg";

export enum ValidFields {
  FINA_FULL_PRE_2022 = "fina_full_pre_2022",
  FINA_FULL_2022 = "fina_full_2022",
  FINA_HALF_PRE_2022 = "fina_half_pre_2022",
  FINA_HALF_2022 = "fina_half_2022",
}

type FieldConfig = {
  description: string;
  fieldPath: string;
};

type FieldsDef = {
  [key in ValidFields]: FieldConfig;
};

const Fields: FieldsDef = {
  [ValidFields.FINA_FULL_PRE_2022]: {
    description: "Fina Full Court (Before 2022)",
    fieldPath: FinaFullCourtPre2022URL,
  },
  [ValidFields.FINA_FULL_2022]: {
    description: "Fina Full Court 2022",
    fieldPath: FinaFullCourtURL,
  },
  [ValidFields.FINA_HALF_PRE_2022]: {
    description: "Fina Half Court (Before 2022)",
    fieldPath: FinaHalfCourtPre2022URL,
  },
  [ValidFields.FINA_HALF_2022]: {
    description: "Fina Half Court 2022",
    fieldPath: FinaHalfCourtURL,
  },
};

export const fieldEnumerator = (): Array<[ValidFields, FieldConfig]> => {
  return Object.entries(Fields).map(([key, config]) => [
    key as ValidFields,
    config,
  ]);
};

export const fieldConfigForKey = (key: ValidFields) => {
  return Fields[key];
};

export default Fields;
