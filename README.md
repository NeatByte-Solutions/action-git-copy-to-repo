# action-git-copy-to-repo
Github Action to push code changes from one git repo to other one as one commit

## How to Publish a New Release

1. Go to the Releases page and press `Draft new release`.
2. In the `Choose a tag` dropdown, type a new tag name in the format `v0.x.x` (e.g., `v0.4.0`) and select `Create new tag: v0.x.x on publish`.
3. For the `Release title` field, type the same version tag with the same formatting.
4. Add a description.
5. Ensure that `Set as the latest release` is checked (it should be checked by default).
6. Press `Publish release`.

After publishing the new release, `latest-version-tag-update.yml` will run, linking `v1` to the published release. New release updates should now be available at `action-git-copy-to-repo@v1`.
