import { ReactNode } from "react";
import { Layout } from "src/components/layout";

export default function PageLayout({ children }: { children: ReactNode }) {
  return <Layout>{children}</Layout>;
}
