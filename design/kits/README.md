# UI kits (raw, not committed)

Drop unpacked asset packs here, one folder per kit, e.g. `design/kits/dark-fantasy-gui/`.
Keep the kit's license file next to it, then run `/create-theme-from-kit <kit>` in Claude Code
(see "Adding a theme kit" in the root README).

Everything in this folder except this README is git-ignored. When a theme is built, only the
slices actually used are copied (optimised) to `src/assets/themes/<theme>/` and committed.
