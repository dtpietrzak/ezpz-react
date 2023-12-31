/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-explicit-any */
import RefreshRuntime from "react-refresh/runtime";

declare global {
  interface Window {
    $RefreshReg$: any;
    $RefreshSig$: any;
    $RefreshRuntime$: any;
  }
}

var prevRefreshReg = window.$RefreshReg$;
var prevRefreshSig = window.$RefreshSig$;

window.$RefreshReg$ = (type, id) => {
  const fullId = id;
  console.log("Registering", type, id)
  RefreshRuntime.register(type, fullId);
};
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
window.$RefreshRuntime$ = RefreshRuntime;

window.$RefreshRuntime$.injectIntoGlobalHook(window);
window.$RefreshReg$ = () => {};
window.$RefreshSig$ = () => (type) => type;
