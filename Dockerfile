FROM dockerfile/nodejs

MAINTAINER n4sjamk

RUN ["useradd", "-m", "teamboard"]

ADD . /home/teamboard/teamboard-io

RUN cd /home/teamboard/teamboard-io && \
	npm install && \
	chown -R teamboard:teamboard .

RUN ["mkdir", "/home/teamboard/logs"]

CMD /usr/bin/sudo -u teamboard -E \
	/usr/local/bin/node /home/teamboard/teamboard-io/index.js \
	2>> /home/teamboard/logs/teamboard-io.err \
	1>> /home/teamboard/logs/teamboard-io.log
