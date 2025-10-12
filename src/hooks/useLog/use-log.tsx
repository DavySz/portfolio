import { useEffect, useRef } from "react";
import { LogMessage, UseLogOptions } from "./use-log.types";

export const useLog = (
  messages: LogMessage | LogMessage[],
  options: UseLogOptions = { runOnce: true }
) => {
  const hasLoggedRef = useRef(false);

  useEffect(() => {
    if (options.runOnce && hasLoggedRef.current) {
      return;
    }

    if (options.runOnce) {
      hasLoggedRef.current = true;
    }

    const messageArray = Array.isArray(messages) ? messages : [messages];

    messageArray.forEach((message) => {
      if (message.styles && message.styles.length > 0) {
        console.log(message.text, ...message.styles);
      } else {
        console.log(message.text);
      }
    });
  }, [messages, options.runOnce]);
};
