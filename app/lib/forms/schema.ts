export type FormKind = "contact" | "spark-register";

export type FormApiResponse = {
  ok: boolean;
  referenceId?: string;
  fieldErrors?: Record<string, string>;
  formError?: string;
};

export const formEndpoints: Record<FormKind, string> = {
  contact: "/api/contact",
  "spark-register": "/api/spark-register",
};
