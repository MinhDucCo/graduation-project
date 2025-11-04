// Project-level alias for the axios instance so imports like "@/utils/api" work
// `sever_node` is a sibling of `utils`, so use a parent-relative path.
import { api as serverApi } from "../sever_node/utils/api";

export const api = serverApi;

export default api;
