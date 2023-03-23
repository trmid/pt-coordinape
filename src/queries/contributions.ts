import { query } from "../query.js";
import { getState, updateState } from "../state.js";

const queryStr = `query Contributions ($last_id: bigint) {
  contributions(
    where: {circle_id: {_eq: "9"}, id: {_gt: $last_id}}
    order_by: {updated_at: desc},
    limit: 50
  ) {
    description
    id
    updated_at
    created_at
    user {
      id
      profile {
        avatar
        discord_username
        id
        name
      }
    }
  }
}`;


export const getLastContributionId = async () => {
  return (await getState()).lastId;
};

export const setLastContributionId = async (lastId: number) => {
  await updateState(state => {
    state.lastId = lastId;
    return state;
  });
};

export const contributions = async () => {
  let lastId = await getLastContributionId();
  const res: {
    contributions: {
      id: number,
      created_at: string,
      updated_at: string,
      description: string,
      user: {
        id: number,
        profile: {
          avatar: string | null,
          discord_username: string | null,
          id: number,
          name: string
        }
      }
    }[]
  } = await query(queryStr, { last_id: lastId });
  if(res.contributions.length > 0) {
    lastId = Math.max(...res.contributions.map(x => x.id));
    await setLastContributionId(lastId);
  } 
  return res.contributions;
}