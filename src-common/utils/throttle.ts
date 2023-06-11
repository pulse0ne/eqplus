export default function throttle (func: Function, threshold: number) {
  if (!threshold || threshold < 0) threshold = 250;
  let last: number;
  let deferred: number|undefined;
  return function () {
    const now = +new Date();
    const args = arguments;
    if (last && now < last + threshold) {
      clearTimeout(deferred);
      deferred = setTimeout(function () {
        last = now;
        func.apply(null, args);
      }, threshold);
    } else {
      last = now;
      func.apply(null, args);
    }
  };
};
