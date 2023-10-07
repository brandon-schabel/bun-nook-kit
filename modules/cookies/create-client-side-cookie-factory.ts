import { CookieOptions } from "./cookie-types";
import {
  parseCookieData,
  retrieveRawCookieValue,
  setCookie,
} from "./cookie-utils";

declare var document: {
  cookie: any;
};

export function createClientCookieFactory<T = string>(
  cookieKey: string,
  options?: CookieOptions
) {
  const handleSetCookie = (
    value: T,
    cookieSetOptions: CookieOptions & {
      cookieKey?: string; // optionally override cookie  key
    } = {}
  ) => {
    setCookie(cookieKey, value, cookieSetOptions || options || {});
  };
  const getRawCookie = () => {
    return retrieveRawCookieValue(cookieKey);
  };

  const deleteCookie = () => {
    handleSetCookie("" as T, { maxAge: -1, cookieKey });
  };

  const checkCookie = () => {
    return getRawCookie() !== null;
  };

  const getParsedCookie = <T = string>(): T | null => {
    const rawCookie = getRawCookie();
    return parseCookieData<T>(rawCookie);
  };

  return {
    setCookie: handleSetCookie,
    deleteCookie,
    checkCookie,
    getParsedCookie,
    getRawCookie,
  };
}
