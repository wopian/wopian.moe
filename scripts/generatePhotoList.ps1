# Add script to environment path and run `generatePhotoList` in a folder with AVIF images

$scriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Definition }
bun run $scriptDir/generatePhotoList.ts
