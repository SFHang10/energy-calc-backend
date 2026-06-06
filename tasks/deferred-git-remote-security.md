# Deferred: Git remote security (no rush)

**Status:** Backlog — single-user PC is acceptable for now.

## Why

`origin` may be configured with a **GitHub personal access token embedded in the URL**. That works, but tokens in `.git/config` are exposed to anything that can read the repo folder (backups, clones, malware).

## When you pick this up

1. **Rotate** the existing token in GitHub: Settings → Developer settings → Personal access tokens — revoke the old one after switching auth.
2. **Set a clean remote** (no credentials in the URL):
   ```bash
   git remote set-url origin https://github.com/SFHang10/energy-calc-backend.git
   ```
3. **Authenticate** on next `git push` / `git pull` using one of:
   - Git Credential Manager (browser or device login), or  
   - SSH: `git@github.com:SFHang10/energy-calc-backend.git` with an SSH key added to GitHub.

## Done when

- `git remote -v` shows no `ghp_` or password in the URL, and push/pull still work.
