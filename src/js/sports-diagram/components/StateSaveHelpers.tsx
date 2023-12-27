import React, { useRef } from 'react';
import type { RootState } from '../lib/store/store';
import { useSelector } from 'react-redux';
import useRegistry from '@lib/useRegistry';

export default function StateSaveHelpers() {
  const [registry, _] = useRegistry();
  const stage = useSelector((state: RootState) => state.stage);
  const sceneJSON = JSON.stringify(stage);
  const dataURL = `data:application/json,${encodeURIComponent(sceneJSON)}`;

  return (
    <a
      href={dataURL}
      download={'play'}
      ref={(el) => registry.setStateDownload(el)}
      className={'hidden'}
    ></a>
  );
}
