# Builds the Claude artifact version of the trainer from poker-trainer/index.html.
# The artifact is the same page with the Claude coach visible, and without what only the
# installable app needs (doctype/head wrapper, manifest, app icons, offline service worker).
# Usage: powershell -File make-claude-version.ps1 -Out <path\to\poker-trainer-claude.html>
param([Parameter(Mandatory = $true)][string]$Out)

$src = Join-Path $PSScriptRoot '..\index.html'
$html = [IO.File]::ReadAllText($src, [Text.Encoding]::UTF8)

# Keep the trainer's own <title>, fonts and styles (everything from <title> to </head>)
$headPart = $html.Substring($html.IndexOf('<title>'), $html.IndexOf('</head>') - $html.IndexOf('<title>'))
# Keep the page body, minus the service worker registration at the end
$bodyStart = $html.IndexOf('<body>') + '<body>'.Length
$swStart = $html.IndexOf("<script>`nif ('serviceWorker'")
if ($swStart -lt 0) { $swStart = $html.IndexOf("<script>`r`nif ('serviceWorker'") }
if ($swStart -lt 0) { throw 'Service worker block not found in index.html' }
$bodyPart = $html.Substring($bodyStart, $swStart - $bodyStart)

$page = ($headPart + $bodyPart).
  Replace('<section class="coach" id="coach" hidden>', '<section class="coach" id="coach">').
  Replace('The Claude coach only works in the Claude version of the trainer. Here, the odds and the hand review work normally.',
          'The coach works on the page published in Claude. The odds and the review work everywhere.')

[IO.File]::WriteAllText($Out, $page, (New-Object Text.UTF8Encoding $false))
Write-Output "Wrote $Out ($((Get-Item $Out).Length) bytes)"
