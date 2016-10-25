#!/bin/bash

PID=$(cat /home/yoro/yoro_codebase/yoro-backend/yoro/celerybeat.pid) # Read pid of celerybeat master process 

kill -15 $PID  