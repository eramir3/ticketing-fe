export type SigninError = { message: string; field?: string };

export type SigninState = {
  errors: SigninError[] | null;
};
