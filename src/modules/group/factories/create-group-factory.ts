import { GroupService } from "../service/group.service";

export const makeCreateGroupFactory = () => {
  return new GroupService(); //instanciar aqui
};
