#!/usr/bin/python
import commands, time, sys

"""
Run as root

Stop will kill all celery worker processes spawned via celery_start.sh

"""
# get count of celery processes
count = int(commands.getoutput("ps axf|grep python\ manage.py\ celery\ worker|grep -v grep|grep -c celery"))

# Call start/stop/restart/help based on command line arguments

get_celery_pids = "ps aux|grep python\ manage.py\ celery\ worker|grep -v grep|awk '{print $2}'|xargs"
get_celery_count = "ps axf|grep python\ manage.py\ celery\ worker|grep -v grep|grep -c celery"

"""
Shows number of celery processes running
"""
def status():

	if count == 0:

		print "No celery processes are running"

	else:

		print "Number of celery processes running : ", count

"""
Start celery processes
"""
def start():

	if count == 0:

		start_output = commands.getoutput("su yoro -c '/bin/bash celery_start.sh'")

		print start_output

	else:

		print "Celery processes already running!"

"""
Stop celery processes
"""
def stop():

	pids = commands.getoutput(get_celery_pids)

	pid_list = pids.split(" ")

	count = int(commands.getoutput(get_celery_count))

	print "Number of celery processes : ", count

	if count == 0:

		print "No celery processes to kill!"

	else:

		for pid in pid_list:

			# kill processes with sigkill
			commands.getoutput("kill -15 %s" % pid)

			print "Gracefully terminating celery process : " + pid

		# allow for task scheduler to process all kill signals
		time.sleep(2)

		print "Checking for zombie processes"

		zombie_pids = commands.getoutput(get_celery_pids)
		zombie_pid_list = zombie_pids.split(" ")
		count = int(commands.getoutput(get_celery_count))

		if count == 0:

			print "No zombie processes to kill!"

		else:

			for zombie in zombie_pid_list:

				commands.getoutput("kill -9 %s" %pid)

				print "Killed zombie : " + pid

			print "Killed all zombies!"

			time.sleep(1)


"""
Displays help message
"""
def help():
    print "USAGE: celery <OPTION> \n OPTIONS:\n status: Display the number of celery processes running "
    print " start: Spwan new celery processes \n stop: Stop all existing celery instances"
    print " help: display this help message"

if __name__ == "__main__":

	try:

		arg = sys.argv[1]

		if arg.lower() == "status":
			status()

		elif arg.lower() == "start":
			start()

		elif arg.lower() == "stop":
			stop()

		elif arg.lower() == "restart":
			stop()
			time.sleep(2)
			start()

		else:
			help()

	except IndexError:

		help()
