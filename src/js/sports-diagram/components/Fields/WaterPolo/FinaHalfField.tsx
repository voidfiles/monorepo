import React from 'react';
import { Group, Path } from 'react-konva';

const FinaHalfField = () => {
  return (
    <Group x={0} y={0} width={1920} height={1080}>
      <Path
        fill="#eff6ff"
        stroke="none"
        data="M 112.941177 79.822632 L 1807.058838 79.822632 L 1807.058838 2075.387939 L 112.941177 2075.387939 Z"
      />
      <Path
        fill="#fefce8"
        stroke="none"
        data="M 112.941177 239.467834 L 1807.058838 239.467834 L 1807.058838 558.758301 L 112.941177 558.758301 Z"
      />
      <Path
        fill="#fdf2f8"
        stroke="none"
        data="M 112.941177 79.822632 L 1807.058838 79.822632 L 1807.058838 239.467834 L 112.941177 239.467834 Z"
      />
      <Path
        fill="#e2e8f0"
        stroke="none"
        data="M 790.588257 39.911255 L 1129.411743 39.911255 L 1129.411743 79.822632 L 790.588257 79.822632 Z"
      />
      <Path
        fill="none"
        stroke="#475569"
        strokeWidth={5}
        strokeLinecap="round"
        data="M 115.764709 478.53656 L 1804.235352 478.53656"
      />
      <Path
        fill="none"
        stroke="#475569"
        strokeWidth={5}
        data="M 1809.882324 558.758301 L 1809.882324 1596.452393"
      />
      <Path
        fill="none"
        stroke="#475569"
        strokeWidth={5}
        data="M 110.117645 558.758301 L 110.117645 1596.452393"
      />
      <Path
        fill="none"
        stroke="#475569"
        strokeWidth={5}
        data="M 110.117645 558.758301 L 110.117645 79.822632"
      />
      <Path
        fill="none"
        stroke="#475569"
        strokeWidth={5}
        data="M 107.294121 77.827026 L 1807.058838 77.827026"
      />
      <Path
        fill="none"
        stroke="#475569"
        strokeWidth={5}
        data="M 1809.882324 558.758301 L 1809.882324 75.831482"
      />
      <Path
        fill="none"
        stroke="#475569"
        strokeWidth={5}
        strokeOpacity="0.5"
        strokeLinecap="round"
        data="M 110.117645 239.068726 L 1804.235352 239.068726"
      />
    </Group>
  );
};

export default FinaHalfField;
