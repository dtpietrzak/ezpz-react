/* eslint-disable @typescript-eslint/no-explicit-any */
// thank you Jacob Ebey
type ModuleNamespace = Record<string, any> & {
  [Symbol.toStringTag]: "Module";
};

interface ImportMetaHot {
  accept(cb: (mod: ModuleNamespace) => void): void;
}

interface ImportMeta {
  hot: ImportMetaHot | undefined;
}

interface Window {
  __ezpz_data__: Record<string, any>;
  __ezpz_cache__: Map<string, any>;

  $RefreshReg$: any;
  $RefreshSig$: any;
  $RefreshRuntime$: any;
}
