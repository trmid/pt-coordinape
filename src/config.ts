// Check if all env vars exist:
const expected = {
  COORDINAPE_API_KEY: v => v,
  COORDINAPE_CIRCLE_ID: v => parseInt(v),
  BOT_APPLICATION_ID: v => v,
  BOT_PUBLIC_KEY: v => v,
  BOT_TOKEN: v => v,
  BOT_PERMISSIONS: v => parseInt(v),
  BOT_INVITE_LINK: v => v,
  CHANNEL_ID: v => v,
  GUILD_ID: v => v,
} satisfies Record<string, (v: string) => string | number | boolean>

export namespace Config {
  export const env: { [k in keyof typeof expected]: ReturnType<typeof expected[k]> } = Object.fromEntries(Object.entries(expected).map(([key, parse]) => {
    const val = process.env[key];
    if(val === undefined) throw new Error(`Missing environment variable: ${key}`);
    try {
      return [key, parse(val)];
    } catch(err) {
      console.error(err);
      throw new Error(`Invalid environment variable: ${key}`);
    }
  })) as any;
}