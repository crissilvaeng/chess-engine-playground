FROM python:3.8-buster

WORKDIR /root

ADD https://github.com/official-stockfish/Stockfish/archive/sf_13.tar.gz /root

RUN tar xvzf *.tar.gz && cd Stockfish-sf_13/src \
    && make net && make build ARCH=x86-64-modern

FROM gitpod/workspace-full

WORKDIR /root

COPY --from=0 /root/Stockfish-sf_13/src/stockfish /usr/bin/stockfish
