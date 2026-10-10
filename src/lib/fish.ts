import { type CurrentFishingSession } from "../commands/utility/fish-handler";

export interface FishingResult {
  exp: number;
  location: string;
  loot: { count: number; name: string }[];
  timestamp: number;
  userId: string;
}

export async function play(
  current: CurrentFishingSession,
): Promise<FishingResult> {
  ++current.session.fishCaught;

  // Hard coded example for now
  return {
    exp: 123,
    location: "localhost",
    loot: [
      { count: 2, name: "Cookie" },
      { count: 4, name: "Widget" },
    ],
    timestamp: Date.now(),
    userId: current.session.userId,
  };
}
