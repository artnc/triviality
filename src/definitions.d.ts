interface Window {
  amplitude: any;
  tvMode: boolean;
}

// https://github.com/parcel-bundler/parcel/issues/6758#issuecomment-1645890712
declare module '*.module.scss' {
  const classNames: { [className: string]: string };
  export = classNames;
}

// https://stackoverflow.com/a/50016917
declare const process: {
  env: {
    NODE_ENV: string;
  };
};
declare const require: any;
