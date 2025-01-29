import { GroupService } from "../service/group.service";

export const makeAddMemberGroupFactory = () => {
  return new GroupService(); //instanciar aqui
};
