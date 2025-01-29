import { GroupService } from "../service/group.service";

export const makeViewBalancesGroupFactory = () => {
  return new GroupService(); //instanciar aqui
};
