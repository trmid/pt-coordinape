import fs from "fs/promises";

const stateFileName = "state.json";

interface State {
  lastId: number
  lastAlertedEpochNumber?: number
}

export const getState = async () => {
  try {
    const data = await fs.readFile(stateFileName, { encoding: "utf-8" });
    return await JSON.parse(data) as State;
  } catch(err) {
    if(err instanceof Error && err.message.includes("ENOF")) {
      const state: State = {
        lastId: 0
      };
      setState(state);
      return state;
    } else {
      throw err;
    }
  }
};

export const setState = async (state: State) => {
  await fs.writeFile(stateFileName, JSON.stringify(state), { encoding: "utf-8" });
};

export const updateState = async (update: (state: State) => State) => {
  await setState(update(await getState()));
};