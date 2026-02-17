export type SigninError = { message: string; field?: string };

export type SigninState = {
  errors: SigninError[] | null;
};

export enum HttpMethod {
  Get = 'GET',
  Head = 'HEAD',
  Post = 'POST',
  Put = 'PUT',
  Patch = 'PATCH',
  Delete = 'DELETE',
}