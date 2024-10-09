import * as Yup from "yup";

export const buildValidationSchema = () =>
  Yup.object({
    from_name: Yup.string().required("Name is required field"),
    from_email: Yup.string()
      .email("Invalid email address")
      .required("Email is required field"),
    message: Yup.string().required("Message is required field"),
  });
