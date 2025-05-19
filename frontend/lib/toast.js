import toast from "react-hot-toast";

export const Toast = {
  success: (message) => toast.success(message),
  error: (message) => toast.error(message),
  loading: (message) => toast.loading(message),
  dismiss: (toastId) => toast.dismiss(toastId),
  custom: (message, options) => toast(message, options),
};