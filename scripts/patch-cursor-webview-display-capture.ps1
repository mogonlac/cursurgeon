# Adds display-capture to VS Code / Cursor webview iframe allow list so getDisplayMedia works in extension webviews.
# Re-run after Cursor updates if Screenshot breaks again. Close Cursor before patching.

$ErrorActionPreference = 'Stop'

$needle = "allowRules.push('clipboard-read;', 'clipboard-write;');"
$repl = "allowRules.push('clipboard-read;', 'clipboard-write;', 'display-capture;');"

$candidates = @(
  "$env:LOCALAPPDATA\Programs\cursor\resources\app\out\vs\workbench\contrib\webview\browser\pre\index.html"
  "$env:LOCALAPPDATA\Programs\cursor\_\resources\app\out\vs\workbench\contrib\webview\browser\pre\index.html"
)

$patched = 0
foreach ($path in $candidates) {
  if (-not (Test-Path -LiteralPath $path)) { continue }
  $raw = Get-Content -LiteralPath $path -Raw
  if ($raw -match [regex]::Escape('display-capture')) {
    Write-Host "Already patched: $path"
    $patched++
    continue
  }
  if (-not $raw.Contains($needle)) {
    Write-Warning "Expected line not found (Cursor layout changed?): $path"
    continue
  }
  $new = $raw.Replace($needle, $repl)
  Set-Content -LiteralPath $path -Value $new -NoNewline
  Write-Host "Patched: $path"
  $patched++
}

if ($patched -eq 0) {
  Write-Error "No Cursor webview pre/index.html found under LOCALAPPDATA\Programs\cursor. Install Cursor or edit this script with your install path."
  exit 1
}

Write-Host "Done. Restart Cursor completely, then try Cursurgeon Screenshot again."
