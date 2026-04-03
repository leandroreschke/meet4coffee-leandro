export type CreateWorkspaceFormState = {
  message: string | null;
  redirectTo: string | null;
  values: {
    name: string;
    slug: string;
    timezone: string;
    workdayStart: string;
    workdayEnd: string;
  };
};

export const initialCreateWorkspaceFormState: CreateWorkspaceFormState = {
  message: null,
  redirectTo: null,
  values: {
    name: "",
    slug: "",
    timezone: "America/Sao_Paulo",
    workdayStart: "09:00",
    workdayEnd: "17:00",
  },
};
