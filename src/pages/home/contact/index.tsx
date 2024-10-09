import toast, { Toaster } from "react-hot-toast";
import emailjs from "emailjs-com";
import { useFormik } from "formik";
import { ContactForm, ToastVariant } from "./types";
import { buildValidationSchema } from "./validation";
import { Input } from "../../../components/input";
import { TextArea } from "../../../components/textarea";
import { Button } from "../../../components/button";
const env = import.meta.env;

export const Contact: React.FC = () => {
  const showToast = (message: string, type: ToastVariant) => {
    toast[type](message, { duration: 4000 });
  };

  const buildTemporaryForm = (values: ContactForm): HTMLFormElement => {
    const form = document.createElement("form");
    form.innerHTML = `
      <input name="from_name" value="${values.from_name}" />
      <input name="from_email" value="${values.from_email}" />
      <textarea name="message">${values.message}</textarea>
    `;

    return form;
  };

  const sendEmail = async (values: ContactForm) => {
    try {
      await emailjs.sendForm(
        env.VITE_EMAIL_SERVICE_ID,
        env.VITE_EMAIL_TEMPLATE_ID,
        buildTemporaryForm(values),
        env.VITE_EMAIL_PUBLIC_KEY
      );

      showToast("Email sent successfully!", "success");
    } catch {
      showToast(
        "Unfortunately, your email could not be sent. Please try again later!",
        "error"
      );
    }
  };

  const formik = useFormik({
    validationSchema: buildValidationSchema(),
    onSubmit: sendEmail,
    initialValues: {
      from_name: "",
      from_email: "",
      message: "",
    },
  });

  const getFieldError = (field: keyof typeof formik.values): string => {
    if (!(formik.touched[field] && formik.errors[field])) return "";
    return formik.errors[field];
  };

  return (
    <div
      id="contact"
      className="flex flex-col px-[100px] items-center justify-center bg-[#F6F3FC] py-[94px]"
    >
      <div className="flex flex-col justify-center w-[545px] rounded-[20px] bg-white p-[34px] pb-[47px]">
        <h1 className="font-poppins font-bold text-4xl bg-gradient-to-tr from-[#7947DF] to-[#311961] bg-clip-text text-transparent mb-4">
          Let's work together!
        </h1>
        <p className="font-poppins font-normal text-xl text-[#000000] text-start w-full pb-9">
          I create clean and elegant code for beautifully simple solutions, and
          I'm passionate about what I do. It's as simple as that!
        </p>
        <form
          className="flex flex-col items-start gap-5"
          onSubmit={formik.handleSubmit}
        >
          <Input
            {...formik.getFieldProps("from_name")}
            error={getFieldError("from_name")}
            value={formik.values.from_name}
            onChange={formik.handleChange}
            placeholder="Your name"
            name="from_name"
            id="from_name"
            type="text"
          />
          <Input
            {...formik.getFieldProps("from_email")}
            error={getFieldError("from_email")}
            value={formik.values.from_email}
            onChange={formik.handleChange}
            placeholder="Your email"
            name="from_email"
            id="from_email"
            type="email"
          />
          <TextArea
            {...formik.getFieldProps("message")}
            error={getFieldError("message")}
            onChange={formik.handleChange}
            value={formik.values.message}
            placeholder="Message"
            name="message"
            id="message"
          />
          <div className="mt-[14px]">
            <Button type="submit" disabled={!(formik.isValid && formik.dirty)}>
              Send Message
            </Button>
          </div>
        </form>
      </div>
      <Toaster />
    </div>
  );
};
