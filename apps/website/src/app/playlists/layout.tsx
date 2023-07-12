import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { Layout } from "src/components/layout";
import { apiServer } from "src/util/api-server";

export default async function PageLayout({
  children,
}: {
  children: ReactNode;
}) {
  try {
    const { data: user } = await apiServer().get("/auth/me");
    const { data: state } = await apiServer().get("/media/now-playing");
    return (
      <Layout state={state} user={user}>
        {children}
      </Layout>
    );
  } catch (e: any) {
    if (e.response?.status === 401) throw redirect("/api/auth/authorize");
  }
}
