@echo off
REM Setup EWBlog database tables

sqlcmd.exe -S . -E -i setup_ewblog.sql
