"use client";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import classes from "./navigation.module.css";
import { UserInfo } from "src/components/layout";
import { apiClient } from "src/util/api-client";

export interface NavigationItemProps {
  exact?: boolean;
  name: string;
  href: string;
}

export interface NavigationProps {
  extra: NavigationItemProps[];
  user?: UserInfo;
}

export function NavigationItem({
  name,
  href,
  exact = true,
  section,
}: NavigationItemProps & { section: string }) {
  const active = exact ? section === href : section.startsWith(href);
  return (
    <li className={clsx(classes.navItem, active && classes.active)}>
      <Link tabIndex={active ? -1 : undefined} href={href}>
        {name}
      </Link>
    </li>
  );
}

export function Navigation({ extra, user }: NavigationProps) {
  const section = usePathname();
  return (
    <nav className={classes.navigation}>
      <ul className={classes.navList}>
        <li className={classes.navColonThree} title="love you fuku <3">
          :3
        </li>
        <NavigationItem name="Music" href="/" section={section} />
        <NavigationItem name="Playlists" href="/playlists" section={section} />
        <NavigationItem name="Effects" href="/effects" section={section} />
        <NavigationItem
          name="Soundboards"
          href="/soundboards"
          section={section}
        />

        <li className={classes.sep} />

        {extra.map(({ href, name }) => (
          <NavigationItem
            name={name}
            href={href}
            section={section}
            key={href}
          />
        ))}
      </ul>
      <div className={classes.navEnd}>
        {user ? (
          <div className={classes.user}>
            <img src={user.avatar} className={classes.avatar} />
            <div className={classes.userInfo}>
              <span className={classes.username}>{user.name}</span>
              <button
                className={classes.logout}
                onClick={() => apiClient().post("/auth/logout")}>
                Logout
              </button>
            </div>
          </div>
        ) : (
          <Link href={`/api/auth/authorize`} className={classes.login}>
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
