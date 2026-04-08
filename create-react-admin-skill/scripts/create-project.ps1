param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$ArgsList
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
$CliPath = Join-Path $RootDir "bin/cli.js"

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
  Write-Host "Error: Node.js is required but not found in PATH." -ForegroundColor Red
  exit 1
}

& node $CliPath @ArgsList
exit $LASTEXITCODE
