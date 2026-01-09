$ErrorActionPreference = 'Stop'

$base = $env:REVault_BaseUrl
if (-not $base) { $base = 'http://localhost:5000' }

Write-Host "== Health ==" -ForegroundColor Cyan
$health = Invoke-RestMethod -Method Get -Uri "$base/health"
$health | ConvertTo-Json -Depth 5

Write-Host "== Seed Admin ==" -ForegroundColor Cyan
Set-Location "d:\ReVault\backend"
# Uses defaults in seedAdmin.js unless env vars override
npm run -s seed:admin

Write-Host "== Admin Login ==" -ForegroundColor Cyan
$adminEmail = $env:ADMIN_EMAIL
$adminPassword = $env:ADMIN_PASSWORD

if ((-not $adminEmail) -or (-not $adminPassword)) {
	$envPath = "d:\ReVault\backend\.env"
	if (Test-Path $envPath) {
		$lines = Get-Content $envPath
		foreach ($line in $lines) {
			if (-not $adminEmail -and $line -match '^\s*ADMIN_EMAIL\s*=\s*(.+)\s*$') { $adminEmail = $Matches[1] }
			if (-not $adminPassword -and $line -match '^\s*ADMIN_PASSWORD\s*=\s*(.+)\s*$') { $adminPassword = $Matches[1] }
		}
	}
}

if (-not $adminEmail) { $adminEmail = 'admin@gmail.com' }
if (-not $adminPassword) { $adminPassword = 'admin' }

$loginBody = @{ email = $adminEmail; password = $adminPassword } | ConvertTo-Json

try {
	$login = Invoke-RestMethod -Method Post -Uri "$base/auth/login" -ContentType 'application/json' -Body $loginBody
} catch {
	Write-Host "Login failed calling $base/auth/login" -ForegroundColor Red
	if ($_.Exception.Response) {
		try {
			$reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
			$body = $reader.ReadToEnd()
			Write-Host "Response body: $body" -ForegroundColor Yellow
		} catch {
			Write-Host "(Could not read response body)" -ForegroundColor Yellow
		}
	}
	throw
}
if (-not $login.token) { throw 'No token returned from /auth/login' }
Write-Host "Logged in as: $($login.user.email) (role: $($login.user.role))" -ForegroundColor Green

$headers = @{ Authorization = "Bearer $($login.token)" }

Write-Host "== Admin Transactions ==" -ForegroundColor Cyan
$tx = Invoke-RestMethod -Method Get -Uri "$base/admin/transactions" -Headers $headers
$txCount = 0
if ($tx.data) { $txCount = @($tx.data).Count }
Write-Host "Transactions returned: $txCount" -ForegroundColor Green

Write-Host "== Admin Notifications ==" -ForegroundColor Cyan
$noti = Invoke-RestMethod -Method Get -Uri "$base/admin/notifications?limit=5" -Headers $headers
$unread = 0
if ($noti.unreadCount -ne $null) { $unread = [int]$noti.unreadCount }
$notiCount = 0
if ($noti.data) { $notiCount = @($noti.data).Count }
Write-Host "Notifications returned: $notiCount (unread: $unread)" -ForegroundColor Green

if ($notiCount -gt 0) {
	$first = $noti.data[0]
	if ($first -and ($first._id -or $first.id)) {
		$nid = $first._id
		if (-not $nid) { $nid = $first.id }
		$mark = Invoke-RestMethod -Method Put -Uri "$base/admin/notifications/$nid/read" -Headers $headers
		Write-Host "Marked notification read: $nid" -ForegroundColor Green
	}
}

Write-Host "== Admin Dashboard ==" -ForegroundColor Cyan
$dash = Invoke-RestMethod -Method Get -Uri "$base/admin/dashboard?range=this_month" -Headers $headers
$cards = $dash.data.cards
Write-Host ("Dashboard cards: revenue={0} orders={1} visitors={2} profit={3}" -f $cards.totalRevenue, $cards.totalOrders, $cards.totalVisitors, $cards.netProfit) -ForegroundColor Green

Write-Host "== Admin Reports (CSV/PDF) ==" -ForegroundColor Cyan
$csv = Invoke-WebRequest -UseBasicParsing -Method Get -Uri "$base/admin/reports/inventory/csv" -Headers $headers
Write-Host "Inventory CSV content-type: $($csv.Headers['Content-Type'])" -ForegroundColor Green

$pdf = Invoke-WebRequest -UseBasicParsing -Method Get -Uri "$base/admin/reports/inventory/pdf" -Headers $headers
Write-Host "Inventory PDF content-type: $($pdf.Headers['Content-Type'])" -ForegroundColor Green

$csv2 = Invoke-WebRequest -UseBasicParsing -Method Get -Uri "$base/admin/reports/completed-transactions/csv" -Headers $headers
Write-Host "Completed Tx CSV content-type: $($csv2.Headers['Content-Type'])" -ForegroundColor Green

$pdf2 = Invoke-WebRequest -UseBasicParsing -Method Get -Uri "$base/admin/reports/completed-transactions/pdf" -Headers $headers
Write-Host "Completed Tx PDF content-type: $($pdf2.Headers['Content-Type'])" -ForegroundColor Green

$csv3 = Invoke-WebRequest -UseBasicParsing -Method Get -Uri "$base/admin/reports/quantity-transferred/csv" -Headers $headers
Write-Host "Quantity Transferred CSV content-type: $($csv3.Headers['Content-Type'])" -ForegroundColor Green

$pdf3 = Invoke-WebRequest -UseBasicParsing -Method Get -Uri "$base/admin/reports/quantity-transferred/pdf" -Headers $headers
Write-Host "Quantity Transferred PDF content-type: $($pdf3.Headers['Content-Type'])" -ForegroundColor Green

Write-Host "\nSMOKE TEST OK" -ForegroundColor Green
