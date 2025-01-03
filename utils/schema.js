const yup = require("yup");

const authSchema = yup.object().shape({
  name: yup
    .string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  userName: yup
    .string()
    .required("userName is required")
    .min(2, "userName must be at least 2 characters")
    .max(50, "userName must be at most 50 characters"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
});

module.exports = {
  authSchema,
};
