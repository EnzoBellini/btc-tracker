import type { Market } from "./locale";
import { detectMarketSync } from "./locale";
import { getAppContent } from "./app-content";

let currentMarket: Market = detectMarketSync();

export function setCurrentMarket(market: Market): void {
  currentMarket = market;
}

export function getCurrentMarket(): Market {
  return currentMarket;
}

export function getT() {
  return getAppContent(currentMarket);
}
