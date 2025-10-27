# DevClip Branch Maintenance

This repository now uses a `main` branch as the default development branch. If you
still have a legacy `master` branch locally or on your remote, you can remove it
after verifying the `main` branch contains your latest commits:

```bash
git checkout main
# verify history and remote tracking are correct

git branch -d master             # remove the local branch if it still exists
git push origin --delete master  # drop the remote branch once protections are cleared
```

Make sure to update any branch protection rules or integrations that previously
pointed at `master` so that they target `main` instead. This will ensure GitHub
no longer requires the old branch to remain available.
