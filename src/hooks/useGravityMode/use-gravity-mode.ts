import { useCallback, useEffect, useState } from "react";
import {
  isGravityActive,
  isGravityAvailable,
  subscribeGravity,
  toggleGravity,
} from "../../physics/gravity-mode";

/** Liga o estado do easter egg ao React, sem puxar a física para o bundle. */
export const useGravityMode = () => {
  const [active, setActive] = useState(isGravityActive);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    setAvailable(isGravityAvailable());
    return subscribeGravity(setActive);
  }, []);

  return { active, available, toggle: useCallback(() => toggleGravity(), []) };
};
