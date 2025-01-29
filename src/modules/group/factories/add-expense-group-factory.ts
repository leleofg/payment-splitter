import { GroupService } from "../service/group.service";

export const makeAddExpenseGroupFactory = () => {
  return new GroupService(); //instanciar aqui
};
