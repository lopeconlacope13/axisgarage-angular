@echo off
setlocal

cd /d N:\AXISGARAGE_ANGULAR\axis-garage-app

git branch -D rewritten 2>nul
git checkout -b rewritten 3c79ea4

set GIT_COMMITTER_DATE=2026-04-07T10:15:00+0200
git commit --amend --no-edit --date="2026-04-07T10:15:00+0200"

git cherry-pick 173a9cd
set GIT_COMMITTER_DATE=2026-04-08T12:30:00+0200
git commit --amend --no-edit --date="2026-04-08T12:30:00+0200"

git cherry-pick dc51440
set GIT_COMMITTER_DATE=2026-04-09T17:45:00+0200
git commit --amend --no-edit --date="2026-04-09T17:45:00+0200"

git cherry-pick d8beec9
set GIT_COMMITTER_DATE=2026-04-10T11:20:00+0200
git commit --amend --no-edit --date="2026-04-10T11:20:00+0200"

git cherry-pick 06b162e
set GIT_COMMITTER_DATE=2026-04-11T09:10:00+0200
git commit --amend --no-edit --date="2026-04-11T09:10:00+0200"

git cherry-pick 466a839
set GIT_COMMITTER_DATE=2026-04-12T10:30:00+0200
git commit --amend --no-edit --date="2026-04-12T10:30:00+0200"

git cherry-pick 4f32806
set GIT_COMMITTER_DATE=2026-04-13T12:00:00+0200
git commit --amend --no-edit --date="2026-04-13T12:00:00+0200"

git cherry-pick 28b65ef
set GIT_COMMITTER_DATE=2026-04-14T10:00:00+0200
git commit --amend --no-edit --date="2026-04-14T10:00:00+0200"

git cherry-pick 27f80b5
set GIT_COMMITTER_DATE=2026-04-15T11:00:00+0200
git commit --amend --no-edit --date="2026-04-15T11:00:00+0200"

git checkout -q master
git reset --hard rewritten
git branch -D rewritten

git log --format="%%h - %%s - %%ad"
