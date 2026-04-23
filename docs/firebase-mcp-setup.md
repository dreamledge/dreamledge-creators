# Firebase MCP (staging) setup

## 1) Create service account key (staging project)

1. Open Google Cloud Console for your Firebase staging project.
2. Go to `IAM & Admin -> Service Accounts`.
3. Create a service account (example name: `firebase-mcp-staging`).
4. Grant roles:
   - `Cloud Datastore User`
   - `Firebase Authentication Admin`
5. Create a JSON key and download it.

## 2) Place the key locally

- Save the downloaded file at:

`secrets/firebase-staging.service-account.json`

This path is already referenced by `firebase-mcp.json` and is ignored by git.

## 3) MCP config files already added

- `.mcp.json` wires MCP host -> `npx firebase-mcp --config firebase-mcp.json`
- `firebase-mcp.json` contains the `staging` project configuration.

## 4) Restart your MCP host

After saving the service account file, restart your MCP host/IDE session so it loads the new server.

## 5) Quick validation

Run these MCP tools first after restart:

- `get_config`
- `firestore_read` with operation `list_collections` and projectId `staging`
- `auth_read` with operation `list_users` and projectId `staging`

## Important

`firebase-mcp` is read-focused (Firestore/Auth read operations). For write operations, continue using app code + Firebase SDK/CLI until a write-capable MCP server is added.
