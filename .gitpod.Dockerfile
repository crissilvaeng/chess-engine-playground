FROM python:3.8-buster

WORKDIR /root

ADD https://github.com/official-stockfish/Stockfish/archive/sf_13.tar.gz /root
RUN tar xvzf *.tar.gz && cd Stockfish-sf_13/src \
    && make net && make build ARCH=x86-64-modern

ADD https://komodochess.com/pub/komodo-12.zip /root
RUN unzip *.zip

FROM gitpod/workspace-full

WORKDIR /root

COPY --from=0 /root/Stockfish-sf_13/src/stockfish /usr/bin/stockfish
COPY --from=0 /root/komodo-12.*/Linux/komodo-*-linux /usr/bin/komodo
