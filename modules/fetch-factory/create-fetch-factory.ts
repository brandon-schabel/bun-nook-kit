import { type BaseError } from "../base-error";
import { type createErrorHandlerFactory } from "../error-handler-factory/create-error-handler-factory";
import { defaultErrorHandler } from "../error-handler-factory/default-error-handler";

type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE";

export function createFetchFactory<DataType, Error extends BaseError<DataType>>({
  baseUrl,
  errorHandler = defaultErrorHandler<DataType, Error>(),
  logMode,
}: {
  baseUrl?: string;
  errorHandler: ReturnType<typeof createErrorHandlerFactory<DataType, Error>>;
  logMode?: boolean;
}) {
  const baseFetcher = <FetcherDataGeneric = DataType>(
    method: HTTPMethod,
    endpoint: string,
    headers?: HeadersInit,
    body?: BodyInit | null
  ): Promise<{
    data: FetcherDataGeneric;
    getRawResponse: () => Response;
  }> => {
    return errorHandler.handleAsync<{
      data: FetcherDataGeneric;
      getRawResponse: () => globalThis.Response;
    }>(async () => {
      const finalUrl = baseUrl + endpoint;

      const response = await fetch(finalUrl, {
        method,
        headers,
        body,
      });

      if (!response.ok) {
        throw new Error("API_ERROR"); // adapt this to your needs
      }

      const getResponse = () => {
        return response;
      };

      const data = await response.json();
      return { data: data as FetcherDataGeneric, getRawResponse: getResponse };
    });
  };

  return {
    get: (endpoint: string) => baseFetcher("GET", endpoint),

    postJson: <ResponseData = DataType, PostData = unknown>({
      endpoint,
      postData,
      headers,
      params,
    }: {
      endpoint: string;
      postData?: PostData;
      headers?: HeadersInit;
      params?: any;
    }) =>
      baseFetcher<ResponseData>(
        "POST",
        endpoint,
        { "Content-Type": "application/json", ...headers },
        JSON.stringify(postData)
      ),

    postForm: (endpoint: string, formData: FormData) =>
      baseFetcher("POST", endpoint, undefined, formData),

    put: <D = unknown>(endpoint: string, data: D) =>
      baseFetcher(
        "PUT",
        endpoint,
        { "Content-Type": "application/json" },
        JSON.stringify(data)
      ),

    delete: (endpoint: string) => baseFetcher("DELETE", endpoint),
  };
}