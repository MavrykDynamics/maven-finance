export type Action = { type: string } & { [key: string]: Record<string, object | []> }
