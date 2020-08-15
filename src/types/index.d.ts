export type Payload = {
  email: string;
  token: string;
  name?: string;
};

export enum Status {
  SUCCESS = 'success',
  ERROR = 'error',
}

export interface ErrorResponse {
  ErrorIdentifier: string;
  ErrorCode: string;
  StatusCode: number;
  ErrorMessage: string;
  ErrorRelatedTo: [];
}
