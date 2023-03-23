import { Config } from "./config.js";

export const query = async (query: string, variables: Record<string, any>) => {
  const endpoint = "https://coordinape-prod.hasura.app/v1/graphql";
  const apiKey = Config.env.COORDINAPE_API_KEY;
  const nameMatch = query.match(/^query\s([a-zA-Z0-9\-\_]+)\s/);
  if(!nameMatch) throw new Error(`Could not find name of query: ${JSON.stringify(query)}`);
  const name = nameMatch[1];
  const body = JSON.stringify({
    operationName: name,
    variables,
    query
  });
  const req = new Request(endpoint, {
    method: "POST",
    headers: {
      "authorization": `Bearer ${apiKey}`
    },
    body
  });
  const res = await fetch(req);
  const data = await res.json();
  if(!data.data) {
    throw new Error(`Missing data in response. There may have been an error in the query. Response: ${JSON.stringify(data)}`);
  }
  return data.data;
};