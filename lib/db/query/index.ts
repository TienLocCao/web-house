import * as pagination from "./pagination"
import * as orderBy from "./order-by"
import * as where from "./where"

export const query = {
  ...pagination,
  ...orderBy,
  ...where,
}

export default query