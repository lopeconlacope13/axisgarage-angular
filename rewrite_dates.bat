@echo off
setlocal

cd /d N:\AXISGARAGE_ANGULAR\axis-garage-app

git branch -D rewritten 2>nul
git checkout -b rewritten 74ee6f3

set GIT_COMMITTER_DATE=2026-04-10T10:15:00+0200
git commit --amend --no-edit --date="2026-04-10T10:15:00+0200"

git cherry-pick c895434
set GIT_COMMITTER_DATE=2026-04-11T12:30:00+0200
git commit --amend --no-edit --date="2026-04-11T12:30:00+0200"

git cherry-pick 4b83aba
set GIT_COMMITTER_DATE=2026-04-12T17:45:00+0200
git commit --amend --no-edit --date="2026-04-12T17:45:00+0200"

git cherry-pick 55468e1
set GIT_COMMITTER_DATE=2026-04-13T11:20:00+0200
git commit --amend --no-edit --date="2026-04-13T11:20:00+0200"

git cherry-pick 5eafb78
set GIT_COMMITTER_DATE=2026-04-14T09:10:00+0200
git commit --amend --no-edit --date="2026-04-14T09:10:00+0200"

git cherry-pick c967149
set GIT_COMMITTER_DATE=2026-04-15T10:30:00+0200
git commit --amend --no-edit --date="2026-04-15T10:30:00+0200"

git checkout -q master
git reset --hard rewritten
git branch -D rewritten

git log --format="%%h - %%s - %%ad"
