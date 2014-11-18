FROM dockerfile/nodejs

MAINTAINER n4sjamk

RUN ["useradd", "-m", "teamboard", "-u", "23456"]

ADD . /home/teamboard/teamboard-io

RUN cd /home/teamboard/teamboard-io && \
	npm install && \
	chown -R teamboard:teamboard .

RUN ["sudo", "-u", "teamboard", "mkdir", "/home/teamboard/logs"]

USER teamboard
CMD /usr/local/bin/node /home/teamboard/teamboard-io/index.js \
	2>> /home/teamboard/logs/teamboard-io.err \
	1>> /home/teamboard/logs/teamboard-io.log
