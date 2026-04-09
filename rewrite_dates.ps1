$commits = @(
  "820f8d3",
  "d25d51f",
  "3bd9cb0",
  "c7ef518",
  "53e1970"
)

$dates = @(
  "2026-04-10T11:45:00+0200",
  "2026-04-11T16:20:00+0200",
  "2026-04-13T10:15:00+0200",
  "2026-04-15T09:30:00+0200",
  "2026-04-15T10:22:00+0200"
)

Set-Location 'N:\AXISGARAGE_ANGULAR\axis-garage-app'

# Empezamos desde el primer commit
git checkout -q $commits[0]
$env:GIT_COMMITTER_DATE=$dates[0]
git commit --amend --no-edit --date=$dates[0]
git branch -f rewritten HEAD

# Hacemos cherry-pick y amend secuencial de los demás
for($i=1; $i -lt $commits.Length; $i++) {
  git cherry-pick $commits[$i]
  $env:GIT_COMMITTER_DATE=$dates[$i]
  git commit --amend --no-edit --date=$dates[$i]
}

# Sobrescribimos master con la nueva rama
git checkout -q master
git reset --hard rewritten
git branch -D rewritten

# Limpiamos las variables de entorno para futuros commits manuales del sistema
Remove-Item Env:\GIT_COMMITTER_DATE

# Mostramos el resultado
git log --format="%h - %s - %ad"
