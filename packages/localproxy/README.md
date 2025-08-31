# 🛠️ localproxy

**Simple local development proxy automation with Caddy + hosts management**

Stop remembering ports! localproxy automatically maps your projects to clean `.localhost` domains with automatic HTTPS and hosts file management.

```bash
# Instead of this mess:
http://localhost:3000  # Which project was this?
http://localhost:4000  # And this?
http://localhost:5431  # 🤔

# Get this:
http://frontend.localhost
http://api.localhost
http://admin.localhost
```

## Prerequisites

- Bun >= 1.2.4
- Caddy >= 2.8.4
- hosts >= 3.6.4

## Installation

```sh
pnpm add -g @vlandoss/localproxy
```

It will adds the `localp` CLI to your global workspace

## Usage

> [!NOTE]
> The documentation is WIP

Run the help command:

```sh
localp help
```

## Troubleshooting

To enable debug mode, set the `DEBUG` environment variable to `localproxy:*` before running *any* command.

```sh
DEBUG=localproxy:* localp <command>
```
