import React, { useEffect } from "react";

const GreenovationChatPot = ({ showMessage }) => {
  useEffect(() => {
    if (showMessage) {
      (function () {
        if (
          !window.chatbase ||
          window.chatbase("getState") !== "initialized"
        ) {
          window.chatbase = (...args) => {
            if (!window.chatbase.q) {
              window.chatbase.q = [];
            }
            window.chatbase.q.push(args);
          };
          window.chatbase = new Proxy(window.chatbase, {
            get(target, prop) {
              if (prop === "q") {
                return target.q;
              }
              return (...args) => target(prop, ...args);
            },
          });
        }

        const onLoad = function () {
          const script = document.createElement("script");
          script.src = "https://www.chatbase.co/embed.min.js";
          script.id = "VCc5OLUBbYGECKi5B0Ewj";
          document.body.appendChild(script);
        };

        if (document.readyState === "complete") {
          onLoad();
        } else {
          window.addEventListener("load", onLoad);
        }
      })();
    }

    return () => {
    };
  }, [showMessage]);

  return null;
};

export default GreenovationChatPot;
