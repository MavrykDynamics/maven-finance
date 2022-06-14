import { TREASURYS_COLORS } from "app/App.components/PieСhart/pieChart.const"

export const calcPersent = (number: number, wholeSum: number) => number / (wholeSum / 100)
// TODO: add random asset colors?
export const getAssetColor = (assetIdx: number) => TREASURYS_COLORS[assetIdx >= TREASURYS_COLORS.length ? assetIdx - TREASURYS_COLORS.length : assetIdx]