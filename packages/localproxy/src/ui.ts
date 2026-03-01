import { palette } from "@vlandoss/clibuddy";

export const UI_LOGO = `🛠️ ${palette.bold("localproxy")}`;

export const BANNER_TEXT = `${UI_LOGO}: Simple local development proxy automation\n`;

export const CREDITS_TEXT = `\nAcknowledgment:
- Caddy: for being a powerful proxy server
  ${palette.link("https://caddyserver.com")}

- hosts: making it easier to manage host file
  ${palette.link("https://github.com/xwmx/hosts")}`;
