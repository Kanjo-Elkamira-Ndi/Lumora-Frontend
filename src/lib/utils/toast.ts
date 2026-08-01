import { toast } from "sonner";

export const toastSuccess = (msg: string) => toast.success(msg);
export const toastError = (msg: string) => toast.error(msg);
export const toastInfo = (msg: string) => toast.info(msg);
