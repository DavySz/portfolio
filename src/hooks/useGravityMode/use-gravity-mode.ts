import { useCallback, useEffect, useState } from "react";
import {
  isGravityActive,
  isGravityAvailable,
  subscribeGravity,
  toggleGravity,
  watchGravityAvailability,
} from "../../physics/gravity-mode";

/** Liga o estado do easter egg ao React, sem puxar a física para o bundle. */
export const useGravityMode = () => {
  const [active, setActive] = useState(isGravityActive);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    setAvailable(isGravityAvailable());

    const unsubscribe = subscribeGravity(setActive);
    const unwatch = watchGravityAvailability(setAvailable);

    return () => {
      unsubscribe();
      unwatch();
    };
  }, []);

  return { active, available, toggle: useCallback(() => toggleGravity(), []) };
};
