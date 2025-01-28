import { PublisherSNS } from "../../../services/publisher/publisher-sns";
import { GroupService } from "../service/group.service";

export const makeCreateGroupFactory = () => {
  return new GroupService(new PublisherSNS("GROUP_TOPIC"));
};
