import { tsupDefaults } from "../../tsup-defaults";
import pkg from "./package.json";

export default tsupDefaults(pkg, {
  onSuccess: "pnpm run generate-env-shims",
});
