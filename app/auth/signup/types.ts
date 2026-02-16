export type SignupError = { message: string; field?: string };

export type SignupState = {
  errors: SignupError[] | null;
};
