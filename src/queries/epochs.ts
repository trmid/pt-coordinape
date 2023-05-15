import { query } from "../query.js";
import { getState, updateState } from "../state.js";

const queryStr = `query Contributions ($last_epoch_num: bigint) {
  epochs(where: {circle_id: {_eq: 9}, ended: {_eq: false}}) {
    id
    number
    start_date
    end_date
  }
}`;

export const getLastAlertedEpochNumber = async () => {
  const state = await getState();
  return state.lastAlertedEpochNumber ?? -1;
};

export const setLastAlertedEpochNumber = async (epochNumber: number) => {
  await updateState(state => {
    state.lastAlertedEpochNumber = epochNumber;
    return state;
  });
};

export const epochsEndingWithin = async (msDuration: number) => {
  const res: {
    epochs: {
      id: number
      number: number
      start_date: string
      end_date: string
    }[]
  } = await query(queryStr, { });
  const now = Date.now();
  const endingWithinDuration = res.epochs.filter(x => {
    const endDate = new Date(x.end_date).getTime();
    const timeUntilEnd = endDate - now;
    return timeUntilEnd > 0 && timeUntilEnd < msDuration;
  });
  return endingWithinDuration;
}