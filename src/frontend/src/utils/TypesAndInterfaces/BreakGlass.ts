// type
import type { Break_Glass } from "../generated/graphqlTypes";

import { normalizeBreakGlass } from "../../pages/BreakGlass/BreakGlass.helpers";

export type BreakGlassStorage = ReturnType<typeof normalizeBreakGlass>;

export type BreakGlassGraphQL = Omit<Break_Glass, "__typename">;
