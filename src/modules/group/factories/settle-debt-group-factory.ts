import { GroupService } from "../service/group.service";

export const makeSettleDebtGroupFactory = () => {
  return new GroupService(); //instanciar aqui
};
