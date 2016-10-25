# restart nmad server

# change directory to start/stop scripts
cd /home/yoro/yoro_codebase/yoro-backend/yoro/

# activate virtual env
source /home/yoro/virtualenvs/yoro/bin/activate

# stop nmad uwsgi server
source /home/yoro/yoro_codebase/yoro-backend/yoro/yoro_stop.sh

# add delay
sleep 2

# start nmad uwsgi server
source /home/yoro/yoro_codebase/yoro-backend/yoro/yoro_start.sh