FROM dockerfile/nodejs

MAINTAINER n4sjamk

RUN ["useradd", "-m", "teamboard"]

ADD . /home/teamboard/teamboard-io

RUN cd /home/teamboard/teamboard-io && \
	npm install && \
	chown -R teamboard:teamboard .
