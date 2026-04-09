$commits = @(
  "820f8d3",
  "d25d51f",
  "3bd9cb0",
  "c7ef518",
  "6a5518b",
  "07a2345"
)

$dates = @(
  "2026-04-10T10:15:00+0200",
  "2026-04-12T12:30:00+0200",
  "2026-04-14T17:45:00+0200",
  "2026-04-15T11:20:00+0200",
  "2026-04-16T09:10:00+0200",
  "2026-04-17T10:30:00+0200"
)

Set-Location 'N:\AXISGARAGE_ANGULAR\axis-garage-app'

git checkout -q $commits[0]
$env:GIT_COMMITTER_DATE=$dates[0]
git commit --amend --no-edit --date=$dates[0]
git branch -f rewritten HEAD

for($i=1; $i -lt $commits.Length; $i++) {
  git cherry-pick $commits[$i]
  $env:GIT_COMMITTER_DATE=$dates[$i]
  git commit --amend --no-edit --date=$dates[$i]
}

git checkout -q master
git reset --hard rewritten
git branch -D rewritten
Remove-Item Env:\GIT_COMMITTER_DATE -ErrorAction SilentlyContinue

git log --format="%h - %s - %ad"
