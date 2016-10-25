#!/bin/bash

# simple script to start the NMAD uwsgi server
# !! DONOT run as ROOT !!

uwsgi /home/yoro/yoro_codebase/yoro-backend/yoro/yoro.ini  #ini file should be in the same folder from where this script is being run
