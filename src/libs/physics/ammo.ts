import Ammo from "ammojs-typed";

export async function initAmmo() {
  await Ammo.bind(Ammo)(Ammo);
}
