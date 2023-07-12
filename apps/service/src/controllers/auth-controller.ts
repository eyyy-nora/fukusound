import { User } from "@fukumong/database";
import { env } from "@fukumong/util";
import { Get, Post, Query, Service, Session } from "@propero/easy-api";
import axios from "axios";
import { PermissionsBitField, OAuth2Scopes } from "discord.js";
import { discord } from "src/init/discord";
import { Mount } from "src/mount";
import crypto from "node:crypto";
import qs from "node:querystring";

@Mount("/auth")
@Service()
export class AuthController {
  get client() {
    return discord;
  }

  get oauth() {
    return {
      client_id: env("discord_client_id"),
      client_secret: env("discord_client_secret"),
      redirect_uri: env("website_url") + "api/auth/callback",
      scope: "identify guilds",
    };
  }

  @Get("/invite")
  public async invite() {
    return {
      redirect: this.client.generateInvite({
        permissions: PermissionsBitField.All,
        scopes: [OAuth2Scopes.Bot],
      }),
    };
  }

  @Get("/authorize")
  public async authorize(@Session() session: any) {
    const state = crypto.randomBytes(24).toString("hex");
    const { client_id, scope, redirect_uri } = this.oauth;
    session.oauth_state = state;
    return {
      redirect: this.buildAuthUrl("authorize", {
        response_type: "code",
        client_id,
        scope,
        redirect_uri,
        state,
      }),
    };
  }

  @Get("/callback")
  public async callback(
    @Session() session: any,
    @Query("code") code: string,
    @Query("state") state: string,
  ) {
    if (session.oauth_state !== state || !state)
      throw new Error("401 Unauthorized");
    const { client_id, client_secret, scope, redirect_uri } = this.oauth;
    const { data } = await axios.post(
      this.buildAuthUrl("token"),
      qs.stringify({
        grant_type: "authorization_code",
        client_id,
        client_secret,
        scope,
        redirect_uri,
        code,
      }),
      { headers: { "content-type": "application/x-www-form-urlencoded" } },
    );
    delete session.state;
    Object.assign(session, data);
    session.user = await this.me(data.access_token);
    return `<html><head><script>if(window.opener)try {window.close()}catch(e){window.location='/'}else window.location='/'</script></head></html>`;
  }

  @Post("/logout")
  public async logout(@Session() session: any) {
    if (!session.access_token) return;
    await this.revokeToken(session.access_token);
    await this.revokeToken(session.refresh_token);
    session.access_token = session.refresh_token = session.user = undefined;
    return { status: 200, data: { success: true } };
  }

  @Get("/me")
  async me(@Session("access_token") token: string) {
    if (!token) throw new Error("401 Unauthorized");
    const me = await this.apiRequest("users/@me", token);
    await User.upsert(
      {
        discordId: me.id,
        name: me.username,
        avatar: `//cdn.discordapp.com/avatars/${me.id}/${me.avatar}.png`,
      },
      { conflictPaths: ["discordId"] },
    );
    return await User.findOneByOrFail({ discordId: me.id });
  }

  async revokeToken(token: string) {
    const { client_id, client_secret } = this.oauth;
    try {
      await axios.post(
        this.buildAuthUrl("token/revoke"),
        qs.stringify({ client_id, client_secret, token }),
        { headers: { "content-type": "application/x-www-form-urlencoded" } },
      );
    } catch {
      // ignored
    }
  }

  buildAuthUrl(endpoint: string, params?: any) {
    const url = `https://discordapp.com/api/oauth2/${endpoint}`;
    return params ? `${url}?${qs.stringify(params)}` : url;
  }

  apiRequest(path: string, token: string) {
    return axios
      .get(`https://discordapp.com/api/${path}`, {
        headers: { authorization: `Bearer ${token}` },
      })
      .then(it => it.data);
  }
}
