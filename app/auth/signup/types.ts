export type SignupError = { message: string; field?: string };

export type SignupState = {
  errors: SignupError[] | null;
};

export type User = {
  email: string;
  id: string;
};

export type CurrentUser = {
  currentUser: User | null;
};