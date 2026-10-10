// Helper to reliably load game, product, and rating assets using Vite's eager glob import

const gameAssets = import.meta.glob("../assets/images/games/*/*", {
  eager: true,
  import: "default"
}) as Record<string, string>;

const productAssets = import.meta.glob("../assets/images/products/*/*", {
  eager: true,
  import: "default"
}) as Record<string, string>;

import pegi16 from "../assets/images/pegi_16.png";
import esrbM from "../assets/images/esrb_m.png";

export { pegi16, esrbM };

export function getGameAssetUrl(gameId: number | string, filename: string): string {
  const key = `../assets/images/games/${gameId}/${filename}`;
  return gameAssets[key] || "";
}

export function getProductAssetUrl(productId: number | string, filename: string): string {
  const key = `../assets/images/products/${productId}/${filename}`;
  return productAssets[key] || "";
}
